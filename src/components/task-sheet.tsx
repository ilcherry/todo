import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import {
  CategoryMeta,
  CategoryOrder,
  FontFamily,
  Palette,
  PriorityMeta,
  PriorityOrder,
  Radius,
  Shadow,
  Space,
} from '@/constants/design';
import type { CategoryId, Priority, Todo, TodoDraft } from '@/types/todo';
import { dueLabel, endOfWeekKey, addDays, todayKey } from '@/utils/date';

interface TaskSheetProps {
  visible: boolean;
  editing: Todo | null;
  onClose: () => void;
  onSubmit: (draft: TodoDraft) => void;
  onDelete?: (id: string) => void;
}

const EMPTY: TodoDraft = {
  title: '',
  note: '',
  category: 'personal',
  priority: 'medium',
  dueDate: todayKey(),
};

export function TaskSheet({ visible, editing, onClose, onSubmit, onDelete }: TaskSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TodoDraft>(EMPTY);
  const slide = useRef(new Animated.Value(28)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setDraft(
      editing
        ? {
            title: editing.title,
            note: editing.note,
            category: editing.category,
            priority: editing.priority,
            dueDate: editing.dueDate,
          }
        : { ...EMPTY, dueDate: todayKey() },
    );
    slide.setValue(28);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 16 }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [visible, editing, slide, fade]);

  const dueOptions = useMemo(() => {
    const today = todayKey();
    const options = [
      { key: today, label: '今天' },
      { key: addDays(today, 1), label: '明天' },
      { key: endOfWeekKey(), label: '本周日' },
    ];
    const unique = options.filter((o, i) => options.findIndex((x) => x.key === o.key) === i);
    if (draft.dueDate && !unique.some((o) => o.key === draft.dueDate)) {
      unique.push({ key: draft.dueDate, label: dueLabel(draft.dueDate) });
    }
    return unique;
  }, [draft.dueDate]);

  const canSave = draft.title.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSubmit(draft);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          pointerEvents="box-none">
          <Animated.View
            style={[
              styles.panel,
              { paddingBottom: Math.max(insets.bottom, 16) + 6, transform: [{ translateY: slide }] },
            ]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>{editing ? '编辑待办' : '新的待办'}</Text>
                <Text style={styles.title}>{editing ? '调整一下细节' : '想做点什么？'}</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Icon name="close" size={18} color={Palette.inkSoft} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <TextInput
                value={draft.title}
                onChangeText={(title) => setDraft((d) => ({ ...d, title }))}
                placeholder="比如：给绿萝浇水"
                placeholderTextColor={Palette.inkFaint}
                style={styles.titleInput}
                returnKeyType="done"
                maxLength={60}
                autoFocus={false}
              />

              <TextInput
                value={draft.note}
                onChangeText={(note) => setDraft((d) => ({ ...d, note }))}
                placeholder="补充一点说明（可选）"
                placeholderTextColor={Palette.inkFaint}
                style={styles.noteInput}
                multiline
                maxLength={200}
              />

              <Text style={styles.sectionLabel}>分类</Text>
              <View style={styles.chipRow}>
                {CategoryOrder.map((id) => {
                  const meta = CategoryMeta[id as CategoryId];
                  const active = draft.category === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setDraft((d) => ({ ...d, category: id as CategoryId }))}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? meta.color : meta.soft },
                      ]}>
                      <View
                        style={[
                          styles.chipDot,
                          { backgroundColor: active ? Palette.white : meta.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? Palette.white : meta.color },
                        ]}>
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>优先级</Text>
              <View style={styles.chipRow}>
                {PriorityOrder.map((id) => {
                  const meta = PriorityMeta[id as Priority];
                  const active = draft.priority === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setDraft((d) => ({ ...d, priority: id as Priority }))}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? meta.color : meta.soft },
                      ]}>
                      <Icon
                        name="flag"
                        size={12}
                        color={active ? Palette.white : meta.color}
                        strokeWidth={2.2}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? Palette.white : meta.color },
                        ]}>
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>截止日期</Text>
              <View style={styles.chipRow}>
                {dueOptions.map((option) => {
                  const active = draft.dueDate === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setDraft((d) => ({ ...d, dueDate: option.key }))}
                      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
                      <Icon
                        name="calendar"
                        size={12}
                        color={active ? Palette.white : Palette.inkSoft}
                        strokeWidth={2.1}
                      />
                      <Text
                        style={[styles.chipText, { color: active ? Palette.white : Palette.inkSoft }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setDraft((d) => ({ ...d, dueDate: null }))}
                  style={[
                    styles.chip,
                    draft.dueDate === null ? styles.chipActive : styles.chipIdle,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: draft.dueDate === null ? Palette.white : Palette.inkSoft },
                    ]}>
                    不设
                  </Text>
                </Pressable>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              {editing && onDelete ? (
                <Pressable
                  onPress={() => onDelete(editing.id)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                  <Icon name="trash" size={17} color={Palette.danger} />
                </Pressable>
              ) : null}

              <Pressable
                onPress={submit}
                disabled={!canSave}
                style={({ pressed }) => [
                  styles.saveWrapper,
                  !canSave && styles.saveDisabled,
                  pressed && canSave && styles.savePressed,
                ]}>
                <LinearGradient
                  colors={['#63C9A9', '#2E8C74']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButton}>
                  <Icon name="check" size={17} color={Palette.white} strokeWidth={2.6} />
                  <Text style={styles.saveText}>{editing ? '保存修改' : '加入清单'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 58, 49, 0.32)',
  },
  keyboard: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Space.xl,
    paddingTop: Space.sm,
    maxHeight: '90%',
    boxShadow: Shadow.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.line,
    marginBottom: Space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: FontFamily,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: Palette.mint,
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  scroll: {
    marginTop: Space.lg,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Space.sm,
  },
  titleInput: {
    fontFamily: FontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.ink,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  noteInput: {
    fontFamily: FontFamily,
    fontSize: 13.5,
    lineHeight: 19,
    color: Palette.inkSoft,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: Space.sm,
    minHeight: 62,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontFamily: FontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Palette.inkFaint,
    marginTop: Space.xl,
    marginBottom: Space.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  chipActive: {
    backgroundColor: Palette.ink,
  },
  chipIdle: {
    backgroundColor: Palette.surfaceAlt,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  chipText: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingTop: Space.lg,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveWrapper: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    boxShadow: '0px 8px 18px rgba(46, 140, 116, 0.28)',
  },
  saveDisabled: {
    opacity: 0.45,
    boxShadow: '0px 0px 0px rgba(0,0,0,0)',
  },
  savePressed: {
    opacity: 0.88,
  },
  saveButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    fontFamily: FontFamily,
    fontSize: 15.5,
    fontWeight: '700',
    color: Palette.white,
    letterSpacing: 0.4,
  },
});
