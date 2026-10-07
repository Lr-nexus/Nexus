import { light } from './light';
import { dark } from './dark';
import { typography } from './typography';
import { spacing, radius, shadow } from './spacing';

export const themes = { light, dark };
export { typography, spacing, radius, shadow };

export const colors = dark; // default export for legacy imports

export default { colors: dark, themes, typography, spacing, radius, shadow };