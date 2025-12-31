import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ComplianceGuardProps {
  children: ReactNode;
}

export function ComplianceGuard({ children }: ComplianceGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { drGreenClient, isLoading } = useShop();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not authenticated - redirect to auth with return path
        navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        return;
      }

      // User is authenticated, now check compliance
      if (!isLoading) {
        const isVerified = drGreenClient?.is_kyc_verified === true && 
                          drGreenClient?.admin_approval === 'VERIFIED';
        
        if (!isVerified) {
          // Not verified - redirect to status page
          navigate('/dashboard/status', { replace: true });
        }
      }
    };

    checkAuth();
  }, [drGreenClient, isLoading, navigate, location.pathname]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is verified
  const isVerified = drGreenClient?.is_kyc_verified === true && 
                    drGreenClient?.admin_approval === 'VERIFIED';

  // If not verified, don't render children (redirect will happen in useEffect)
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
