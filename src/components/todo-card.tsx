import { useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CategoryMeta, FontFamily, Palette, Radius, Shadow, Space } from '@/constants/design';
import type { Todo } from '@/types/todo';
import { dueLabel, isOverdue } from '@/utils/date';

const ACTION_WIDTH = 84;

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opened = useRef(false);
  const lastSwipeAt = useRef(0);
  const category = CategoryMeta[todo.category];

  /** 滑动松手后浏览器仍会派发 click，这里做一次短时拦截 */
  const tap = (action: () => void) => {
    if (Date.now() - lastSwipeAt.current < 320) return;
    action();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => {
          const base = opened.current ? -ACTION_WIDTH : 0;
          const next = Math.max(-ACTION_WIDTH - 16, Math.min(0, base + g.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const base = opened.current ? -ACTION_WIDTH : 0;
          const next = base + g.dx;
          const shouldOpen = next < -ACTION_WIDTH / 2;
          opened.current = shouldOpen;
          if (Math.abs(g.dx) > 6) lastSwipeAt.current = Date.now();
          Animated.spring(translateX, {
            toValue: shouldOpen ? -ACTION_WIDTH : 0,
            useNativeDriver: true,
            bounciness: 3,
            speed: 18,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: opened.current ? -ACTION_WIDTH : 0,
            useNativeDriver: true,
            bounciness: 3,
          }).start();
        },
      }),
    [translateX],
  );

  const overdue = isOverdue(todo.dueDate, todo.completed);

  return (
    <View style={styles.wrapper}>
      <View style={styles.actionLayer} pointerEvents="box-none">
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={() => onDelete(todo.id)}
          focusable={false}
          accessibilityRole="button"
          accessibilityLabel={`删除 ${todo.title}`}>
          <Icon name="trash" size={18} color={Palette.danger} />
          <Text style={styles.actionText}>删除</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.card, todo.completed && styles.cardDone, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}>
        <Pressable
          onPress={() => tap(() => onToggle(todo.id))}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: todo.completed }}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <View style={[styles.checkbox, todo.completed && styles.checkboxDone]}>
            {todo.completed && <Icon name="check" size={14} color={Palette.white} strokeWidth={2.8} />}
          </View>
        </Pressable>

        <Pressable style={styles.content} onPress={() => tap(() => onEdit(todo))}>
          <Text
            numberOfLines={2}
            style={[styles.title, todo.completed && styles.titleDone]}>
            {todo.title}
          </Text>

          {!!todo.note && (
            <Text numberOfLines={1} style={styles.note}>
              {todo.note}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={[styles.pill, { backgroundColor: category.soft }]}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <Text style={[styles.pillText, { color: category.color }]}>{category.label}</Text>
            </View>

            {!!todo.dueDate && (
              <View style={styles.metaItem}>
                <Icon
                  name="calendar"
                  size={12}
                  color={overdue ? Palette.danger : Palette.inkFaint}
                  strokeWidth={2}
                />
                <Text style={[styles.metaText, overdue && styles.overdueText]}>
                  {dueLabel(todo.dueDate)}
                </Text>
              </View>
            )}

            {todo.priority === 'high' && (
              <View style={styles.metaItem}>
                <Icon name="flag" size={12} color={Palette.coral} strokeWidth={2.1} />
                <Text style={[styles.metaText, { color: Palette.coral }]}>重要</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Space.md,
    justifyContent: 'center',
  },
  actionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    borderRadius: Radius.lg,
    backgroundColor: Palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionPressed: {
    backgroundColor: '#FFDDD4',
  },
  actionText: {
    fontFamily: FontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: Palette.danger,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    boxShadow: Shadow.card,
  },
  cardDone: {
    backgroundColor: '#FBFEFC',
  },
  pressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.8,
    borderColor: Palette.mintLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: Palette.white,
  },
  checkboxDone: {
    backgroundColor: Palette.mint,
    borderColor: Palette.mint,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: FontFamily,
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: '600',
    color: Palette.ink,
    letterSpacing: 0.1,
  },
  titleDone: {
    color: Palette.inkFaint,
    textDecorationLine: 'line-through',
  },
  note: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    lineHeight: 17,
    color: Palette.inkSoft,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pillText: {
    fontFamily: FontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily,
    fontSize: 11.5,
    fontWeight: '500',
    color: Palette.inkFaint,
  },
  overdueText: {
    color: Palette.danger,
  },
});
