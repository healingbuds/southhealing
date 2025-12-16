import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, Leaf, Droplets, ShoppingCart, Minus, Plus, 
  Wind, Beaker, Heart, Clock, Shield, Star, Sparkles,
  AlertCircle, CheckCircle2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useProducts, Product } from '@/hooks/useProducts';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/hooks/use-toast';

export default function CultivarDetail() {
  const { cultivarId } = useParams<{ cultivarId: string }>();
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const { addToCart, isEligible, drGreenClient } = useShop();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const found = products.find(p => p.id === cultivarId);
      setProduct(found || null);
    }
  }, [products, cultivarId, isLoading]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!drGreenClient) {
      toast({
        title: "Registration Required",
        description: "Please register as a patient to purchase medical cannabis.",
        variant: "destructive",
      });
      navigate('/shop/register');
      return;
    }

    if (!isEligible) {
      toast({
        title: "Verification Pending",
        description: "Complete KYC verification to purchase.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      strain_id: product.id,
      strain_name: product.name,
      quantity,
      unit_price: product.retailPrice,
    });
    toast({
      title: "Added to cart",
      description: `${quantity}g of ${product.name} added to your cart.`,
    });
  };

  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'sativa':
        return {
          badge: 'bg-amber-500/25 text-amber-300 border-amber-400/40',
          gradient: 'from-amber-500/30 via-amber-500/5',
          accent: 'text-amber-400',
          ring: 'ring-amber-500/30',
        };
      case 'indica':
        return {
          badge: 'bg-violet-500/25 text-violet-300 border-violet-400/40',
          gradient: 'from-violet-500/30 via-violet-500/5',
          accent: 'text-violet-400',
          ring: 'ring-violet-500/30',
        };
      case 'hybrid':
        return {
          badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40',
          gradient: 'from-emerald-500/30 via-emerald-500/5',
          accent: 'text-emerald-400',
          ring: 'ring-emerald-500/30',
        };
      case 'cbd':
        return {
          badge: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40',
          gradient: 'from-cyan-500/30 via-cyan-500/5',
          accent: 'text-cyan-400',
          ring: 'ring-cyan-500/30',
        };
      default:
        return {
          badge: 'bg-slate-500/25 text-slate-300 border-slate-400/40',
          gradient: 'from-slate-500/30 via-slate-500/5',
          accent: 'text-slate-400',
          ring: 'ring-slate-500/30',
        };
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading cultivar details...</div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Cultivar Not Found</h1>
          <p className="text-muted-foreground">The cultivar you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/shop')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dispensary
          </Button>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const styles = getCategoryStyles(product.category);

  // Category descriptions for education
  const categoryInfo: Record<string, { title: string; description: string; benefits: string[] }> = {
    sativa: {
      title: 'Sativa Dominant',
      description: 'Sativa cultivars are known for their energizing and uplifting effects. They typically produce a cerebral, creative high that\'s great for daytime use.',
      benefits: ['Increased energy', 'Enhanced creativity', 'Mood elevation', 'Focus improvement'],
    },
    indica: {
      title: 'Indica Dominant',
      description: 'Indica cultivars provide deep relaxation and calming effects. They\'re ideal for evening use, helping with sleep and physical discomfort.',
      benefits: ['Deep relaxation', 'Pain relief', 'Sleep aid', 'Muscle relaxation'],
    },
    hybrid: {
      title: 'Hybrid Balance',
      description: 'Hybrid cultivars combine the best of both Sativa and Indica genetics, offering a balanced experience that can be tailored to your needs.',
      benefits: ['Balanced effects', 'Versatile use', 'Customized experience', 'Best of both worlds'],
    },
    cbd: {
      title: 'CBD Rich',
      description: 'CBD-dominant cultivars provide therapeutic benefits without significant psychoactive effects. Ideal for medical patients seeking relief.',
      benefits: ['Non-intoxicating', 'Anti-inflammatory', 'Anxiety relief', 'Therapeutic'],
    },
  };

  const currentCategoryInfo = categoryInfo[product.category.toLowerCase()] || categoryInfo.hybrid;

  return (
    <PageTransition>
      <Helmet>
        <title>{product.name} | Medical Cannabis Cultivar | HealingBuds</title>
        <meta name="description" content={product.description || `${product.name} - A premium ${product.category} cultivar with ${product.thcContent}% THC and ${product.cbdContent}% CBD. Available at HealingBuds dispensary.`} />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section with Image */}
        <section className={`relative overflow-hidden bg-gradient-to-b ${styles.gradient} to-background`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 py-8 lg:py-16">
            {/* Back button */}
            <Button 
              variant="ghost" 
              className="mb-6 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/shop')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dispensary
            </Button>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className={`relative aspect-square rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-900/90 border border-white/10 overflow-hidden ${styles.ring} ring-2`}>
                  {/* Ambient glow */}
                  <div className="absolute inset-[15%] rounded-full bg-gradient-radial from-white/10 via-white/3 to-transparent blur-3xl" />
                  
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-[80%] h-[80%] object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 12px 24px rgba(0,0,0,0.4))',
                    }}
                  />
                  
                  {/* Badges */}
                  <Badge 
                    className={`absolute top-6 left-6 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider border ${styles.badge}`}
                  >
                    {product.category}
                  </Badge>

                  {product.thcContent >= 25 && (
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-300">High Potency</span>
                    </div>
                  )}

                  {!product.availability && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-6 py-2">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Title & Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-muted-foreground">Premium Medical Cultivar</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
                    {product.name}
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {product.description || 'A carefully cultivated medical cannabis variety selected for its exceptional therapeutic properties and consistent quality.'}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    €{product.retailPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">per gram</span>
                </div>

                {/* Cannabinoid Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20">
                        <Leaf className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400/70 uppercase tracking-wide font-medium">THC Content</p>
                        <p className="text-3xl font-bold text-emerald-400">{product.thcContent.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20">
                        <Droplets className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-cyan-400/70 uppercase tracking-wide font-medium">CBD Content</p>
                        <p className="text-3xl font-bold text-cyan-400">{product.cbdContent.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">Select Quantity</span>
                      <p className="text-sm text-muted-foreground">{product.stock}g in stock</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-14 text-center font-bold text-xl">{quantity}g</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-3xl font-bold text-primary">
                      €{(product.retailPrice * quantity).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full h-14 text-lg font-semibold rounded-xl"
                    size="lg"
                    disabled={!product.availability}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    {product.availability ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Detailed Information Tabs */}
        <section className="container mx-auto px-4 py-12 lg:py-20">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto mb-8 bg-white/5 border border-white/10 p-1 rounded-xl h-auto flex-wrap">
              <TabsTrigger value="overview" className="flex-1 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex-1 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Effects & Benefits
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex-1 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Usage Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Category Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className={`text-xl font-bold mb-3 ${styles.accent}`}>
                    {currentCategoryInfo.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {currentCategoryInfo.description}
                  </p>
                  <div className="space-y-2">
                    {currentCategoryInfo.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Flavor Profile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    Terpene & Flavor Profile
                  </h3>
                  {product.terpenes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.terpenes.map((terpene) => (
                        <Badge
                          key={terpene}
                          variant="outline"
                          className="px-4 py-2 text-sm bg-background/30 border-white/15"
                        >
                          {terpene}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Terpene profile information coming soon.</p>
                  )}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Effects */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    Expected Effects
                  </h3>
                  {product.effects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {product.effects.map((effect) => (
                        <div
                          key={effect}
                          className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium">{effect}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Effects information coming soon.</p>
                  )}
                </motion.div>

                {/* Medical Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Therapeutic Benefits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Medical Grade</p>
                        <p className="text-sm text-muted-foreground">Cultivated under strict medical standards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Lab Tested</p>
                        <p className="text-sm text-muted-foreground">Verified cannabinoid content and purity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Consistent Quality</p>
                        <p className="text-sm text-muted-foreground">Batch-to-batch consistency guaranteed</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-300 mb-2">Medical Disclaimer</h3>
                      <p className="text-amber-200/80 text-sm">
                        This product is intended for medical use only. Always consult with your healthcare provider before starting any cannabis therapy. Dosage should be determined by your prescribing physician based on your individual needs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Start Low</h4>
                    <p className="text-sm text-muted-foreground">Begin with a small dose and wait to feel effects before increasing.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Go Slow</h4>
                    <p className="text-sm text-muted-foreground">Wait at least 2 hours between doses to properly gauge effects.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Track Progress</h4>
                    <p className="text-sm text-muted-foreground">Use the patient portal to log dosage and effects for optimal care.</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
