import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/theme';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onViewCurrent: () => void;
  meetingDetails: {
    date: string;
    time: string;
    room: string;
    content: string;
    staffCode: string;
    staffName?: string;
    password?: string;
  };
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  onGoHome,
  onViewCurrent,
  meetingDetails,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Đặt lịch thành công!</Text>
              <Text style={styles.subtitle}>
                Lịch hẹn của bạn đã được tạo thành công
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Thông tin cuộc hẹn</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Ngày:</Text>
                <Text style={styles.value}>{meetingDetails.date}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Giờ:</Text>
                <Text style={styles.value}>{meetingDetails.time}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Phòng:</Text>
                <Text style={styles.value}>{meetingDetails.room}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Nội dung:</Text>
                <Text style={styles.value}>{meetingDetails.content}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Mã cán bộ:</Text>
                <Text style={styles.value}>{meetingDetails.staffCode}</Text>
              </View>

              {meetingDetails.staffName && (
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Cán bộ:</Text>
                  <Text style={styles.value}>{meetingDetails.staffName}</Text>
                </View>
              )}

              {meetingDetails.password && (
                <View style={styles.passwordSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Mật khẩu:</Text>
                    <Text style={styles.passwordValue}>{meetingDetails.password}</Text>
                  </View>
                </View>
              )}
            </View>
            
            {meetingDetails.password && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningTitle}>⚠️ HÃY CHỤP LẠI MÀN HÌNH NÀY ⚠️</Text>
                <Text style={styles.warningText}>
                  Mật khẩu cuộc họp là: <Text style={styles.highlightPassword}>{meetingDetails.password}</Text>
                </Text>
                <Text style={styles.warningSubtext}>
                  Bạn sẽ cần mật khẩu này để chỉnh sửa hoặc xóa cuộc họp
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onGoHome}
              >
                <Text style={styles.primaryButtonText}>
                  Quay về trang chính
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onViewCurrent}
              >
                <Text style={styles.secondaryButtonText}>
                  Xem lịch hiện tại
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    width: 100,
    flexShrink: 0,
  },
  value: {
    fontSize: 16,
    color: COLORS.muted,
    flex: 1,
    marginLeft: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  passwordSection: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffc107',
    marginBottom: 24,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 4,
  },
  highlightPassword: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d63384',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#6c5600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});