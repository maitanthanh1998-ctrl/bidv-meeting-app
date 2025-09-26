import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface Meeting {
  id: string;
  start_time: string;
  end_time: string;
  room: string;
  content: string;
  staff?: { name: string; title: string };
  team: string;
  created_at: string;
  status?: 'completed' | 'deleted';
  moved_to_past_at?: string;
}

interface PastMeetingsProps {
  onBack: () => void;
  meetings: Meeting[];
}

export default function PastMeetings({ onBack, meetings }: PastMeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Đã họp';
      case 'deleted':
        return 'Lịch họp đã được xóa';
      default:
        return 'Đã họp';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return COLORS.success || '#28a745';
      case 'deleted':
        return COLORS.error || '#dc3545';
      default:
        return COLORS.success || '#28a745';
    }
  };

  const handleMeetingPress = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'Chưa xác định';
    try {
      const d = new Date(dateTime);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return 'Chưa xác định';
    }
  };

  const formatDate = (dateTime: string) => {
    if (!dateTime) return 'Chưa xác định';
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateTime.split(' ')[0] || dateTime;
    }
  };

  const formatRange = (start: string, end: string) => {
    if (!start && !end) return 'Chưa xác định';
    if (!start) return `Đến ${formatDateTime(end)}`;
    if (!end) return `${formatDateTime(start)} (không có giờ kết thúc)`;
    return `${formatDateTime(start)} - ${formatDateTime(end)}`;
  };

  const getRoomName = (room: string) => {
    return room === 'large' ? 'Phòng họp lớn' : 'Phòng họp bé';
  };

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups: {[key: string]: Meeting[]}, meeting) => {
    const startDate = new Date(meeting.start_time);
    const dateKey = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(meeting);
    return groups;
  }, {});

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedMeetings).sort().reverse();

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const formatDateHeader = (dateKey: string) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lịch họp quá khứ</Text>
      </View>

      <ScrollView style={styles.content}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có cuộc họp nào trong quá khứ</Text>
          </View>
        ) : (
          sortedDates.map((dateKey) => (
            <View key={dateKey} style={styles.dateSection}>
              <TouchableOpacity 
                style={styles.dateHeader} 
                onPress={() => toggleDateExpansion(dateKey)}
              >
                <Text style={styles.dateHeaderText}>
                  {formatDateHeader(dateKey)} ({groupedMeetings[dateKey].length} cuộc họp)
                </Text>
                <Text style={styles.expandIcon}>
                  {expandedDates.has(dateKey) ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
              
              {expandedDates.has(dateKey) && (
                <View style={styles.meetingsContainer}>
                  {groupedMeetings[dateKey].map((meeting) => (
                    <TouchableOpacity
                      key={meeting.id}
                      style={styles.meetingCard}
                      onPress={() => handleMeetingPress(meeting)}
                    >
                      <View style={styles.meetingHeader}>
                        <Text style={styles.meetingTime}>
                          {formatRange(meeting.start_time, meeting.end_time)}
                        </Text>
                        <Text style={styles.meetingRoom}>{getRoomName(meeting.room)}</Text>
                      </View>
                      <Text style={styles.meetingContent} numberOfLines={2}>
                        {meeting.content}
                      </Text>
                      <View style={styles.meetingFooter}>
                        <View style={styles.staffInfoContainer}>
                          <Text style={styles.meetingStaff}>
                            {meeting.staff?.name || 'N/A'}
                          </Text>
                          <Text style={styles.meetingStaffDetails}>
                            {meeting.staff?.title || 'N/A'} - {meeting.team}
                          </Text>
                        </View>
                        <View style={styles.statusContainer}>
                          <Text style={[styles.statusText, { color: getStatusColor(meeting.status) }]}>
                            {getStatusText(meeting.status)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Meeting Detail Modal */}
      <Modal
        visible={!!selectedMeeting}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMeeting(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMeeting && (
              <>
                <Text style={styles.modalTitle}>Chi tiết cuộc họp</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời gian:</Text>
                  <Text style={styles.detailValue}>
                    {formatRange(selectedMeeting.start_time, selectedMeeting.end_time)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phòng:</Text>
                  <Text style={styles.detailValue}>{getRoomName(selectedMeeting.room)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nội dung:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.content}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Người tạo:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMeeting.staff?.name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chức vụ:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMeeting.staff?.title || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Đội nhóm:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.team}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ngày tạo:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedMeeting.created_at)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(selectedMeeting.status) }]}>
                    {getStatusText(selectedMeeting.status)}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setSelectedMeeting(null)}
                  >
                    <Text style={styles.closeButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.8, // Slightly faded to indicate past meetings
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  meetingTime: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.gray[600], // Muted color for past meetings
    flex: 1,
  },
  meetingRoom: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  meetingContent: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  meetingFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffInfoContainer: {
    flex: 1,
  },
  meetingStaff: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[700],
    fontWeight: 'bold',
    marginBottom: 2,
  },
  meetingStaffDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  meetingDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[400],
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  dateSection: {
    marginTop: SPACING.lg,
  },
  dateHeader: {
    backgroundColor: COLORS.gray[600],
    padding: SPACING.md,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateHeaderText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  expandIcon: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  meetingsContainer: {
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.xl,
    margin: SPACING.lg,
    maxWidth: '90%',
    width: '100%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  detailRow: {
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[800],
    fontWeight: '500',
  },
  modalActions: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    minWidth: 120,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});