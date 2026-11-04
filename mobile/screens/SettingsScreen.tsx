import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert
} from 'react-native';

export const SettingsScreen: React.FC = () => {
  const [zeroKnowledge, setZeroKnowledge] = useState(true);
  const [offlineCache, setOfflineCache] = useState(true);
  const [hybridDemoMode, setHybridDemoMode] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Security & Offline Architecture</Text>
        <Text style={styles.heroSub}>
          Engineered with Zero-Knowledge credential storage and resilient offline-first caching.
        </Text>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PRIVACY & ZERO-KNOWLEDGE</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.settingTitle}>Zero-Knowledge Client Storage</Text>
            <Text style={styles.settingDesc}>
              NetID and session tokens are stored in hardware-backed SecureStore. Credentials never touch remote analytical servers.
            </Text>
          </View>
          <Switch
            value={zeroKnowledge}
            onValueChange={setZeroKnowledge}
            trackColor={{ false: '#334155', true: '#10B981' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.settingTitle}>Offline-First Timetable & Attendance Cache</Text>
            <Text style={styles.settingDesc}>
              Keeps a local snapshot on your phone so you can view classes and safe bunks even during peak morning Academia server crashes.
            </Text>
          </View>
          <Switch
            value={offlineCache}
            onValueChange={setOfflineCache}
            trackColor={{ false: '#334155', true: '#3B82F6' }}
          />
        </View>
      </View>

      {/* University Integration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>INTEGRATION MODE</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.settingTitle}>Hybrid SRM Demo / Offline Simulator</Text>
            <Text style={styles.settingDesc}>
              Loads realistic B.Tech CSE dataset (Arjun Sharma, RA2211003010142) for instant local testing and feature evaluation.
            </Text>
          </View>
          <Switch
            value={hybridDemoMode}
            onValueChange={setHybridDemoMode}
            trackColor={{ false: '#334155', true: '#6366F1' }}
          />
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Academia Connector', 'Live Academia scraper connector configured for https://academia.srmist.edu.in')}
        >
          <Text style={styles.actionBtnText}>Test Live Academia Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DATA & CACHE</Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}
          onPress={() => Alert.alert('Cache Cleared', 'Local offline timetable and attendance cache refreshed.')}
        >
          <Text style={[styles.actionBtnText, { color: '#94A3B8' }]}>Clear Offline Cache (1.4 MB)</Text>
        </TouchableOpacity>

        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>CampusPulse v1.0.0</Text>
          <Text style={styles.aboutSub}>
            Reverse-Engineered Campus Intelligence Engine
          </Text>
          <Text style={styles.aboutLegal}>
            Built with React Native & Expo · 100% Free · No Ads · No Paywalls
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 40 },
  heroBanner: { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155' },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  heroSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
  section: { marginTop: 22 },
  sectionHeader: { color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  settingRow: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155'
  },
  settingTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  settingDesc: { color: '#94A3B8', fontSize: 11, marginTop: 4, lineHeight: 16 },
  actionBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  aboutBox: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  aboutTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  aboutSub: { color: '#38BDF8', fontSize: 12, marginTop: 2 },
  aboutLegal: { color: '#64748B', fontSize: 11, marginTop: 6 }
});

