import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

// Dynamic Water Drop Icon
export const SvgWaterDropIcon: React.FC<IconProps> = ({ color, size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z"
      fill={focused ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <Path
        d="M12 7c-2.76 0-5 2.24-5 5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    )}
  </Svg>
);

// Dynamic Hydro Tap & Valve Icon
export const SvgWaterValveIcon: React.FC<IconProps> = ({ color, size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 10v-3a2 2 0 012-2h4a2 2 0 012 2v3m-8 0h8m-8 0a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? `${color}30` : 'none'}
    />
    <Circle cx="12" cy="14" r="2" fill={color} />
    <Path d="M12 16v5m-3 0h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Dynamic Aquatic Wave Analytics Icon
export const SvgWaterWaveAnalyticsIcon: React.FC<IconProps> = ({ color, size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.5"
    />
    <Rect x="4" y="4" width="3" height="4" rx="1.5" fill={focused ? color : 'none'} stroke={color} strokeWidth="1.5" />
    <Rect x="10.5" y="2" width="3" height="6" rx="1.5" fill={focused ? color : 'none'} stroke={color} strokeWidth="1.5" />
    <Rect x="17" y="5" width="3" height="3" rx="1.5" fill={focused ? color : 'none'} stroke={color} strokeWidth="1.5" />
  </Svg>
);

// Dynamic Hydro User & Shield Icon
export const SvgWaterUserShieldIcon: React.FC<IconProps> = ({ color, size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l7 3.5v5c0 5.25-3.5 10.15-7 11.5 -3.5-1.35-7-6.25-7-11.5v-5L12 2z"
      fill={focused ? `${color}25` : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
    <Path
      d="M8.5 16a3.5 3.5 0 017 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);
