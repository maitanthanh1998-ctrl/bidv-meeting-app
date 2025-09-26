import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { SuccessModal } from './SuccessModal';
import DateTimePickerComponent from './DateTimePicker';
import { TeamType, RoomType, CreateMeetingProps, Staff } from '../types';
import { findStaffByCode } from '../utils/staffLookup';

const TEAMS: { value: TeamType; label: string }[] = [
  { value: 'Squad1', label: 'Squad 1' },
  { value: 'Squad2', label: 'Squad 2' },
  { value: 'Squad3', label: 'Squad 3' },
  { value: 'Squad4', label: 'Squad 4' },
  { value: 'Squad5', label: 'Squad 5' },
  { value: 'Squad6', label: 'Squad 6' },
  { value: 'Squad7', label: 'Squad 7' },
  { value: 'Squad8', label: 'Squad 8' },
  { value: 'BanQLDA', label: 'Ban QLDA' },
];

const ROOMS: { value: RoomType; label: string }[] = [
  { value: 'large', label: 'Phòng họp lớn' },
  { value: 'small', label: 'Phòng họp bé' },
];
export default function CreateMeeting({ onBack, onSubmit, usedPasswords }: CreateMeetingProps) {
  const [formData, setFormData] = useState({
    room: 'large' as RoomType,
    content: '',
    staffCode: '',
    team: 'Squad1' as TeamType,
    meetingPassword: '',
    startTime: null as Date | null,
    endTime: null as Date | null,
  });
  
  const [staffInfo, setStaffInfo] = useState<Staff | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);

  const handleStaffCodeChange = async (code: string) => {
    setFormData(prev => ({ ...prev, staffCode: code }));
    
    if (code.length >= 3) {
      try {
        const staff = findStaffByCode(code);
        if (staff) {
          console.log('Found staff:', staff);
          setStaffInfo(staff);
        } else {
          console.log('Staff not found for code:', code);
          setStaffInfo(null);
        }
      } catch (error) {
        console.log('Staff lookup error:', error);
        setStaffInfo(null);
      }
    } else {
      setStaffInfo(null);
    }
  };

  const generatePassword = () => {
    let password: string;
    do {
      const randomNum = Math.floor(Math.random() * 100);
      password = randomNum.toString().padStart(2, '0');
    } while (usedPasswords.has(password));
    
    setFormData(prev => ({ ...prev, meetingPassword: password }));
  };

  const handleSubmit = () => {
    if (!formData.content || !formData.staffCode || !formData.startTime || !formData.meetingPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const meetingData = {
      id: Date.now().toString(),
      start_time: formData.startTime?.toISOString() || new Date().toISOString(),
      end_time: formData.endTime?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
      room: formData.room,
      content: formData.content,
      staff_code: formData.staffCode,
      team: formData.team,
      meeting_password: formData.meetingPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      staff: staffInfo,
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const details = {
      date: formData.startTime?.toLocaleDateString('vi-VN') || new Date().toLocaleDateString('vi-VN'),
      time: formData.startTime && formData.endTime 
        ? `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
        : '09:00 - 10:00',
      room: ROOMS.find(r => r.value === formData.room)?.label || formData.room,
      content: formData.content,
      staffCode: formData.staffCode,
      staffName: staffInfo?.name,
      password: formData.meetingPassword,
    };

    setMeetingDetails(details);
    onSubmit(meetingData);
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Đặt lịch họp</Text>
      </View>
      
      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mã cán bộ *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã cán bộ (VD: 174685)"
            value={formData.staffCode}
            onChangeText={handleStaffCodeChange}
          />
          {staffInfo && (
            <View style={styles.staffInfo}>
              <Text style={styles.staffText}>Tên: {staffInfo.name}</Text>
              <Text style={styles.staffText}>Chức vụ: {staffInfo.title}</Text>
              <Text style={styles.staffText}>Email: {staffInfo.email}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team *</Text>
          <View style={styles.teamContainer}>
            {TEAMS.map((team) => (
              <TouchableOpacity
                key={team.value}
                style={[
                  styles.teamOption,
                  formData.team === team.value && styles.teamOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, team: team.value }))}
              >
                <Text style={[
                  styles.teamText,
                  formData.team === team.value && styles.teamTextSelected
                ]}>
                  {team.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <DateTimePickerComponent
          label="Thời gian bắt đầu"
          value={formData.startTime}
          onChange={(date) => {
            setFormData(prev => ({ ...prev, startTime: date }));
            // Auto set end time to 1 hour later
            if (!formData.endTime) {
              const endTime = new Date(date.getTime() + 60 * 60 * 1000);
              setFormData(prev => ({ ...prev, endTime }));
            }
          }}
          mode="datetime"
          minimumDate={new Date()}
        />

        <DateTimePickerComponent
          label="Thời gian kết thúc"
          value={formData.endTime}
          onChange={(date) => setFormData(prev => ({ ...prev, endTime: date }))}
          mode="datetime"
          minimumDate={formData.startTime || new Date()}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phòng họp *</Text>
          <View style={styles.roomContainer}>
            {ROOMS.map((room) => (
              <TouchableOpacity
                key={room.value}
                style={[
                  styles.roomOption,
                  formData.room === room.value && styles.roomOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, room: room.value }))}
              >
                <Text style={[
                  styles.roomText,
                  formData.room === room.value && styles.roomTextSelected
                ]}>
                  {room.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu cuộc họp *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Mật khẩu sẽ được tự động tạo"
              value={formData.meetingPassword}
              editable={false}
            />
            <TouchableOpacity style={styles.generateButton} onPress={generatePassword}>
              <Text style={styles.generateButtonText}>Lấy mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nội dung cuộc họp *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập nội dung cuộc họp"
            value={formData.content}
            onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
            multiline
            numberOfLines={3}
          />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Đặt lịch họp</Text>
        </TouchableOpacity>
      </ScrollView>

      {meetingDetails && (
        <SuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onGoHome={() => { setShowSuccessModal(false); onBack(); }}
          onViewCurrent={() => { setShowSuccessModal(false); onBack(); }}
          meetingDetails={meetingDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { padding: SPACING.lg, backgroundColor: COLORS.white },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.primary, fontSize: FONTS.sizes.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.primary },
  form: { flex: 1, padding: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.md, fontWeight: 'bold', marginBottom: SPACING.sm, color: COLORS.text },
  input: { borderWidth: 1, borderColor: COLORS.gray[300], padding: SPACING.md, borderRadius: 8, backgroundColor: COLORS.white, fontSize: FONTS.sizes.md },
  textArea: { height: 80, textAlignVertical: 'top' },
  staffInfo: { marginTop: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.gray[100], borderRadius: 8 },
  staffText: { fontSize: FONTS.sizes.sm, color: COLORS.muted, fontStyle: 'italic', marginBottom: 2 },
  roomContainer: { flexDirection: 'row', gap: SPACING.sm },
  roomOption: { flex: 1, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.white },
  roomOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roomText: { fontSize: FONTS.sizes.md, color: COLORS.text },
  roomTextSelected: { color: COLORS.white, fontWeight: 'bold' },
  teamContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  teamOption: { minWidth: 80, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: 6, alignItems: 'center', backgroundColor: COLORS.white },
  teamOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  teamText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  teamTextSelected: { color: COLORS.white, fontWeight: 'bold' },
  passwordContainer: { flexDirection: 'row', gap: SPACING.sm },
  passwordInput: { flex: 1 },
  generateButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8, justifyContent: 'center', minWidth: 120 },
  generateButtonText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: 'bold', textAlign: 'center' },
  submitButton: { backgroundColor: COLORS.accent, padding: SPACING.md, borderRadius: 8, alignItems: 'center', marginTop: SPACING.lg },
  submitText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: 'bold' },
});