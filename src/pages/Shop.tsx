import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Truck, HeartPulse } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Cart } from '@/components/shop/Cart';
import { CartButton } from '@/components/shop/CartButton';
import { RestrictedRegionGate } from '@/components/shop/RestrictedRegionGate';
import { VerificationProgress } from '@/components/shop/VerificationProgress';
import { useShop } from '@/context/ShopContext';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Medical Grade',
    description: 'All products are pharmaceutical-grade quality',
  },
  {
    icon: Leaf,
    title: 'Lab Tested',
    description: 'Third-party tested for purity and potency',
  },
  {
    icon: Truck,
    title: 'Discreet Delivery',
    description: 'Secure and confidential shipping',
  },
  {
    icon: HeartPulse,
    title: 'Patient Support',
    description: 'Dedicated medical support team',
  },
];

const countries = [
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
];

export default function Shop() {
  const { countryCode, setCountryCode, drGreenClient, isEligible, syncVerificationFromDrGreen } = useShop();
  const geoLocation = useGeoLocation();
  const { t } = useTranslation('shop');

  // Auto-detect country on mount
  useEffect(() => {
    const supportedCountries = ['PT', 'ZA', 'TH', 'GB'];
    if (supportedCountries.includes(geoLocation.countryCode) && !drGreenClient) {
      setCountryCode(geoLocation.countryCode);
    }
  }, [geoLocation.countryCode, setCountryCode, drGreenClient]);

  // Background polling for verification status (every 3 minutes)
  useEffect(() => {
    // Only poll if user has a client record but is not yet eligible
    if (!drGreenClient || isEligible) return;

    // Initial sync
    syncVerificationFromDrGreen();

    // Set up interval for polling every 3 minutes
    const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
    const intervalId = setInterval(() => {
      console.log('Background sync: checking verification status...');
      syncVerificationFromDrGreen();
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [drGreenClient, isEligible, syncVerificationFromDrGreen]);

  return (
    <>
      <SEOHead
        title={`${t('title')} | Dr. Green - Premium Cultivars`}
        description="Browse our selection of pharmaceutical-grade medical cannabis cultivars. Lab-tested, doctor-approved products for qualified patients."
        keywords="medical cannabis, CBD, THC, cultivars, pharmaceutical grade, Portugal, medical marijuana, dispensary"
      />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-28 sm:pt-32 pb-8 sm:pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Cultivars
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
                {t('subtitle')}
              </p>

              {/* Eligibility status - Verified badge with subtle indicator */}
              {drGreenClient && isEligible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium bg-primary/10 border border-primary/25 text-primary"
                >
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide text-xs font-semibold uppercase">
                    Verified Medical Patient
                  </span>
                </motion.div>
              )}

              {/* Pending verification status */}
              {drGreenClient && !isEligible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium bg-muted border border-border text-muted-foreground"
                >
                  <div className="p-1.5 rounded-lg bg-muted-foreground/10">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide text-xs font-semibold">Verification Pending</span>
                </motion.div>
              )}

              {/* Verification Progress Tracker */}
              {drGreenClient && <VerificationProgress />}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-6 sm:py-8 border-y border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start sm:items-center gap-2 sm:gap-3"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs sm:text-sm">
                      {benefit.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Products - gated by region restrictions */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <RestrictedRegionGate countryCode={countryCode}>
              <ProductGrid />
            </RestrictedRegionGate>
          </div>
        </section>

        {/* Floating cart button (mobile) */}
        <div className="fixed bottom-24 right-4 z-50 md:hidden">
          <CartButton />
        </div>

        {/* Cart drawer */}
        <Cart />

        <Footer />
      </div>
    </>
  );
}
