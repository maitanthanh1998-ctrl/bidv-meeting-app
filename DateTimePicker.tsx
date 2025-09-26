import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface DateTimePickerComponentProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
}

export default function DateTimePickerComponent({
  label,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
}: DateTimePickerComponentProps) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date | null>(null);

  const clampToMin = (d: Date) => {
    if (!minimumDate) return d;
    return d < minimumDate ? new Date(minimumDate) : d;
  };

  const roundToQuarter = (d: Date) => {
    const minutes = d.getMinutes();
    const rounded = Math.ceil(minutes / 15) * 15;
    if (rounded === 60) {
      const nd = new Date(d);
      nd.setHours(d.getHours() + 1, 0, 0, 0);
      return nd;
    }
    const nd = new Date(d);
    nd.setMinutes(rounded, 0, 0);
    return nd;
  };

  const displayValue = useMemo(() => {
    return value || null;
  }, [value]);

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Chọn thời gian';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (mode === 'date') {
      return `${day}/${month}/${year}`;
    } else if (mode === 'time') {
      return `${hours}:${minutes}`;
    } else {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  };

  const open = () => {
    const base = value ? new Date(value) : roundToQuarter(clampToMin(new Date()));
    setTemp(base);
    setShow(true);
  };

  const setQuickDate = (daysFromToday: number) => {
    const base = new Date();
    base.setDate(base.getDate() + daysFromToday);
    if (temp) {
      base.setHours(temp.getHours(), temp.getMinutes(), 0, 0);
    } else {
      base.setHours(9, 0, 0, 0);
    }
    const clamped = clampToMin(base);
    setTemp(clamped);
  };

  const buildTimeSlots = () => {
    const slots: { h: number; m: number; label: string; disabled: boolean }[] = [];
    const startHour = 8;
    const endHour = 18;
    const minutes = [0, 30];
    const ref = temp || new Date();
    for (let h = startHour; h <= endHour; h++) {
      for (const m of minutes) {
        const d = temp ? new Date(temp) : new Date();
        d.setHours(h, m, 0, 0);
        const disabled = !!minimumDate && d < minimumDate;
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        slots.push({ h, m, label: `${hh}:${mm}`, disabled });
      }
    }
    return slots;
  };

  const pickTime = (h: number, m: number) => {
    if (!temp) return;
    const d = new Date(temp);
    d.setHours(h, m, 0, 0);
    const clamped = clampToMin(d);
    setTemp(clamped);
  };

  const adjust = (part: 'day' | 'hour' | 'minute', delta: number) => {
    if (!temp) return;
    const d = new Date(temp);
    if (part === 'day') d.setDate(d.getDate() + delta);
    if (part === 'hour') d.setHours(d.getHours() + delta);
    if (part === 'minute') d.setMinutes(d.getMinutes() + delta);
    const clamped = clampToMin(d);
    setTemp(clamped);
  };

  const confirm = () => {
    if (!temp) return;
    setShow(false);
    onChange(temp);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity style={styles.picker} onPress={open}>
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {formatDateTime(displayValue)}
        </Text>
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn {mode === 'date' ? 'ngày' : mode === 'time' ? 'giờ' : 'ngày giờ'}</Text>

            {/* Quick date chips */}
            {mode !== 'time' && (
              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.chip} onPress={() => setQuickDate(0)}>
                  <Text style={styles.chipTxt}>Hôm nay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => setQuickDate(1)}>
                  <Text style={styles.chipTxt}>Ngày mai</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => setQuickDate(2)}>
                  <Text style={styles.chipTxt}>+2 ngày</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Date row */}
            {mode !== 'time' && (
              <View style={styles.row}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => adjust('day', -1)}>
                  <Text style={styles.stepTxt}>−1 ngày</Text>
                </TouchableOpacity>
                <Text style={styles.currentText}>{formatDateTime(temp)}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => adjust('day', 1)}>
                  <Text style={styles.stepTxt}>+1 ngày</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Time grid */}
            {mode !== 'date' && (
              <View style={styles.grid}>
                {buildTimeSlots().map((t, idx) => (
                  <TouchableOpacity
                    key={idx}
                    disabled={t.disabled}
                    style={[styles.slot, t.disabled && styles.slotDisabled]}
                    onPress={() => pickTime(t.h, t.m)}
                  >
                    <Text style={[styles.slotTxt, t.disabled && styles.slotTxtDisabled]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShow(false)}>
                <Text style={styles.cancelTxt}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
                <Text style={styles.confirmTxt}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: SPACING.sm },
  label: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  picker: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray[300] },
  valueText: { fontSize: FONTS.sizes.md, color: COLORS.text },
  placeholderText: { fontSize: FONTS.sizes.md, color: COLORS.muted },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.xl, width: '90%' },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.lg, textAlign: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  stepBtn: { backgroundColor: COLORS.gray[200], paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: 8 },
  stepTxt: { color: COLORS.gray[700], fontSize: FONTS.sizes.md, fontWeight: '600' },
  currentText: { flex: 1, textAlign: 'center', color: COLORS.text, fontSize: FONTS.sizes.md },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.lg, gap: SPACING.md },
  cancelBtn: { backgroundColor: COLORS.gray[300], paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  cancelTxt: { color: COLORS.gray[700], fontSize: FONTS.sizes.md, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  confirmTxt: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: 'bold' },

  quickRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, justifyContent: 'center' },
  chip: { backgroundColor: COLORS.gray[200], paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: 999 },
  chipTxt: { color: COLORS.gray[700], fontSize: FONTS.sizes.sm, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between', marginTop: SPACING.sm },
  slot: { width: '23%', backgroundColor: COLORS.gray[200], paddingVertical: SPACING.sm, borderRadius: 8, alignItems: 'center' },
  slotDisabled: { opacity: 0.4 },
  slotTxt: { color: COLORS.gray[800], fontSize: FONTS.sizes.md, fontWeight: '600' },
  slotTxtDisabled: { color: COLORS.gray[500] },
});