import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRegions, getProvinces } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Region = Database['public']['Tables']['regions']['Row'];
type Province = Database['public']['Tables']['provinces']['Row'];

interface RegionsContextType {
  regions: Region[] | null;
  provinces: { [key: string]: Province[] } | null;
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
  fetchProvinces: (regionId: string) => Promise<void>;
  getRegionById: (id: string) => Region | undefined;
  getProvinceById: (id: string) => Province | undefined;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export function RegionsProvider({ children }: { children: React.ReactNode }) {
  const [regions, setRegions] = useState<Region[] | null>(null);
  const [provinces, setProvinces] = useState<{ [key: string]: Province[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRegions();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async (regionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProvinces(regionId);
      setProvinces(prev => ({
        ...prev,
        [regionId]: data,
      }));
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setError('Failed to fetch provinces');
    } finally {
      setLoading(false);
    }
  };

  const getRegionById = (id: string) => {
    return regions?.find(region => region.id === id);
  };

  const getProvinceById = (id: string) => {
    if (!provinces) return undefined;
    for (const regionProvinces of Object.values(provinces)) {
      const province = regionProvinces.find(p => p.id === id);
      if (province) return province;
    }
    return undefined;
  };

  const value = {
    regions,
    provinces,
    loading,
    error,
    fetchRegions,
    fetchProvinces,
    getRegionById,
    getProvinceById,
  };

  return <RegionsContext.Provider value={value}>{children}</RegionsContext.Provider>;
}

export function useRegions() {
  const context = useContext(RegionsContext);
  if (context === undefined) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
} 