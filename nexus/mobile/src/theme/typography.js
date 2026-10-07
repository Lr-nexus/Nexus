import { fontScale } from './responsive';

export const typography = {
  h1: { fontSize: fontScale(30), fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: fontScale(24), fontWeight: '700' },
  h3: { fontSize: fontScale(20), fontWeight: '700' },
  h4: { fontSize: fontScale(17), fontWeight: '700' },
  body: { fontSize: fontScale(15), lineHeight: fontScale(22) },
  bodySm: { fontSize: fontScale(13), lineHeight: fontScale(18) },
  caption: { fontSize: fontScale(12) },
  tiny: { fontSize: fontScale(10) },
  button: { fontSize: fontScale(16), fontWeight: '700' },
  buttonSm: { fontSize: fontScale(14), fontWeight: '600' },
  mono: { fontFamily: 'monospace' },
};