import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Lock, UserCircle, FileText, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'complete' | 'current' | 'pending';
}

export default function DashboardStatus() {
  const navigate = useNavigate();
  const { drGreenClient, isLoading } = useShop();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (!user) {
        navigate('/auth?redirect=/dashboard/status', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // If user becomes verified, redirect to shop
  useEffect(() => {
    if (!isLoading && drGreenClient) {
      const isVerified = drGreenClient.is_kyc_verified === true && 
                        drGreenClient.admin_approval === 'VERIFIED';
      if (isVerified) {
        navigate('/shop', { replace: true });
      }
    }
  }, [drGreenClient, isLoading, navigate]);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine current verification status
  const hasClient = !!drGreenClient;
  const isKycVerified = drGreenClient?.is_kyc_verified === true;
  const adminApproval = drGreenClient?.admin_approval;

  const getStepStatus = (stepId: string): 'complete' | 'current' | 'pending' => {
    switch (stepId) {
      case 'registration':
        return hasClient ? 'complete' : 'current';
      case 'kyc':
        if (!hasClient) return 'pending';
        return isKycVerified ? 'complete' : 'current';
      case 'review':
        if (!hasClient || !isKycVerified) return 'pending';
        if (adminApproval === 'VERIFIED') return 'complete';
        if (adminApproval === 'PENDING' || adminApproval === 'SUBMITTED') return 'current';
        return 'pending';
      case 'access':
        if (adminApproval === 'VERIFIED') return 'complete';
        return 'pending';
      default:
        return 'pending';
    }
  };

  const steps: VerificationStep[] = [
    {
      id: 'registration',
      title: 'Registration Complete',
      description: 'Your medical profile has been submitted',
      icon: UserCircle,
      status: getStepStatus('registration'),
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      description: 'Complete KYC verification process',
      icon: FileText,
      status: getStepStatus('kyc'),
    },
    {
      id: 'review',
      title: 'Medical Review',
      description: 'Your profile is being reviewed by our medical team',
      icon: Shield,
      status: getStepStatus('review'),
    },
    {
      id: 'access',
      title: 'Dispensary Access',
      description: 'Full access to medical cannabis products',
      icon: Lock,
      status: getStepStatus('access'),
    },
  ];

  const getStatusMessage = () => {
    if (!hasClient) {
      return 'Please complete your medical profile registration to continue.';
    }
    if (!isKycVerified) {
      return 'Please complete identity verification (KYC) to proceed with your application.';
    }
    if (adminApproval === 'REJECTED') {
      return 'Your application has been declined. Please contact support for more information.';
    }
    return 'Your medical profile is currently under review. You cannot access the dispensary until verified.';
  };

  const getActionButton = () => {
    if (!hasClient) {
      return (
        <Button asChild size="lg" className="rounded-2xl">
          <Link to="/shop/register">Complete Registration</Link>
        </Button>
      );
    }
    if (!isKycVerified && drGreenClient?.kyc_link) {
      return (
        <Button asChild size="lg" className="rounded-2xl">
          <a href={drGreenClient.kyc_link} target="_blank" rel="noopener noreferrer">
            Complete KYC Verification
          </a>
        </Button>
      );
    }
    return (
      <Button asChild variant="outline" size="lg" className="rounded-2xl">
        <Link to="/shop/register">Update Medical Profile</Link>
      </Button>
    );
  };

  return (
    <>
      <SEOHead
        title="Account Status | Healing Buds"
        description="View your account verification status and complete any pending steps."
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border/50 shadow-lg rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                  <CardTitle className="text-2xl font-semibold">Account Pending Approval</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {getStatusMessage()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Progress Tracker */}
                  <div className="space-y-4 mb-8">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isComplete = step.status === 'complete';
                      const isCurrent = step.status === 'current';

                      return (
                        <div key={step.id} className="flex items-start gap-4">
                          {/* Step indicator */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isComplete
                                  ? 'bg-emerald-500 text-white'
                                  : isCurrent
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : isCurrent ? (
                                <Clock className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            {index < steps.length - 1 && (
                              <div
                                className={`w-0.5 h-8 mt-2 ${
                                  isComplete ? 'bg-emerald-500' : 'bg-muted'
                                }`}
                              />
                            )}
                          </div>

                          {/* Step content */}
                          <div className="flex-1 pt-1">
                            <h3
                              className={`font-medium ${
                                isComplete
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isCurrent
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {step.title}
                              {isComplete && ' ✓'}
                              {isCurrent && ' (In Progress)'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    {getActionButton()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
