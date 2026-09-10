import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getSettings, updateSettings } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Database } from '@/types/supabase';

type OfflineDeliveryMethod = Database['public']['Enums']['offline_delivery_method'];

// Cross-platform simple select row
function SelectOption({
  label,
  value,
  selected,
  onSelect,
  isDark,
}: {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      style={[
        selectStyles.option,
        selected && selectStyles.optionSelected,
        { borderColor: isDark ? '#555' : '#E0E0E0' },
      ]}
    >
      <Text style={[selectStyles.optionText, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark" size={16} color="#007AFF" />}
    </TouchableOpacity>
  );
}

const selectStyles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 6,
  },
  optionSelected: {
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
  },
});

export default function SettingsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [autoMessageDisplay, setAutoMessageDisplay] = useState(true);
  const [offlineDelivery, setOfflineDelivery] = useState<OfflineDeliveryMethod>('server');

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getSettings(user.id);
      setSettings(data);
      
      setTheme(data.theme || 'light');
      setNotifications(data.notifications !== false);
      setAutoMessageDisplay(data.auto_message_display !== false);
      setOfflineDelivery((data.offline_delivery || 'server') as OfflineDeliveryMethod);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updates = {
        theme,
        notifications,
        auto_message_display: autoMessageDisplay,
        offline_delivery: offlineDelivery,
      };
      
      await updateSettings(user.id, updates);
      setSettings({ ...settings, ...updates });
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Appearance
          </Text>
          <Text style={[styles.settingLabel, { color: isDark ? '#AAAAAA' : '#555', marginBottom: 8 }]}>
            Theme
          </Text>
          {(['light', 'dark', 'system'] as const).map((val) => (
            <SelectOption
              key={val}
              label={val === 'light' ? 'Light' : val === 'dark' ? 'Dark' : 'System Default'}
              value={val}
              selected={theme === val}
              onSelect={setTheme}
              isDark={isDark}
            />
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notifications
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Enable Notifications
              </Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new messages
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Auto Display Messages
              </Text>
              <Text style={styles.settingDescription}>
                Automatically display new messages when received
              </Text>
            </View>
            <Switch
              value={autoMessageDisplay}
              onValueChange={setAutoMessageDisplay}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoMessageDisplay ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Messaging
          </Text>
          <Text style={[styles.settingLabel, { color: isDark ? '#AAAAAA' : '#555', marginBottom: 8 }]}>
            Offline Delivery Method
          </Text>
          {(['server', 'sms', 'email'] as OfflineDeliveryMethod[]).map((val) => (
            <SelectOption
              key={val}
              label={val === 'server' ? 'Server' : val === 'sms' ? 'SMS' : 'Email'}
              value={val}
              selected={offlineDelivery === val}
              onSelect={(v) => setOfflineDelivery(v as OfflineDeliveryMethod)}
              isDark={isDark}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    width: 150,
  },
  picker: {
    height: 40,
    width: 150,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});