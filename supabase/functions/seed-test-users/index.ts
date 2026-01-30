import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Real user accounts - these will sync with Dr. Green API on login
// NOTE: createClient: false means NO mock drgreen_clients record is created
// The app will fetch their real client data from Dr. Green API via email lookup
const TEST_USERS = [
  {
    email: "admin@healingbuds.test",
    password: "Admin123!",
    fullName: "Admin User",
    createClient: false, // Admin doesn't need drgreen client record
    role: "admin",
  },
  // Real user accounts - provide actual Dr. Green registered emails
  // These users exist in Dr. Green API and will sync on login
  {
    email: "scott.norris@norrisent.co.uk", // Scott's Dr. Green registered email
    password: "TempPassword123!",
    fullName: "Scott Norris",
    createClient: false, // Will sync from Dr. Green API
    role: null,
  },
  {
    email: "kayliegh.norris@norrisent.co.uk", // Kayliegh's Dr. Green registered email
    password: "TempPassword123!",
    fullName: "Kayliegh Norris",
    createClient: false, // Will sync from Dr. Green API
    role: null,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: Array<{ email: string; status: string; userId?: string; error?: string }> = [];

    for (const testUser of TEST_USERS) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === testUser.email);

        let userId: string;

        if (existingUser) {
          // Update existing user password and verify email
          const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: testUser.password,
              email_confirm: true,
            }
          );
          if (updateError) throw updateError;
          userId = existingUser.id;
          console.log(`Updated existing user: ${testUser.email}`);
        } else {
          // Create new user with verified email
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: testUser.password,
            email_confirm: true,
            user_metadata: { full_name: testUser.fullName },
          });
          if (createError) throw createError;
          userId = newUser.user.id;
          console.log(`Created new user: ${testUser.email}`);
        }

        // Upsert profile
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            { id: userId, full_name: testUser.fullName },
            { onConflict: "id" }
          );
        if (profileError) {
          console.error(`Profile error for ${testUser.email}:`, profileError);
        }

        // For users with createClient: false, ensure NO mock drgreen_clients record exists
        // This forces the app to sync from the real Dr. Green API on login
        if (!testUser.createClient) {
          // Delete any existing mock client record
          const { error: deleteError } = await supabaseAdmin
            .from("drgreen_clients")
            .delete()
            .eq("user_id", userId);
          
          if (deleteError) {
            console.error(`Failed to delete client record for ${testUser.email}:`, deleteError);
          } else {
            console.log(`Ensured no mock client record for: ${testUser.email}`);
          }
        }

        // Assign role if needed
        if (testUser.role) {
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .upsert(
              { user_id: userId, role: testUser.role },
              { onConflict: "user_id,role" }
            );
          if (roleError) {
            console.error(`Role error for ${testUser.email}:`, roleError);
          }
        }

        results.push({ email: testUser.email, status: "success", userId });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error processing ${testUser.email}:`, errorMessage);
        results.push({ email: testUser.email, status: "error", error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        note: "Users with createClient: false will sync their client data from Dr. Green API on first login"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
