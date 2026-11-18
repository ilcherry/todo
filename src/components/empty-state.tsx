import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { FontFamily, Palette, Space } from '@/constants/design';

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Svg width={190} height={150} viewBox="0 0 190 150">
        <Circle cx={95} cy={72} r={60} fill={Palette.mintSoft} />
        <Circle cx={152} cy={34} r={9} fill={Palette.lemonSoft} />
        <Circle cx={36} cy={104} r={7} fill={Palette.skySoft} />
        <Circle cx={44} cy={40} r={4} fill={Palette.violetSoft} />

        <G transform="rotate(-7 95 75)">
          <Rect x={58} y={34} width={78} height={92} rx={16} fill="#FFFFFF" />
          <Rect x={72} y={56} width={44} height={7} rx={3.5} fill={Palette.mintSoft} />
          <Rect x={72} y={72} width={56} height={7} rx={3.5} fill={Palette.line} />
          <Rect x={72} y={88} width={38} height={7} rx={3.5} fill={Palette.line} />
          <Circle cx={72} cy={110} r={7} fill={Palette.mint} />
          <Path
            d="M69 110.5l2.2 2.3 4-4.4"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Rect x={85} y={106} width={30} height={6} rx={3} fill={Palette.mintSoft} />
        </G>

        <Path
          d="M140 52c9.5-7 6.5-19 6.5-19s-12.5 1.5-16 11c-2.4 6.6 2.6 11 9.5 8z"
          fill={Palette.mint}
          opacity={0.9}
        />
        <Path
          d="M139 51c-2.5-1-6-3.6-8.5-6"
          stroke={Palette.white}
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Space.huge,
    paddingHorizontal: Space.xl,
  },
  title: {
    fontFamily: FontFamily,
    fontSize: 15.5,
    fontWeight: '700',
    color: Palette.ink,
    marginTop: Space.md,
  },
  subtitle: {
    fontFamily: FontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    color: Palette.inkFaint,
    textAlign: 'center',
    marginTop: 6,
  },
});
