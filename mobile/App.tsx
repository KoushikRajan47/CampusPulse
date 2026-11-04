import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { DashboardScreen } from './screens/DashboardScreen';
import { ODAuditorScreen } from './screens/ODAuditorScreen';
import { ClashSimulatorScreen } from './screens/ClashSimulatorScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type Tab = 'dashboard' | 'od' | 'simulator' | 'timetable' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigateTab={(t) => setActiveTab(t as Tab)} />;
      case 'od':
        return <ODAuditorScreen />;
      case 'simulator':
        return <ClashSimulatorScreen />;
      case 'timetable':
        return <TimetableScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigateTab={(t) => setActiveTab(t as Tab)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>CP</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>CampusPulse</Text>
            <Text style={styles.appTagline}>SRM Intelligence Engine</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Hybrid Online</Text>
          </View>
        </View>
      </View>

      {/* Main Screen Body */}
      <View style={styles.body}>{renderScreen()}</View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
            Attendance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'od' && styles.tabItemActive]}
          onPress={() => setActiveTab('od')}
        >
          <Text style={styles.tabIcon}>🚨</Text>
          <Text style={[styles.tabLabel, activeTab === 'od' && styles.tabLabelActive]}>
            OD Auditor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'simulator' && styles.tabItemActive]}
          onPress={() => setActiveTab('simulator')}
        >
          <Text style={styles.tabIcon}>🎰</Text>
          <Text style={[styles.tabLabel, activeTab === 'simulator' && styles.tabLabelActive]}>
            Clash Sim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'timetable' && styles.tabItemActive]}
          onPress={() => setActiveTab('timetable')}
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[styles.tabLabel, activeTab === 'timetable' && styles.tabLabelActive]}>
            Timetable
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
            Security
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0F19' },
  topHeader: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  logoBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  appTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  appTagline: { color: '#64748B', fontSize: 10, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { color: '#CBD5E1', fontSize: 10, fontWeight: '600' },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 8 },
  tabItemActive: { backgroundColor: '#1E293B' },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: '#60A5FA', fontWeight: '700' }
});

