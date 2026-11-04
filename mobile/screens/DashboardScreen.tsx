import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { ApiService } from '../services/api';
import { AttendanceResponse } from '../types';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<Props> = ({ onNavigateTab }) => {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [targetPct, setTargetPct] = useState(75);

  const loadData = async (target = targetPct) => {
    try {
      const res = await ApiService.getCourses(target);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Syncing Academia Data (Hybrid Mode)...</Text>
      </View>
    );
  }

  const { student, overall, courses } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />}
    >
      {/* Student Banner */}
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentSub}>
            {student.regNumber} · Sec {student.section} · Sem {student.semester}
          </Text>
          <Text style={styles.studentCampus}>{student.campus}</Text>
        </View>
        <View style={styles.cgpaBadge}>
          <Text style={styles.cgpaLabel}>CGPA</Text>
          <Text style={styles.cgpaVal}>{student.cgpa.toFixed(2)}</Text>
        </View>
      </View>

      {/* Day Order Banner */}
      <TouchableOpacity
        style={styles.dayOrderBanner}
        activeOpacity={0.8}
        onPress={() => onNavigateTab('timetable')}
      >
        <View style={styles.dayOrderBadge}>
          <Text style={styles.dayOrderNum}>Day 3</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.dayOrderTitle}>Today's Schedule Active</Text>
          <Text style={styles.dayOrderSub}>Next: DAA at TP-502 (Period 3) • Tap to view</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      {/* Discrepancy Warning Quick-Action */}
      <TouchableOpacity
        style={styles.alertCard}
        activeOpacity={0.8}
        onPress={() => onNavigateTab('od')}
      >
        <Text style={styles.alertIcon}>⚠️</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.alertTitle}>Ghost Absent Alert Detected!</Text>
          <Text style={styles.alertDesc}>
            2 absences found on 2026-10-24 during Milan '26 Hackathon OD. Tap to review & appeal.
          </Text>
        </View>
        <Text style={styles.chevronBlue}>Review</Text>
      </TouchableOpacity>

      {/* Overall Attendance Card */}
      <View style={styles.overallCard}>
        <View style={styles.overallHeader}>
          <View>
            <Text style={styles.overallLabel}>Overall Attendance</Text>
            <Text style={styles.overallSub}>
              {overall.totalAttended} / {overall.totalConducted} Hours Attended
            </Text>
          </View>
          <View style={[styles.pctBadge, overall.percentage >= 75 ? styles.badgeGood : styles.badgeDanger]}>
            <Text style={styles.pctText}>{overall.percentage.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Target Slider Selector */}
        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>Target Threshold:</Text>
          {[75, 80, 85].map((tgt) => (
            <TouchableOpacity
              key={tgt}
              style={[styles.tgtButton, targetPct === tgt && styles.tgtButtonActive]}
              onPress={() => {
                setTargetPct(tgt);
                loadData(tgt);
              }}
            >
              <Text style={[styles.tgtText, targetPct === tgt && styles.tgtTextActive]}>{tgt}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bunkVerdict}>
          {overall.safeBunks > 0 ? (
            <Text style={styles.verdictSafe}>
              🛡️ Safe Buffer: You can safely miss <Text style={{ fontWeight: 'bold' }}>{overall.safeBunks} hours</Text> overall while staying above {targetPct}%.
            </Text>
          ) : (
            <Text style={styles.verdictDanger}>
              🚨 Deficit: You must attend the next <Text style={{ fontWeight: 'bold' }}>{overall.classesNeeded} hours</Text> consecutively to reach {targetPct}%.
            </Text>
          )}
        </View>
      </View>

      {/* Course-Wise Attendance List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Course Breakdown</Text>
        <Text style={styles.sectionSub}>{courses.length} Enrolled</Text>
      </View>

      {courses.map((course) => {
        const isSafe = course.percentage >= targetPct;
        return (
          <View key={course.code} style={styles.courseCard}>
            <View style={styles.courseTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.codeRow}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <View style={styles.slotPill}>
                    <Text style={styles.slotText}>Slot {course.slot}</Text>
                  </View>
                </View>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseFaculty}>{course.faculty} · {course.room}</Text>
              </View>
              <View style={[styles.miniPctBadge, isSafe ? styles.badgeGood : styles.badgeDanger]}>
                <Text style={styles.miniPctText}>{course.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Attendance Progress Bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, course.percentage)}%` },
                  isSafe ? styles.fillGood : styles.fillDanger
                ]}
              />
            </View>

            <View style={styles.courseBottom}>
              <Text style={styles.statDetail}>
                {course.attended}/{course.conducted} Hours
              </Text>
              {course.safeBunks > 0 ? (
                <Text style={styles.safeTag}>✓ Can miss {course.safeBunks} class{course.safeBunks > 1 ? 'es' : ''}</Text>
              ) : (
                <Text style={styles.dangerTag}>⚠️ Must attend next {course.classesNeeded} class{course.classesNeeded > 1 ? 'es' : ''}</Text>
              )}
            </View>
          </View>
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
  studentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155'
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  studentSub: { fontSize: 13, color: '#94A3B8', marginTop: 3 },
  studentCampus: { fontSize: 11, color: '#64748B', marginTop: 4 },
  cgpaBadge: { backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  cgpaLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  cgpaVal: { fontSize: 16, fontWeight: '800', color: '#38BDF8', marginTop: 2 },
  dayOrderBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6'
  },
  dayOrderBadge: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  dayOrderNum: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  dayOrderTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  dayOrderSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  chevron: { color: '#60A5FA', fontSize: 18, fontWeight: '700' },
  alertCard: {
    backgroundColor: '#451A03',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertIcon: { fontSize: 20 },
  alertTitle: { color: '#FDE68A', fontWeight: '700', fontSize: 13 },
  alertDesc: { color: '#FCD34D', fontSize: 11, marginTop: 2 },
  chevronBlue: { color: '#F59E0B', fontWeight: '700', fontSize: 12, marginLeft: 8 },
  overallCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overallLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  overallSub: { color: '#94A3B8', fontSize: 13, marginTop: 3 },
  pctBadge: { borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 },
  pctText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  badgeGood: { backgroundColor: '#10B981' },
  badgeDanger: { backgroundColor: '#EF4444' },
  targetRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#334155' },
  targetLabel: { color: '#94A3B8', fontSize: 12, marginRight: 10 },
  tgtButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#0F172A', marginRight: 8 },
  tgtButtonActive: { backgroundColor: '#3B82F6' },
  tgtText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  tgtTextActive: { color: '#FFFFFF', fontWeight: '700' },
  bunkVerdict: { marginTop: 12, backgroundColor: '#0F172A', padding: 12, borderRadius: 10 },
  verdictSafe: { color: '#34D399', fontSize: 13, lineHeight: 18 },
  verdictDanger: { color: '#F87171', fontSize: 13, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  sectionSub: { color: '#64748B', fontSize: 13 },
  courseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  courseCode: { color: '#60A5FA', fontSize: 12, fontWeight: '700', marginRight: 8 },
  slotPill: { backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  slotText: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  courseTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  courseFaculty: { color: '#64748B', fontSize: 12, marginTop: 2 },
  miniPctBadge: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  miniPctText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  progressBarBg: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  fillGood: { backgroundColor: '#10B981' },
  fillDanger: { backgroundColor: '#EF4444' },
  courseBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statDetail: { color: '#94A3B8', fontSize: 12 },
  safeTag: { color: '#34D399', fontSize: 12, fontWeight: '600' },
  dangerTag: { color: '#F87171', fontSize: 12, fontWeight: '600' }
});

