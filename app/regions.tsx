import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Region = {
  id: string;
  name: string;
  code: string;
};

type Province = {
  id: string;
  name: string;
  code: string;
  region_id: string;
};

export default function RegionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { profile, updateProfile } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<{ [key: string]: Province[] }>({});
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      setRegions(data || []);

      // Fetch provinces for each region
      const provincesData: { [key: string]: Province[] } = {};
      for (const region of (data || []) as Region[]) {
        const { data: regionProvinces, error: provincesError } = await supabase
          .from('provinces')
          .select('*')
          .eq('region_id', region.id)
          .order('name');

        if (provincesError) throw provincesError;
        provincesData[region.id] = regionProvinces || [];
      }

      setProvinces(provincesData);
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleProvinceSelect = async (provinceId: string) => {
    try {
      await updateProfile({
        region_id: selectedRegion,
        province_id: provinceId,
      });
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderRegion = ({ item }: { item: Region }) => (
    <TouchableOpacity
      style={[
        styles.regionItem,
        {
          backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
          borderColor: selectedRegion === item.id ? '#007AFF' : 'transparent',
        },
      ]}
      onPress={() => handleRegionSelect(item.id)}
    >
      <Text
        style={[
          styles.regionName,
          { color: colorScheme === 'dark' ? '#fff' : '#000' },
        ]}
      >
        {item.name}
      </Text>
      {selectedRegion === item.id && (
        <Ionicons name="checkmark" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderProvince = ({ item }: { item: Province }) => (
    <TouchableOpacity
      style={[
        styles.provinceItem,
        {
          backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
          borderColor: profile?.province_id === item.id ? '#007AFF' : 'transparent',
        },
      ]}
      onPress={() => handleProvinceSelect(item.id)}
    >
      <Text
        style={[
          styles.provinceName,
          { color: colorScheme === 'dark' ? '#fff' : '#000' },
        ]}
      >
        {item.name}
      </Text>
      {profile?.province_id === item.id && (
        <Ionicons name="checkmark" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#f2f2f7' },
      ]}
    >
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colorScheme === 'dark' ? '#fff' : '#000' },
          ]}
        >
          Select Region
        </Text>
        <FlatList
          data={regions}
          renderItem={renderRegion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {selectedRegion && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colorScheme === 'dark' ? '#fff' : '#000' },
            ]}
          >
            Select Province
          </Text>
          <FlatList
            data={provinces[selectedRegion]}
            renderItem={renderProvince}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  provinceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 