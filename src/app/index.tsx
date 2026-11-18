import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { ProgressRing } from '@/components/progress-ring';
import { TaskSheet } from '@/components/task-sheet';
import { TodoCard } from '@/components/todo-card';
import {
  CategoryMeta,
  CategoryOrder,
  FontFamily,
  Palette,
  Radius,
  Shadow,
  Space,
} from '@/constants/design';
import { sortTodos, useTodos } from '@/store/use-todos';
import type { CategoryId, Todo, TodoDraft, TodoFilter } from '@/types/todo';
import { endOfWeekKey, fullDateLabel, greeting, todayKey } from '@/utils/date';

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'today', label: '今天' },
  { id: 'week', label: '本周' },
  { id: 'done', label: '已完成' },
];

const tap = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync().catch(() => {});
  }
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { todos, ready, addTodo, updateTodo, toggleTodo, removeTodo, restoreTodo, clearCompleted } =
    useTodos();

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [toast, setToast] = useState<{ text: string; todo: Todo } | null>(null);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const columnWidth = Math.min(width, 540);
  const edge = Math.max(0, (width - columnWidth) / 2);

  const today = todayKey();
  const weekEnd = endOfWeekKey();

  const stats = useMemo(() => {
    const todayList = todos.filter((t) => t.dueDate === today);
    const todayDone = todayList.filter((t) => t.completed).length;
    const doneAll = todos.filter((t) => t.completed).length;
    const overdue = todos.filter(
      (t) => !t.completed && t.dueDate !== null && t.dueDate < today,
    ).length;
    return {
      todayTotal: todayList.length,
      todayDone,
      doneAll,
      overdue,
      pending: todos.length - doneAll,
      progress: todayList.length > 0 ? todayDone / todayList.length : doneAll > 0 ? 0.999 : 0,
    };
  }, [todos, today]);

  useEffect(() => {
    if (!toast) return;
    Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dismissToast(), 4000);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const dismissToast = useCallback(() => {
    Animated.timing(toastAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setToast(null);
      },
    );
  }, [toastAnim]);

  const groups = useMemo(() => {
    let list = todos;
    if (category !== 'all') list = list.filter((t) => t.category === category);
    if (filter === 'today') list = list.filter((t) => t.dueDate !== null && t.dueDate <= today);
    if (filter === 'week') list = list.filter((t) => t.dueDate !== null && t.dueDate <= weekEnd);
    if (filter === 'done') list = list.filter((t) => t.completed);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.note.toLowerCase().includes(q),
      );
    }

    const sorted = sortTodos(list);
    return {
      pending: sorted.filter((t) => !t.completed),
      done: sorted.filter((t) => t.completed),
    };
  }, [todos, category, filter, query, today, weekEnd]);

  const openCreate = () => {
    tap();
    setEditing(null);
    setSheetVisible(true);
  };

  const openEdit = (todo: Todo) => {
    setEditing(todo);
    setSheetVisible(true);
  };

  const handleSubmit = (draft: TodoDraft) => {
    tap();
    if (editing) updateTodo(editing.id, draft);
    else addTodo(draft);
    setSheetVisible(false);
    setEditing(null);
  };

  const handleDelete = (todo: Todo) => {
    removeTodo(todo.id);
    setSheetVisible(false);
    setEditing(null);
    setToast({ text: todo.title, todo });
  };

  const handleToggle = (id: string) => {
    tap();
    toggleTodo(id);
  };

  const total = groups.pending.length + groups.done.length;

  const emptyCopy = (() => {
    if (query.trim()) return { title: '没有找到相关待办', subtitle: '换个关键词，或者新建一件小事。' };
    if (filter === 'done') return { title: '还没有完成的任务', subtitle: '勾选一个小目标，成就感会慢慢攒起来的。' };
    if (filter === 'today') return { title: '今天没有安排', subtitle: '留一点空白也很好，或点右下角加一件事。' };
    if (filter === 'week') return { title: '本周很轻松', subtitle: '暂时没有临近的截止日期。' };
    return { title: '清单还是空的', subtitle: '把心里惦记的事写下来，脑袋就空出来了。' };
  })();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}>
        <View style={[styles.column, { width: columnWidth }]}>
          {/* ---------- Hero ---------- */}
          <LinearGradient
            colors={['#D4F1E4', '#EAF8F1', Palette.bg]}
            locations={[0, 0.55, 1]}
            style={[styles.hero, { paddingTop: insets.top + 18 }]}>
            <View style={styles.blobA} pointerEvents="none" />
            <View style={styles.blobB} pointerEvents="none" />
            <View style={styles.blobC} pointerEvents="none" />

            <View style={styles.brandRow}>
              <View style={styles.brandLockup}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.brandMark}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>轻待办</Text>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{fullDateLabel()}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>把小事，一件件做好</Text>
            <Text style={styles.heroMeta}>
              {greeting().text} {greeting().emoji}
              {'  ·  '}
              {stats.pending > 0
                ? `还有 ${stats.pending} 件事在等你`
                : '清单已经清空，去晒晒太阳吧'}
              {stats.overdue > 0 ? ` · ${stats.overdue} 件已逾期` : ''}
            </Text>

            <View style={styles.heroPanel}>
              <ProgressRing progress={stats.progress} size={74} stroke={8}>
                <Text style={styles.ringValue}>{Math.round(stats.progress * 100)}%</Text>
              </ProgressRing>
              <View style={styles.heroPanelText}>
                <Text style={styles.panelLabel}>今日进度</Text>
                <Text style={styles.panelValue}>
                  {stats.todayDone}
                  <Text style={styles.panelValueSoft}> / {stats.todayTotal || 0} 件</Text>
                </Text>
                <Text style={styles.panelHint}>
                  {stats.todayTotal > 0 && stats.todayDone === stats.todayTotal
                    ? '今天全部完成，很棒 🌿'
                    : stats.todayTotal === 0
                      ? '今天还没有安排'
                      : `再完成 ${stats.todayTotal - stats.todayDone} 件就收工`}
                </Text>
              </View>
              <View style={styles.panelDivider} />
              <View style={styles.panelSide}>
                <Text style={styles.sideValue}>{stats.pending}</Text>
                <Text style={styles.sideLabel}>待办</Text>
                <Text style={[styles.sideValue, { marginTop: 10 }]}>{stats.doneAll}</Text>
                <Text style={styles.sideLabel}>完成</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ---------- Body ---------- */}
          <View style={styles.body}>
            <View style={styles.searchBar}>
              <Icon name="search" size={17} color={Palette.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="搜索待办..."
                placeholderTextColor={Palette.inkFaint}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Icon name="close" size={15} color={Palette.inkFaint} />
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}>
              <Pressable
                onPress={() => setCategory('all')}
                style={[
                  styles.catChip,
                  category === 'all' ? styles.catChipActive : styles.catChipIdle,
                ]}>
                <Icon
                  name="list"
                  size={13}
                  color={category === 'all' ? Palette.white : Palette.inkSoft}
                />
                <Text
                  style={[
                    styles.catText,
                    { color: category === 'all' ? Palette.white : Palette.inkSoft },
                  ]}>
                  全部
                </Text>
              </Pressable>
              {CategoryOrder.map((id) => {
                const meta = CategoryMeta[id];
                const active = category === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setCategory(active ? 'all' : id)}
                    style={[
                      styles.catChip,
                      active
                        ? { backgroundColor: meta.color }
                        : styles.catChipIdle,
                    ]}>
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: active ? Palette.white : meta.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.catText,
                        { color: active ? Palette.white : Palette.inkSoft },
                      ]}>
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.segment}>
              {FILTERS.map((item) => {
                const active = filter === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setFilter(item.id)}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}>
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!ready ? (
              <View style={styles.loading}>
                <ActivityIndicator color={Palette.mint} />
              </View>
            ) : total === 0 ? (
              <EmptyState title={emptyCopy.title} subtitle={emptyCopy.subtitle} />
            ) : (
              <>
                {groups.pending.length > 0 && (
                  <>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupTitle}>待完成</Text>
                      <Text style={styles.groupCount}>{groups.pending.length}</Text>
                    </View>
                    {groups.pending.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={(id) => {
                          const target = todos.find((t) => t.id === id);
                          if (target) handleDelete(target);
                        }}
                      />
                    ))}
                  </>
                )}

                {groups.done.length > 0 && (
                  <>
                    <View style={[styles.groupHeader, groups.pending.length > 0 && { marginTop: 18 }]}>
                      <Text style={styles.groupTitle}>已完成</Text>
                      <Text style={styles.groupCount}>{groups.done.length}</Text>
                      <Pressable
                        onPress={() => {
                          tap();
                          clearCompleted();
                        }}
                        hitSlop={8}
                        style={styles.clearButton}>
                        <Text style={styles.clearText}>清除</Text>
                      </Pressable>
                    </View>
                    {groups.done.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={(id) => {
                          const target = todos.find((t) => t.id === id);
                          if (target) handleDelete(target);
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            <View style={styles.footerNote}>
              <Icon name="leaf" size={13} color={Palette.inkFaint} />
              <Text style={styles.footerText}>左滑删除 · 点一下勾选 · 轻触卡片编辑</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---------- 悬浮层（与内容列对齐，避免大屏偏移） ---------- */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          onPress={openCreate}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 26, right: edge + Space.xl + 2 },
            pressed && styles.fabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="新建待办">
          <LinearGradient
            colors={['#67CBAB', '#2E8C74']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}>
            <Icon name="plus" size={26} color={Palette.white} strokeWidth={2.4} />
          </LinearGradient>
        </Pressable>

        {toast && (
          <Animated.View
            style={[
              styles.toast,
              {
                bottom: insets.bottom + 100,
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Icon name="leaf" size={14} color="#9FE0C6" />
            <Text numberOfLines={1} style={styles.toastText}>
              已删除「{toast.text}」
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => {
                restoreTodo(toast.todo);
                dismissToast();
              }}>
              <Text style={styles.toastAction}>撤销</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <TaskSheet
        visible={sheetVisible}
        editing={editing}
        onClose={() => {
          setSheetVisible(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        onDelete={
          editing
            ? () => {
                handleDelete(editing);
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  scrollContent: {
    alignItems: 'center',
  },
  column: {
    alignSelf: 'center',
  },
  hero: {
    paddingHorizontal: Space.xl + 2,
    paddingBottom: Space.xl + 4,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  blobA: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.55)',
    top: -78,
    right: -52,
  },
  blobB: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.38)',
    top: 86,
    right: 42,
  },
  blobC: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.30)',
    bottom: -30,
    left: -24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  brandName: {
    fontFamily: FontFamily,
    fontSize: 14.5,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: 1.2,
  },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  dateBadgeText: {
    fontFamily: FontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: Palette.mintDeep,
  },
  heroTitle: {
    fontFamily: FontFamily,
    fontSize: 25,
    lineHeight: 34,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: 0.4,
    marginTop: 14,
  },
  heroMeta: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    color: Palette.inkSoft,
    marginTop: 7,
  },
  heroPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    boxShadow: '0px 6px 18px rgba(46, 140, 116, 0.06)',
  },
  ringValue: {
    fontFamily: FontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: Palette.mintDeep,
  },
  heroPanelText: {
    flex: 1,
    gap: 2,
  },
  panelLabel: {
    fontFamily: FontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: Palette.inkFaint,
    letterSpacing: 0.4,
  },
  panelValue: {
    fontFamily: FontFamily,
    fontSize: 21,
    fontWeight: '700',
    color: Palette.ink,
  },
  panelValueSoft: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.inkFaint,
  },
  panelHint: {
    fontFamily: FontFamily,
    fontSize: 11,
    color: Palette.inkSoft,
  },
  panelDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(35,66,58,0.08)',
    marginVertical: 4,
  },
  panelSide: {
    alignItems: 'center',
    paddingLeft: 2,
    minWidth: 42,
  },
  sideValue: {
    fontFamily: FontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: Palette.mintDeep,
  },
  sideLabel: {
    fontFamily: FontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: Palette.inkFaint,
  },
  body: {
    paddingHorizontal: Space.xl + 2,
    paddingTop: Space.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily,
    fontSize: 13.5,
    color: Palette.ink,
    paddingVertical: 0,
    outlineWidth: 0,
  },
  chipScroll: {
    gap: Space.sm,
    paddingVertical: Space.md,
    paddingRight: Space.lg,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  catChipActive: {
    backgroundColor: Palette.ink,
  },
  catChipIdle: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  catDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  catText: {
    fontFamily: FontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Palette.bgDeep,
    borderRadius: Radius.pill,
    padding: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  segmentItemActive: {
    backgroundColor: Palette.surface,
    boxShadow: '0px 2px 6px rgba(46, 140, 116, 0.10)',
  },
  segmentText: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    fontWeight: '600',
    color: Palette.inkSoft,
  },
  segmentTextActive: {
    color: Palette.mintDeep,
    fontWeight: '700',
  },
  loading: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Space.lg,
    marginBottom: Space.sm + 2,
  },
  groupTitle: {
    fontFamily: FontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Palette.inkSoft,
  },
  groupCount: {
    fontFamily: FontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: Palette.inkFaint,
    backgroundColor: Palette.bgDeep,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  clearButton: {
    marginLeft: 'auto',
  },
  clearText: {
    fontFamily: FontFamily,
    fontSize: 11.5,
    fontWeight: '600',
    color: Palette.mintDeep,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Space.xl,
  },
  footerText: {
    fontFamily: FontFamily,
    fontSize: 11,
    color: Palette.inkFaint,
  },
  fab: {
    position: 'absolute',
    right: Space.xl + 2,
    width: 58,
    height: 58,
    borderRadius: 29,
    boxShadow: Shadow.float,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  fabInner: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '86%',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: Radius.pill,
    backgroundColor: Palette.ink,
    boxShadow: '0px 10px 24px rgba(35,66,58,0.24)',
  },
  toastText: {
    flexShrink: 1,
    fontFamily: FontFamily,
    fontSize: 12.5,
    color: '#E8F6F0',
  },
  toastAction: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8FE3C7',
  },
});
