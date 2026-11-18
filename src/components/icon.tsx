import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'plus'
  | 'search'
  | 'check'
  | 'calendar'
  | 'flag'
  | 'trash'
  | 'close'
  | 'sparkle'
  | 'chevronDown'
  | 'edit'
  | 'leaf'
  | 'list';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function shape(name: IconName, color: string, strokeWidth: number): ReactNode {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  switch (name) {
    case 'plus':
      return (
        <>
          <Path d="M12 5v14" {...common} />
          <Path d="M5 12h14" {...common} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={6.5} {...common} />
          <Path d="M16.2 16.2 21 21" {...common} />
        </>
      );
    case 'check':
      return <Path d="M4.5 12.5 9.5 17.5 19.5 6.5" {...common} />;
    case 'calendar':
      return (
        <>
          <Rect x={3.5} y={5} width={17} height={15.5} rx={4} {...common} />
          <Path d="M8 3v3.5M16 3v3.5M3.5 10h17" {...common} />
        </>
      );
    case 'flag':
      return (
        <>
          <Path d="M6 21V4.5" {...common} />
          <Path d="M6 5h10.5l-1.8 3.6 1.8 3.6H6" {...common} />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M4 7h16M9.5 7V4.8h5V7" {...common} />
          <Path d="M6.2 7 7.3 20h9.4L17.8 7" {...common} />
          <Path d="M10.3 11v5M13.7 11v5" {...common} />
        </>
      );
    case 'close':
      return (
        <>
          <Path d="M6 6l12 12" {...common} />
          <Path d="M18 6 6 18" {...common} />
        </>
      );
    case 'sparkle':
      return (
        <>
          <Path d="M12 3.2l1.9 5.4L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" {...common} />
          <Path d="M18.5 16.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" {...common} />
        </>
      );
    case 'chevronDown':
      return <Path d="M6 9.5l6 6 6-6" {...common} />;
    case 'edit':
      return (
        <>
          <Path d="M4.5 19.5h3.2l10-10a2.1 2.1 0 0 0-3-3l-10 10z" {...common} />
          <Path d="M14 6.8l3 3" {...common} />
        </>
      );
    case 'leaf':
      return (
        <>
          <Path d="M20 4c0 9-5.2 13.2-11 13.2A5 5 0 0 1 4 12.2C4 6.6 10.6 4 20 4z" {...common} />
          <Path d="M4.5 20c1.8-5.4 5.6-9 10.5-11" {...common} />
        </>
      );
    case 'list':
      return (
        <>
          <Path d="M9 6.5h11M9 12h11M9 17.5h11" {...common} />
          <Circle cx={4.6} cy={6.5} r={1.2} fill={color} stroke="none" />
          <Circle cx={4.6} cy={12} r={1.2} fill={color} stroke="none" />
          <Circle cx={4.6} cy={17.5} r={1.2} fill={color} stroke="none" />
        </>
      );
    default:
      return null;
  }
}

export function Icon({ name, size = 20, color = '#23423A', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shape(name, color, strokeWidth)}
    </Svg>
  );
}
