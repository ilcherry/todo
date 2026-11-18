import { Platform } from 'react-native';

/** 小清新配色：薄荷 + 奶油白 + 珊瑚点缀 */
export const Palette = {
  bg: '#F3FAF6',
  bgDeep: '#E7F4ED',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FCFA',

  mint: '#5BC0A0',
  mintDeep: '#2E8C74',
  mintSoft: '#DFF3EA',
  mintLine: '#D3EBE0',

  sky: '#7EC8DF',
  skySoft: '#E4F4FA',
  coral: '#FF9C86',
  coralSoft: '#FFEAE4',
  lemon: '#EFC05F',
  lemonSoft: '#FFF6DE',
  violet: '#A79AE3',
  violetSoft: '#EFEBFB',

  ink: '#23423A',
  inkSoft: '#5F7C73',
  inkFaint: '#9DB3AB',
  line: '#E8F2ED',
  white: '#FFFFFF',
  danger: '#E4695C',
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 36,
} as const;

export const FontFamily = Platform.select({
  ios: 'ui-rounded',
  android: 'sans-serif',
  web: 'var(--font-rounded)',
  default: 'System',
});

/** RN 0.76+ / 新架构支持的 boxShadow 字符串，web 与原生表现一致 */
export const Shadow = {
  card: '0px 6px 18px rgba(46, 140, 116, 0.08)',
  soft: '0px 3px 10px rgba(46, 140, 116, 0.06)',
  float: '0px 12px 26px rgba(46, 140, 116, 0.30)',
  sheet: '0px -10px 40px rgba(30, 70, 60, 0.16)',
} as const;

export const CategoryMeta = {
  personal: { label: '个人', color: Palette.mint, soft: Palette.mintSoft },
  work: { label: '工作', color: Palette.sky, soft: Palette.skySoft },
  study: { label: '学习', color: Palette.violet, soft: Palette.violetSoft },
  life: { label: '生活', color: Palette.coral, soft: Palette.coralSoft },
} as const;

export const PriorityMeta = {
  high: { label: '重要', color: Palette.coral, soft: Palette.coralSoft },
  medium: { label: '一般', color: Palette.lemon, soft: Palette.lemonSoft },
  low: { label: '随手', color: Palette.mint, soft: Palette.mintSoft },
} as const;

export const CategoryOrder = ['personal', 'work', 'study', 'life'] as const;
export const PriorityOrder = ['high', 'medium', 'low'] as const;
