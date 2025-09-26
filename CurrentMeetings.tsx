import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, TextInput, Platform } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { Meeting } from '../types';

interface CurrentMeetingsProps {
  onBack: () => void;
  meetings: Meeting[];
  onUpdateMeeting: (id: string, updatedData: any) => void;
  onDeleteMeeting: (id: string) => void;
}

export default function CurrentMeetings({ onBack, meetings, onUpdateMeeting, onDeleteMeeting }: CurrentMeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [action, setAction] = useState<'edit' | 'delete'>('edit');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const handleMeetingPress = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleEditPress = () => {
    setAction('edit');
    setShowPasswordModal(true);
  };

  const handleDeletePress = () => {
    setAction('delete');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (!selectedMeeting) return;

    const entered = password.trim();
    const actual = String(selectedMeeting.meeting_password ?? '');
    if (!entered || entered !== actual) {
      Alert.alert('Lỗi', 'Mật khẩu không đúng');
      return;
    }

    if (action === 'delete') {
      if (Platform.OS === 'web') {
        onDeleteMeeting(selectedMeeting.id);
        setSelectedMeeting(null);
        setShowPasswordModal(false);
        setPassword('');
      } else {
        Alert.alert(
          'Xác nhận xóa',
          'Bạn có chắc chắn muốn xóa cuộc họp này?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xóa',
              style: 'destructive',
              onPress: () => {
                onDeleteMeeting(selectedMeeting.id);
                setSelectedMeeting(null);
                setShowPasswordModal(false);
                setPassword('');
              }
            }
          ]
        );
      }
    } else {
      setEditContent(selectedMeeting.content);
      setShowEditModal(true);
      setShowPasswordModal(false);
      setPassword('');
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'Chưa xác định';
    try {
      const d = new Date(dateTime);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateTime;
    }
  };

  const formatRange = (start: string, end: string) => {
    if (!start && !end) return 'Chưa xác định';
    if (!start) return `Đến ${formatDateTime(end)}`;
    if (!end) return `${formatDateTime(start)} (không có giờ kết thúc)`;
    try {
      const s = new Date(start);
      const e = new Date(end);
      const sameDay = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate();
      const base = formatDateTime(start);
      const timeEnd = `${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`;
      return sameDay ? `${base} - ${timeEnd}` : `${base} — ${formatDateTime(end)}`;
    } catch {
      return `${formatDateTime(start)} - ${formatDateTime(end)}`;
    }
  };

  const getRoomName = (room: string) => {
    return room === 'large' ? 'Phòng họp lớn' : 'Phòng họp bé';
  };

  // Filter current meetings (chưa diễn ra và chưa kết thúc)
  const currentMeetings = meetings.filter(meeting => {
    const now = new Date();
    const endTime = new Date(meeting.end_time);
    return endTime >= now;
  });

  // Group meetings by date
  const groupedMeetings = currentMeetings.reduce((groups: {[key: string]: Meeting[]}, meeting) => {
    const startDate = new Date(meeting.start_time);
    const dateKey = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(meeting);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedMeetings).sort();

  // Auto-expand today and tomorrow
  React.useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayKey = today.toISOString().split('T')[0];
    const tomorrowKey = tomorrow.toISOString().split('T')[0];
    
    setExpandedDates(new Set([todayKey, tomorrowKey]));
  }, []);

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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayKey = today.toISOString().split('T')[0];
    const tomorrowKey = tomorrow.toISOString().split('T')[0];
    
    if (dateKey === todayKey) {
      return `Hôm nay (${date.toLocaleDateString('vi-VN')})`;
    } else if (dateKey === tomorrowKey) {
      return `Ngày mai (${date.toLocaleDateString('vi-VN')})`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lịch họp hiện tại</Text>
      </View>

      <ScrollView style={styles.content}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có cuộc họp nào</Text>
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
                      <Text style={styles.meetingContent}>{meeting.content}</Text>
                      <View style={styles.meetingFooter}>
                        <Text style={styles.meetingStaff}>
                          {meeting.staff?.name || 'N/A'}
                        </Text>
                        <Text style={styles.meetingStaffDetails}>
                          {meeting.staff?.title || 'N/A'} - {meeting.team}
                        </Text>
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
                    {formatDateTime(selectedMeeting.start_time)} - {formatDateTime(selectedMeeting.end_time)}
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
                  <Text style={styles.detailValue}>{selectedMeeting.staff?.name || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Đội nhóm:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.team}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                    <Text style={styles.buttonText}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                    <Text style={styles.buttonText}>Xóa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedMeeting(null)}>
                    <Text style={styles.cancelButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.passwordTitle}>
              Nhập mật khẩu cuộc họp để {action === 'edit' ? 'chỉnh sửa' : 'xóa'}
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mật khẩu cuộc họp"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
            />
            <View style={styles.passwordActions}>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.buttonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.modalTitle}>Chỉnh sửa nội dung họp</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Nội dung cuộc họp"
              value={editContent}
              onChangeText={setEditContent}
              multiline
            />
            <View style={styles.passwordActions}>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  if (!selectedMeeting) return;
                  onUpdateMeeting(selectedMeeting.id, { content: editContent });
                  setShowEditModal(false);
                  setSelectedMeeting({ ...selectedMeeting, content: editContent });
                }}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
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
    color: COLORS.primary,
    flex: 1,
  },
  meetingRoom: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  meetingContent: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  meetingFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
  },
  meetingStaff: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[800],
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  meetingStaffDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  dateSection: {
    marginTop: SPACING.lg,
  },
  dateHeader: {
    backgroundColor: COLORS.primary,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.gray[300],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray[700],
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passwordModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.xl,
    margin: SPACING.lg,
    width: '80%',
  },
  passwordTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    flex: 1,
  },
});
