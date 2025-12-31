import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Healing Buds logo - base64 encoded PNG
    // This is the white logo for email headers
    const logoBase64 = "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";

    // Decode base64 to binary
    const binaryString = atob(logoBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log(`Uploading logo to email-assets bucket (${bytes.length} bytes)`);

    // Upload to storage
    const { data, error } = await supabase.storage
      .from("email-assets")
      .upload("hb-logo-white.png", bytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("email-assets")
      .getPublicUrl("hb-logo-white.png");

    console.log("Logo uploaded successfully:", urlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Logo uploaded to email-assets bucket",
        url: urlData.publicUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
