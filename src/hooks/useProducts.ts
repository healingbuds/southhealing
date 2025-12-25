import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DataSource = 'api' | 'none';

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
  dataSource: DataSource;
}

// S3 base URL for strain images
const S3_BASE = 'https://prod-profiles-backend.s3.amazonaws.com/';

// Map Alpha-2 to Alpha-3 country codes for Dr Green API
const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  ZA: 'ZAF',
  TH: 'THA',
  GB: 'GBR',
};

// Supported countries for product display
const SUPPORTED_COUNTRIES = ['PT', 'GB', 'ZA', 'TH'];

export function useProducts(countryCode: string = 'PT') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('none');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Validate country code
    if (!SUPPORTED_COUNTRIES.includes(countryCode)) {
      console.warn(`Unsupported country code: ${countryCode}`);
      setProducts([]);
      setDataSource('none');
      setError('Products are not available in your region');
      setIsLoading(false);
      return;
    }

    const alpha3Code = countryCodeMap[countryCode] || 'PRT';
    
    try {
      // Fetch strains exclusively from Dr Green API
      console.log(`Fetching strains from Dr Green API for country: ${alpha3Code}`);
      
      const { data, error: fnError } = await supabase.functions.invoke('drgreen-proxy', {
        body: {
          action: 'get-strains-legacy',
          countryCode: alpha3Code,
          orderBy: 'desc',
          take: 100,
          page: 1,
        },
      });

      if (!fnError && data?.success && data?.data?.strains?.length > 0) {
        console.log(`Received ${data.data.strains.length} strains from Dr Green API`);
        
        // Transform API response to our Product interface
        const transformedProducts: Product[] = data.data.strains.map((strain: any) => {
          // Build full image URL - API returns just filename, prepend S3 base
          let imageUrl = '/placeholder.svg';
          if (strain.imageUrl) {
            imageUrl = strain.imageUrl.startsWith('http') 
              ? strain.imageUrl 
              : `${S3_BASE}${strain.imageUrl}`;
          } else if (strain.image) {
            imageUrl = strain.image.startsWith('http')
              ? strain.image
              : `${S3_BASE}${strain.image}`;
          }

          // Parse effects from string or array
          let effects: string[] = [];
          if (Array.isArray(strain.effects)) {
            effects = strain.effects;
          } else if (Array.isArray(strain.feelings)) {
            effects = strain.feelings;
          } else if (typeof strain.feelings === 'string') {
            effects = strain.feelings.split(',').map((s: string) => s.trim());
          }

          // Parse terpenes/flavors
          let terpenes: string[] = [];
          if (Array.isArray(strain.flavour)) {
            terpenes = strain.flavour;
          } else if (typeof strain.flavour === 'string') {
            terpenes = strain.flavour.split(',').map((s: string) => s.trim());
          } else if (Array.isArray(strain.terpenes)) {
            terpenes = strain.terpenes;
          } else if (Array.isArray(strain.flavors)) {
            terpenes = strain.flavors;
          }

          // Check availability from strainLocations
          const location = strain.strainLocations?.[0];
          const isAvailable = location?.isAvailable ?? strain.availability ?? strain.isAvailable ?? true;
          const stock = location?.stockQuantity ?? strain.stock ?? strain.stockQuantity ?? 100;

          // Get price - try multiple possible fields
          const retailPrice = 
            parseFloat(strain.retailPrice) || 
            parseFloat(strain.pricePerGram) || 
            parseFloat(strain.price) || 
            parseFloat(location?.retailPrice) ||
            0;

          // Get THC/CBD - try multiple field names
          const thcContent = 
            parseFloat(strain.thc) || 
            parseFloat(strain.thcContent) || 
            parseFloat(strain.THC) ||
            0;
          const cbdContent = 
            parseFloat(strain.cbd) || 
            parseFloat(strain.cbdContent) || 
            parseFloat(strain.CBD) ||
            0;

          return {
            id: strain.id || strain._id,
            name: strain.name,
            description: strain.description || '',
            thcContent,
            cbdContent,
            retailPrice,
            availability: isAvailable,
            stock: stock,
            imageUrl,
            effects,
            terpenes,
            category: strain.category || strain.type || 'Hybrid',
            dataSource: 'api' as DataSource,
          };
        });
        
        setProducts(transformedProducts);
        setDataSource('api');
        setIsLoading(false);
        return;
      }
      
      // Log API error if any
      if (fnError) {
        console.warn('Dr Green API error:', fnError);
        setError('Unable to fetch products from the API');
      } else if (!data?.success) {
        console.warn('Dr Green API returned unsuccessful response:', data);
        setError('API returned an unsuccessful response');
      } else {
        console.warn('Dr Green API returned no strains for this country');
        setError(null); // No error, just no products
      }

      // No fallback - set empty products
      setProducts([]);
      setDataSource('none');
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setDataSource('none');
      setError('Failed to connect to the product service');
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  // Trigger sync from Dr Green API to local DB
  const syncFromApi = useCallback(async () => {
    console.log('Triggering strain sync from Dr Green API...');
    try {
      const alpha3Code = countryCodeMap[countryCode] || 'PRT';
      const { data, error } = await supabase.functions.invoke('sync-strains', {
        body: {
          countryCode: alpha3Code,
          take: 100,
          page: 1,
        },
      });
      if (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
      }
      console.log('Sync result:', data);
      // Refetch products after sync
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Sync exception:', err);
      return { success: false, error: 'Sync failed' };
    }
  }, [fetchProducts, countryCode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    dataSource,
    refetch: fetchProducts,
    syncFromApi,
  };
}
