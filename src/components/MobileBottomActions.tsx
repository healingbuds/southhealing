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
            {/* Glassmorphism Container */}
            <div className="mx-3 mb-2">
              <div className={cn(
                "rounded-2xl overflow-hidden",
                "bg-gradient-to-r from-[hsl(178,48%,18%)] via-[hsl(178,48%,20%)] to-[hsl(176,39%,17%)]",
                "backdrop-blur-xl",
                "border border-white/15",
                "shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3),0_8px_32px_-8px_rgba(0,0,0,0.4)]"
              )}>
                {/* Subtle top highlight line */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="px-4 py-4">
                  <div className="flex gap-3">
                    {/* Primary CTA - Check Eligibility */}
                    <button 
                      type="button"
                      onClick={() => setEligibilityDialogOpen(true)}
                      className={cn(
                        "flex-1 group relative overflow-hidden",
                        "font-semibold px-5 py-4 rounded-xl",
                        "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500",
                        "text-white",
                        "shadow-lg shadow-emerald-500/30",
                        "transition-all duration-300 ease-out",
                        "active:scale-[0.97]",
                        "min-h-[56px]",
                        "flex items-center justify-center gap-2",
                        "touch-manipulation"
                      )}
                    >
                      {/* Shine effect on hover/active */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-active:translate-x-full transition-transform duration-700" />
                      <span className="relative font-medium tracking-wide text-[15px]">
                        {t('nav.checkEligibility')}
                      </span>
                      <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-active:translate-x-1" />
                    </button>
                    
                    {/* Secondary Action */}
                    {user ? (
                      <button 
                        type="button"
                        onClick={handleLogout}
                        className={cn(
                          "flex-1 group",
                          "font-medium px-5 py-4 rounded-xl",
                          "bg-white/10 hover:bg-white/15 active:bg-white/20",
                          "text-white/90 hover:text-white",
                          "border border-white/20 hover:border-white/30",
                          "backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "active:scale-[0.97]",
                          "min-h-[56px]",
                          "flex items-center justify-center gap-2",
                          "touch-manipulation"
                        )}
                      >
                        <LogOut className="w-4 h-4 transition-transform duration-300 group-active:-translate-x-0.5" />
                        <span className="font-medium tracking-wide text-[15px]">{t('nav.signOut')}</span>
                      </button>
                    ) : (
                      <Link 
                        to="/auth"
                        className={cn(
                          "flex-1 group",
                          "font-medium px-5 py-4 rounded-xl",
                          "bg-white/10 hover:bg-white/15 active:bg-white/20",
                          "text-white/90 hover:text-white",
                          "border border-white/20 hover:border-white/30",
                          "backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "active:scale-[0.97]",
                          "min-h-[56px]",
                          "flex items-center justify-center gap-2",
                          "touch-manipulation"
                        )}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium tracking-wide text-[15px]">{t('nav.patientLogin')}</span>
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
