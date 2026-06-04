export const EASINGS = {
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',

  linear: 'linear',

  'expo-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
  'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',

  'back-in': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'back-in-out': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

export type EasingType = keyof typeof EASINGS;