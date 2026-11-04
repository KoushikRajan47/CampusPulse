import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { ApiService } from '../services/api';
import { TimetableResponse, TimetablePeriod } from '../types';

export const TimetableScreen: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await ApiService.getTimetable();
        setTimetable(res);
        setSelectedDay(res.currentDayOrder);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  // Helper to decode room code into clear location info
  const decodeRoom = (roomCode: string) => {
    if (roomCode.startsWith('TP-')) {
      const roomNum = roomCode.replace('TP-', '');
      const floor = roomNum.charAt(0);
      return {
        building: 'Tech Park',
        floor: `${floor}th Floor`,
        room: `Room ${roomNum}`,
        tip: 'Nearest Lift: Central Lift Lobby (Lift B)'
      };
    }
    if (roomCode.startsWith('UB-')) {
      const roomNum = roomCode.replace('UB-', '');
      const floor = roomNum.length >= 4 ? roomNum.substring(0, 2) : roomNum.charAt(0);
      return {
        building: 'University Building (UB)',
        floor: `${floor}th Floor`,
        room: `Room ${roomNum}`,
        tip: 'Nearest Stairs: East Stairwell'
      };
    }
    if (roomCode.startsWith('BEL-')) {
      const roomNum = roomCode.replace('BEL-', '');
      const floor = roomNum.charAt(0);
      return {
        building: 'Believers Block',
        floor: `${floor}th Floor`,
        room: `Room ${roomNum}`,
        tip: 'Near Biomedical Block connector'
      };
    }
    return {
      building: 'Main Campus',
      floor: 'Campus Complex',
      room: roomCode,
      tip: 'Check campus directory'
    };
  };

  if (loading || !timetable) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Timetable & Room Decoders...</Text>
      </View>
    );
  }

  const periods: TimetablePeriod[] = timetable.schedule[selectedDay] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Rotating Day-Order Timetable</Text>
        <Text style={styles.heroSub}>
          SRM rotating day orders with room navigation decoders and period countdowns.
        </Text>
      </View>

      {/* Day Selector (Day 1 - 5) */}
      <View style={styles.daySelectorRow}>
        {[1, 2, 3, 4, 5].map((day) => {
          const isToday = timetable.currentDayOrder === day;
          const isSelected = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayTab,
                isSelected && styles.dayTabActive,
                isToday && !isSelected && styles.dayTabToday
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                Day {day}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Day Banner */}
      <View style={styles.activeDayHeader}>
        <Text style={styles.activeDayTitle}>
          Day Order {selectedDay} Schedule
          {timetable.currentDayOrder === selectedDay ? ' (Today)' : ''}
        </Text>
        <Text style={styles.periodCount}>{periods.length} Periods Scheduled</Text>
      </View>

      {/* Periods List */}
      {periods.map((period) => {
        const roomInfo = decodeRoom(period.room);
        return (
          <View key={period.period} style={styles.periodCard}>
            <View style={styles.periodTimeCol}>
              <Text style={styles.periodNum}>P{period.period}</Text>
              <Text style={styles.periodTime}>{period.time}</Text>
            </View>

            <View style={styles.periodDetails}>
              <View style={styles.periodTopRow}>
                <Text style={styles.periodTitle}>{period.title}</Text>
                <View style={styles.slotPill}>
                  <Text style={styles.slotText}>Slot {period.slot}</Text>
                </View>
              </View>
              <Text style={styles.courseCode}>{period.code}</Text>

              {/* Room Decoder Box */}
              <View style={styles.roomDecoderBox}>
                <View style={styles.roomMainRow}>
                  <Text style={styles.roomCodeTag}>📍 {period.room}</Text>
                  <Text style={styles.buildingText}>
                    {roomInfo.building} · {roomInfo.floor}
                  </Text>
                </View>
                <Text style={styles.roomTip}>{roomInfo.tip}</Text>
              </View>
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
  heroBanner: { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155' },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  heroSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
  daySelectorRow: { flexDirection: 'row', marginTop: 14, gap: 8 },
  dayTab: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative'
  },
  dayTabActive: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  dayTabToday: { borderColor: '#10B981' },
  dayTabText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  dayTabTextActive: { color: '#FFFFFF' },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 4
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12
  },
  activeDayTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  periodCount: { color: '#64748B', fontSize: 12 },
  periodCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155'
  },
  periodTimeCol: { width: 75, borderRightWidth: 1, borderRightColor: '#334155', paddingRight: 10, justifyContent: 'center' },
  periodNum: { color: '#60A5FA', fontSize: 16, fontWeight: '800' },
  periodTime: { color: '#94A3B8', fontSize: 10, marginTop: 4, lineHeight: 14 },
  periodDetails: { flex: 1, paddingLeft: 12 },
  periodTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  slotPill: { backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  slotText: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },
  courseCode: { color: '#64748B', fontSize: 12, marginTop: 2 },
  roomDecoderBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  roomMainRow: { flexDirection: 'row', alignItems: 'center' },
  roomCodeTag: { color: '#38BDF8', fontSize: 12, fontWeight: '700', marginRight: 6 },
  buildingText: { color: '#E2E8F0', fontSize: 11, fontWeight: '500' },
  roomTip: { color: '#64748B', fontSize: 10, marginTop: 3 }
});

