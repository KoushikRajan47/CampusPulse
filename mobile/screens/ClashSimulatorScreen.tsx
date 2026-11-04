import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ApiService } from '../services/api';
import { CatalogCourse, ValidationResult } from '../types';

export const ClashSimulatorScreen: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [activePlan, setActivePlan] = useState<'Plan A' | 'Plan B' | 'Plan C'>('Plan A');
  const [savedPlans, setSavedPlans] = useState<Record<string, string[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [catalogRes, plansRes] = await Promise.all([
        ApiService.getCatalog(),
        ApiService.getPlans()
      ]);
      setCatalog(catalogRes);
      setSavedPlans(plansRes.rawPlans);

      const initialSelected = plansRes.rawPlans[activePlan] || [];
      setSelectedIds(initialSelected);

      const valRes = await ApiService.validateSchedule(initialSelected);
      setValidation(valRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPlan = async (plan: 'Plan A' | 'Plan B' | 'Plan C') => {
    setActivePlan(plan);
    const ids = savedPlans[plan] || [];
    setSelectedIds(ids);
    const valRes = await ApiService.validateSchedule(ids);
    setValidation(valRes);
  };

  const toggleCourse = async (courseId: string) => {
    let newIds: string[];
    if (selectedIds.includes(courseId)) {
      newIds = selectedIds.filter((id) => id !== courseId);
    } else {
      newIds = [...selectedIds, courseId];
    }
    setSelectedIds(newIds);
    const valRes = await ApiService.validateSchedule(newIds);
    setValidation(valRes);

    // Update in-memory plan
    setSavedPlans((prev) => ({
      ...prev,
      [activePlan]: newIds
    }));
  };

  const handleSavePlan = async () => {
    try {
      await ApiService.savePlan(activePlan, selectedIds);
      Alert.alert('Plan Saved', `${activePlan} has been updated with ${selectedIds.length} course(s).`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save plan.');
    }
  };

  if (loading || !validation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Course Catalog & Slot Matrix...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Course Registration Clash Simulator</Text>
        <Text style={styles.heroSub}>
          Pre-plan clash-free schedules before the registration portal opens. Test backup slots and copy course codes instantly.
        </Text>
      </View>

      {/* Plan Selector */}
      <View style={styles.planSelectorRow}>
        {(['Plan A', 'Plan B', 'Plan C'] as const).map((plan) => (
          <TouchableOpacity
            key={plan}
            style={[styles.planTab, activePlan === plan && styles.planTabActive]}
            onPress={() => handleSelectPlan(plan)}
          >
            <Text style={[styles.planTabText, activePlan === plan && styles.planTabTextActive]}>{plan}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conflict Status Banner */}
      <View style={[styles.statusBanner, validation.isValid ? styles.statusValid : styles.statusClash]}>
        <Text style={styles.statusIcon}>{validation.isValid ? '✅' : '🚨'}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.statusTitle}>
            {validation.isValid ? 'Clash-Free Combination' : `${validation.conflictCount} Slot Conflict(s) Detected!`}
          </Text>
          <Text style={styles.statusSub}>{validation.statusMessage}</Text>
        </View>
      </View>

      {/* Clashing Details (if any) */}
      {validation.conflicts.map((conflict, idx) => (
        <View key={idx} style={styles.conflictCard}>
          <Text style={styles.conflictSlot}>Slot {conflict.slot} Overlap Conflict</Text>
          <Text style={styles.conflictReason}>{conflict.reason}</Text>
        </View>
      ))}

      {/* Quick-Copy Codes Bar (Crucial during fast SRM registration) */}
      <View style={styles.quickCopyBox}>
        <View style={styles.quickCopyHeader}>
          <Text style={styles.quickCopyTitle}>⚡ Quick-Copy Portal String</Text>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => {
              Alert.alert('Copied!', `Copied: ${validation.quickCopyCodes}`);
            }}
          >
            <Text style={styles.copyBtnText}>Copy Codes</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyCodesText}>{validation.quickCopyCodes || 'No courses selected'}</Text>
      </View>

      {/* Stats Summary & Save Action */}
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryTitle}>Total: {validation.totalCredits} Credits</Text>
          <Text style={styles.summarySub}>{validation.totalCourses} Courses Selected</Text>
        </View>
        <TouchableOpacity style={styles.savePlanBtn} onPress={handleSavePlan}>
          <Text style={styles.savePlanBtnText}>Save {activePlan}</Text>
        </TouchableOpacity>
      </View>

      {/* Course Catalog Picker */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Courses & Electives</Text>
        <Text style={styles.sectionSub}>Tap to Add/Remove from {activePlan}</Text>
      </View>

      {catalog.map((course) => {
        const isSelected = selectedIds.includes(course.id);
        return (
          <TouchableOpacity
            key={course.id}
            style={[styles.catalogCard, isSelected && styles.catalogCardSelected]}
            activeOpacity={0.8}
            onPress={() => toggleCourse(course.id)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.codeRow}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <View style={styles.slotBadge}>
                    <Text style={styles.slotBadgeText}>Slot {course.slots.join(', ')}</Text>
                  </View>
                  <Text style={styles.creditsText}>{course.credits} Credits</Text>
                </View>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.facultyText}>{course.faculty} · {course.room}</Text>
              </View>

              <View style={[styles.selectIndicator, isSelected && styles.indicatorActive]}>
                <Text style={styles.indicatorText}>{isSelected ? '✓' : '+'}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.seatsText}>Seats remaining: {course.seatsLeft}</Text>
              <Text style={[styles.selectLabel, isSelected ? styles.labelSelected : styles.labelAdd]}>
                {isSelected ? 'Included in Plan' : '+ Tap to Include'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  heroBanner: { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155' },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  heroSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
  planSelectorRow: { flexDirection: 'row', marginTop: 14, gap: 10 },
  planTab: { flex: 1, backgroundColor: '#1E293B', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  planTabActive: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  planTabText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  planTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  statusBanner: {
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  statusValid: { backgroundColor: '#064E3B', borderColor: '#10B981' },
  statusClash: { backgroundColor: '#451A03', borderColor: '#EF4444' },
  statusIcon: { fontSize: 22 },
  statusTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  statusSub: { color: '#E2E8F0', fontSize: 12, marginTop: 2 },
  conflictCard: { backgroundColor: '#7F1D1D', padding: 12, borderRadius: 10, marginTop: 10 },
  conflictSlot: { color: '#FECACA', fontWeight: '700', fontSize: 12 },
  conflictReason: { color: '#FEE2E2', fontSize: 12, marginTop: 2 },
  quickCopyBox: { backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#334155' },
  quickCopyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quickCopyTitle: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },
  copyBtn: { backgroundColor: '#0284C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  copyBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  copyCodesText: { color: '#F8FAFC', fontSize: 13, fontWeight: '600', marginTop: 8, fontFamily: 'monospace' },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, backgroundColor: '#1E293B', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  summaryTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  summarySub: { color: '#94A3B8', fontSize: 12 },
  savePlanBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  savePlanBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  sectionHeader: { marginTop: 22, marginBottom: 12 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  sectionSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  catalogCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  catalogCardSelected: { borderColor: '#3B82F6', backgroundColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  courseCode: { color: '#60A5FA', fontSize: 12, fontWeight: '700', marginRight: 8 },
  slotBadge: { backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  slotBadgeText: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },
  creditsText: { color: '#94A3B8', fontSize: 11 },
  courseTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  facultyText: { color: '#64748B', fontSize: 12, marginTop: 2 },
  selectIndicator: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  indicatorActive: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  indicatorText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  seatsText: { color: '#94A3B8', fontSize: 11 },
  selectLabel: { fontSize: 12, fontWeight: '600' },
  labelSelected: { color: '#60A5FA' },
  labelAdd: { color: '#64748B' }
});

