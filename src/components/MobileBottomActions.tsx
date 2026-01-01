import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import EligibilityDialog from "./EligibilityDialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowRight, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface MobileBottomActionsProps {
  menuOpen?: boolean;
}

const MobileBottomActions = ({ menuOpen = false }: MobileBottomActionsProps) => {
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('common');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('nav.signOut'),
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <>
      {/* Fixed Bottom Action Bar - Premium Pharmaceutical Design */}
      <AnimatePresence>
        {!menuOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[60]"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}
          >
            {/* Premium Pharmaceutical Container */}
            <div className="mx-4 mb-3">
              <div className={cn(
                "rounded-3xl overflow-hidden",
                "bg-gradient-to-r from-[hsl(var(--pharma-teal-dark))] via-[hsl(175,45%,22%)] to-[hsl(var(--pharma-teal-dark))]",
                "backdrop-blur-xl",
                "border border-white/10",
                "shadow-[0_-8px_32px_-4px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
              )}>
                {/* Subtle top accent line */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                
                <div className="px-5 py-4">
                  <div className="flex gap-3">
                    {/* Primary CTA - Check Eligibility */}
                    <button 
                      type="button"
                      onClick={() => setEligibilityDialogOpen(true)}
                      className={cn(
                        "flex-[1.2] group relative overflow-hidden",
                        "font-jakarta font-semibold px-6 py-4 rounded-2xl",
                        "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400",
                        "text-white",
                        "shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                        "transition-all duration-300 ease-out",
                        "active:scale-[0.97] active:shadow-[0_2px_12px_-2px_rgba(16,185,129,0.4)]",
                        "min-h-[56px]",
                        "flex items-center justify-center gap-2.5",
                        "touch-manipulation"
                      )}
                    >
                      {/* Shine effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-active:translate-x-full transition-transform duration-500" />
                      <span className="relative tracking-wide text-[15px] drop-shadow-sm">
                        {t('nav.checkEligibility')}
                      </span>
                      <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-active:translate-x-1" />
                    </button>
                    
                    {/* Secondary Action - Refined Glass Style */}
                    {user ? (
                      <button 
                        type="button"
                        onClick={handleLogout}
                        className={cn(
                          "flex-1 group relative overflow-hidden",
                          "font-jakarta font-medium px-5 py-4 rounded-2xl",
                          "bg-white/8",
                          "text-white/90 hover:text-white",
                          "border border-white/15 hover:border-white/25",
                          "backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "active:scale-[0.97] active:bg-white/12",
                          "min-h-[56px]",
                          "flex items-center justify-center gap-2",
                          "touch-manipulation"
                        )}
                      >
                        <LogOut className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="tracking-wide text-[14px]">{t('nav.signOut')}</span>
                      </button>
                    ) : (
                      <Link 
                        to="/auth"
                        className={cn(
                          "flex-1 group relative overflow-hidden",
                          "font-jakarta font-medium px-5 py-4 rounded-2xl",
                          "bg-white/8",
                          "text-white/90 hover:text-white",
                          "border border-white/15 hover:border-amber-400/30",
                          "backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "active:scale-[0.97] active:bg-white/12",
                          "min-h-[56px]",
                          "flex items-center justify-center gap-2",
                          "touch-manipulation"
                        )}
                      >
                        {/* Subtle gold accent on hover */}
                        <span className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <UserIcon className="relative w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="relative tracking-wide text-[14px]">{t('nav.patientLogin')}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eligibility Dialog */}
      <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />
    </>
  );
};

export default MobileBottomActions;
