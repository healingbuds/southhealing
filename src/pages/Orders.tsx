import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { OrdersTable } from '@/components/shop/OrdersTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Loader2, Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Orders() {
  const { orders, isLoading, reorder } = useOrderTracking();
  const navigate = useNavigate();
  const [isReordering, setIsReordering] = useState(false);

  const handleReorder = async (order: any) => {
    setIsReordering(true);
    try {
      await reorder(order);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Order History | Healing Buds"
        description="View your order history and track your medical cannabis orders."
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Order History</h1>
                  <p className="text-muted-foreground mt-1">
                    View and manage your previous orders
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/shop')}
                  className="rounded-2xl"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Shop
                </Button>
              </div>

              {isLoading ? (
                <Card className="rounded-3xl border-border/50">
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
                <Card className="rounded-3xl border-border/50">
                  <CardContent className="text-center py-16">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl mb-2">No Orders Yet</CardTitle>
                    <CardDescription className="mb-6">
                      You haven't placed any orders. Start your wellness journey today.
                    </CardDescription>
                    <Button
                      onClick={() => navigate('/shop')}
                      className="rounded-2xl"
                    >
                      Browse Treatments
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable
                  orders={orders}
                  onReorder={handleReorder}
                  isReordering={isReordering}
                />
              )}
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
