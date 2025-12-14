import { supabase } from '@/integrations/supabase/client';

interface DrGreenResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

// Country code conversion map (Alpha-2 to Alpha-3)
const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  GB: 'GBR',
  ZA: 'ZAF',
  TH: 'THA',
  US: 'USA',
};

export function useDrGreenApi() {
  const callProxy = async <T = unknown>(
    action: string,
    data?: Record<string, unknown>
  ): Promise<DrGreenResponse<T>> => {
    try {
      const { data: response, error } = await supabase.functions.invoke('drgreen-proxy', {
        body: { action, ...data },
      });

      if (error) {
        console.error('Dr Green API error:', error);
        return { data: null, error: error.message };
      }

      return { data: response as T, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Dr Green API exception:', err);
      return { data: null, error: message };
    }
  };

  // Create an order with the Dr Green API
  const createOrder = async (orderData: {
    clientId: string;
    items: Array<{
      strainId: string;
      quantity: number;
      unitPrice: number;
    }>;
    shippingAddress?: {
      street: string;
      city: string;
      postalCode: string;
      countryCode: string;
    };
  }) => {
    return callProxy<{
      orderId: string;
      status: string;
      totalAmount: number;
    }>('create-order', { data: orderData });
  };

  // Create a payment for an order
  const createPayment = async (paymentData: {
    orderId: string;
    amount: number;
    currency: string;
    clientId: string;
  }) => {
    return callProxy<{
      paymentId: string;
      status: string;
      paymentUrl?: string;
    }>('create-payment', { data: paymentData });
  };

  // Get payment status
  const getPayment = async (paymentId: string) => {
    return callProxy<{
      paymentId: string;
      status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
      amount: number;
      orderId: string;
    }>('get-payment', { paymentId });
  };

  // Get order details
  const getOrder = async (orderId: string) => {
    return callProxy<{
      orderId: string;
      status: string;
      items: Array<{
        strainId: string;
        quantity: number;
        unitPrice: number;
      }>;
      totalAmount: number;
      paymentStatus: string;
    }>('get-order', { orderId });
  };

  // Get strains by country
  const getStrains = async (countryCode: string) => {
    const alpha3Code = countryCodeMap[countryCode] || countryCode;
    return callProxy<Array<{
      id: string;
      name: string;
      description: string;
      thcContent: number;
      cbdContent: number;
      retailPrice: number;
      availability: boolean;
      images: string[];
    }>>('get-strains', { countryCode: alpha3Code });
  };

  return {
    createOrder,
    createPayment,
    getPayment,
    getOrder,
    getStrains,
    callProxy,
  };
}
