import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ApiService } from '../services/api';
import { ODAuditResponse, GhostAbsence, ODClaim, AppealEmailDraft } from '../types';

export const ODAuditorScreen: React.FC = () => {
  const [audit, setAudit] = useState<ODAuditResponse | null>(null);
  const [claims, setClaims] = useState<ODClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [activeEmail, setActiveEmail] = useState<AppealEmailDraft | null>(null);

  // New claim form state
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Hackathon');
  const [eventDate, setEventDate] = useState('2026-11-10');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      const [auditRes, claimsRes] = await Promise.all([
        ApiService.getODAudit(),
        ApiService.getODClaims()
      ]);
      setAudit(auditRes);
      setClaims(claimsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateAppeal = async (absence: GhostAbsence) => {
    try {
      const draft = await ApiService.generateAppealDraft(absence);
      setActiveEmail(draft);
      setEmailModalVisible(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate appeal draft.');
    }
  };

  const handleCreateClaim = async () => {
    if (!eventName) {
      Alert.alert('Validation', 'Please provide an event name.');
      return;
    }
    try {
      await ApiService.submitODClaim({
        eventName,
        eventType,
        dates: [eventDate],
        notes
      });
      setClaimModalVisible(false);
      setEventName('');
      setNotes('');
      loadData();
      Alert.alert('Success', 'OD Claim logged for tracking!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save OD claim.');
    }
  };

  if (loading || !audit) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Running Automated OD Audit...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Ghost Absent & OD Auditor</Text>
        <Text style={styles.heroSub}>
          Cross-references timetable schedules with marked absences to catch uncredited On-Duty records before the 7-day cutoff.
        </Text>
      </View>

      {/* Discrepancy Status Card */}
      <View style={[styles.statusCard, audit.ghostAbsencesFound > 0 ? styles.statusDanger : styles.statusGood]}>
        <Text style={styles.statusIcon}>{audit.ghostAbsencesFound > 0 ? '🚨' : '✅'}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.statusTitle}>
            {audit.ghostAbsencesFound > 0
              ? `${audit.ghostAbsencesFound} Uncredited Ghost Absence(s) Detected!`
              : 'All OD Claims are in Sync'}
          </Text>
          <Text style={styles.statusDesc}>{audit.alertMessage}</Text>
        </View>
      </View>

      {/* Detected Ghost Absences List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Detected Discrepancies</Text>
        <Text style={styles.sectionCount}>{audit.ghostAbsences.length} Found</Text>
      </View>

      {audit.ghostAbsences.map((item, idx) => (
        <View key={idx} style={styles.absenceCard}>
          <View style={styles.absenceTop}>
            <View>
              <View style={styles.badgeRow}>
                <View style={styles.tagGhost}>
                  <Text style={styles.tagGhostText}>Ghost Absent</Text>
                </View>
                <Text style={styles.absenceDate}>{item.date} · Period {item.period}</Text>
              </View>
              <Text style={styles.courseTitle}>{item.courseTitle}</Text>
              <Text style={styles.courseCode}>{item.courseCode} (Day Order {item.dayOrder})</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.odRefBox}>
            <Text style={styles.odRefLabel}>Linked OD Approval:</Text>
            <Text style={styles.odRefValue}>
              Ref: {item.odId} (Milan '26 Hackathon) — Signed by HoD, but marked Absent on Academia.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.appealBtn}
            activeOpacity={0.8}
            onPress={() => handleGenerateAppeal(item)}
          >
            <Text style={styles.appealBtnText}>✉️ Generate 1-Click Appeal to FA</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Active OD Claims Tracker */}
      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <Text style={styles.sectionTitle}>Logged OD Claims</Text>
        <TouchableOpacity
          style={styles.addClaimBtn}
          onPress={() => setClaimModalVisible(true)}
        >
          <Text style={styles.addClaimBtnText}>+ Log New OD</Text>
        </TouchableOpacity>
      </View>

      {claims.map((claim) => (
        <View key={claim.id} style={styles.claimCard}>
          <View style={styles.claimTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.claimTitle}>{claim.eventName}</Text>
              <Text style={styles.claimDates}>Dates: {claim.dates.join(', ')}</Text>
            </View>
            <View style={[styles.claimStatusBadge, claim.hasDiscrepancy ? styles.badgeWarn : styles.badgeOk]}>
              <Text style={styles.claimStatusText}>{claim.academiaStatus}</Text>
            </View>
          </View>
          <Text style={styles.claimNotes}>{claim.notes}</Text>
          <View style={styles.claimMeta}>
            <Text style={styles.claimProof}>📎 {claim.certificateRef}</Text>
            <Text style={styles.claimApproval}>✓ {claim.approvalStatus}</Text>
          </View>
        </View>
      ))}

      {/* Appeal Email Preview Modal */}
      <Modal visible={emailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Faculty Advisor Appeal Draft</Text>
              <TouchableOpacity onPress={() => setEmailModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {activeEmail && (
              <ScrollView style={styles.emailBodyScroll}>
                <View style={styles.emailField}>
                  <Text style={styles.fieldLabel}>To:</Text>
                  <Text style={styles.fieldValue}>{activeEmail.recipient} ({activeEmail.recipientName})</Text>
                </View>
                <View style={styles.emailField}>
                  <Text style={styles.fieldLabel}>Subject:</Text>
                  <Text style={styles.fieldValue}>{activeEmail.subject}</Text>
                </View>
                <View style={[styles.emailField, { flexDirection: 'column' }]}>
                  <Text style={styles.fieldLabel}>Message Body:</Text>
                  <Text style={styles.bodyText}>{activeEmail.body}</Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.sendEmailBtn}
              onPress={() => {
                Alert.alert('Email Prepared', 'Appeal email draft ready to dispatch via your preferred mail client.');
                setEmailModalVisible(false);
              }}
            >
              <Text style={styles.sendEmailBtnText}>Open in Email Client / Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit New OD Claim Modal */}
      <Modal visible={claimModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log OD Event for Tracking</Text>
              <TouchableOpacity onPress={() => setClaimModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. SRM Hackathon / Inter-Collegiate Fest"
                placeholderTextColor="#64748B"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Event</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes / Purpose</Text>
              <TextInput
                style={[styles.textInput, { height: 70 }]}
                placeholder="OD signed by FA/HoD or event details"
                placeholderTextColor="#64748B"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity style={styles.submitClaimBtn} onPress={handleCreateClaim}>
              <Text style={styles.submitClaimBtnText}>Save Claim & Enable Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statusCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  statusDanger: { backgroundColor: '#451A03', borderColor: '#F59E0B' },
  statusGood: { backgroundColor: '#064E3B', borderColor: '#10B981' },
  statusIcon: { fontSize: 24 },
  statusTitle: { color: '#FDE68A', fontWeight: '700', fontSize: 14 },
  statusDesc: { color: '#FCD34D', fontSize: 12, marginTop: 2, lineHeight: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  sectionCount: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  absenceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  absenceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tagGhost: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  tagGhostText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  absenceDate: { color: '#94A3B8', fontSize: 12 },
  courseTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  courseCode: { color: '#64748B', fontSize: 12, marginTop: 2 },
  statusPill: { backgroundColor: '#7F1D1D', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },
  odRefBox: { backgroundColor: '#0F172A', padding: 10, borderRadius: 8, marginTop: 12 },
  odRefLabel: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
  odRefValue: { color: '#CBD5E1', fontSize: 12, marginTop: 2, lineHeight: 16 },
  appealBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12
  },
  appealBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  addClaimBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addClaimBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  claimCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  claimTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  claimTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  claimDates: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  claimStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeWarn: { backgroundColor: '#78350F' },
  badgeOk: { backgroundColor: '#064E3B' },
  claimStatusText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  claimNotes: { color: '#94A3B8', fontSize: 12, marginTop: 8 },
  claimMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  claimProof: { color: '#60A5FA', fontSize: 11 },
  claimApproval: { color: '#34D399', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  closeBtn: { color: '#94A3B8', fontSize: 20, padding: 4 },
  emailBodyScroll: { maxHeight: 350 },
  emailField: { marginBottom: 12 },
  fieldLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  fieldValue: { color: '#F8FAFC', fontSize: 13, fontWeight: '500' },
  bodyText: { color: '#E2E8F0', fontSize: 12, lineHeight: 18, backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginTop: 4 },
  sendEmailBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  sendEmailBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 6 },
  textInput: { backgroundColor: '#0F172A', borderRadius: 8, padding: 10, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155', fontSize: 13 },
  submitClaimBtn: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitClaimBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});

