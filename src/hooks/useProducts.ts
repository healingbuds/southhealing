import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  thcContent: number;
  cbdContent: number;
  retailPrice: number;
  availability: boolean;
  stock: number;
  imageUrl: string;
  effects: string[];
  terpenes: string[];
  category: string;
}

// Mock data for development - replace with actual API calls
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Purple Haze',
    description: 'A classic sativa-dominant strain known for its uplifting and creative effects. Perfect for daytime use.',
    thcContent: 18.5,
    cbdContent: 0.5,
    retailPrice: 12.50,
    availability: true,
    stock: 50,
    imageUrl: '/placeholder.svg',
    effects: ['Euphoric', 'Creative', 'Uplifting'],
    terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'],
    category: 'Sativa',
  },
  {
    id: '2',
    name: 'OG Kush',
    description: 'A legendary indica-dominant hybrid with potent stress-relieving properties. Ideal for evening relaxation.',
    thcContent: 22.0,
    cbdContent: 1.0,
    retailPrice: 14.00,
    availability: true,
    stock: 35,
    imageUrl: '/placeholder.svg',
    effects: ['Relaxing', 'Euphoric', 'Sleepy'],
    terpenes: ['Limonene', 'Myrcene', 'Linalool'],
    category: 'Indica',
  },
  {
    id: '3',
    name: 'Blue Dream',
    description: 'A balanced hybrid offering gentle cerebral invigoration paired with full-body relaxation.',
    thcContent: 19.0,
    cbdContent: 2.0,
    retailPrice: 13.00,
    availability: true,
    stock: 42,
    imageUrl: '/placeholder.svg',
    effects: ['Balanced', 'Happy', 'Relaxed'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'Hybrid',
  },
  {
    id: '4',
    name: 'Charlotte\'s Web',
    description: 'A high-CBD strain specifically developed for therapeutic use. Minimal psychoactive effects.',
    thcContent: 0.3,
    cbdContent: 17.0,
    retailPrice: 11.00,
    availability: true,
    stock: 60,
    imageUrl: '/placeholder.svg',
    effects: ['Calm', 'Focused', 'Pain Relief'],
    terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'],
    category: 'CBD',
  },
  {
    id: '5',
    name: 'Sour Diesel',
    description: 'An invigorating sativa with fast-acting energizing and mood-lifting effects.',
    thcContent: 20.0,
    cbdContent: 0.2,
    retailPrice: 13.50,
    availability: false,
    stock: 0,
    imageUrl: '/placeholder.svg',
    effects: ['Energetic', 'Happy', 'Creative'],
    terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'],
    category: 'Sativa',
  },
  {
    id: '6',
    name: 'Granddaddy Purple',
    description: 'A famous indica known for its potent relaxation and sleep-inducing properties.',
    thcContent: 23.0,
    cbdContent: 0.5,
    retailPrice: 15.00,
    availability: true,
    stock: 28,
    imageUrl: '/placeholder.svg',
    effects: ['Sleepy', 'Relaxed', 'Happy'],
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    category: 'Indica',
  },
];

// Map Alpha-2 to Alpha-3 country codes for Dr Green API
const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  ZA: 'ZAF',
  TH: 'THA',
  GB: 'GBR',
};

export function useProducts(countryCode: string = 'PT') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Convert to Alpha-3 for API
    const alpha3Code = countryCodeMap[countryCode] || 'PRT';

    try {
      // Try to fetch from Dr Green API via edge function
      const { data, error: fnError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains',
          countryCode: alpha3Code,
        },
      });

      if (fnError) {
        console.warn('Dr Green API unavailable, using mock data:', fnError);
        setProducts(mockProducts);
      } else if (data?.strains) {
        // Transform API response to our Product interface
        const transformedProducts: Product[] = data.strains.map((strain: any) => ({
          id: strain.id,
          name: strain.name,
          description: strain.description || '',
          thcContent: strain.thcContent || 0,
          cbdContent: strain.cbdContent || 0,
          retailPrice: strain.retailPrice || 0,
          availability: strain.availability ?? true,
          stock: strain.stock || 0,
          imageUrl: strain.imageUrl || '/placeholder.svg',
          effects: strain.effects || [],
          terpenes: strain.terpenes || [],
          category: strain.category || 'Hybrid',
        }));
        setProducts(transformedProducts);
      } else {
        // Use mock data if no strains returned
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Fallback to mock data
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
