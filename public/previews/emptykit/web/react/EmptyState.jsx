// React wrapper for the <empty-state> web component.
//
//   import { EmptyState } from 'emptykit-web/react';     // or './react/EmptyState.jsx'
//   <EmptyState name="no-results" look="mono" theme="dark" accent="teal" glow size={240} />
//
// Works with React 18 and 19. Props: name, look ('mono' | 'line' | 'blueprint'), theme ('light' | 'dark' | 'auto'),
// accent (preset name or '#hex'), glow, bold, lineScale, motion ('orbit' | 'tilt' | 'float' | 'none', default 'orbit'),
// yaw / pitch (degrees, a fixed pose), phase (seconds), hiddenEdges (default true), size (px), plus className / style /
// aria props passed to the element.
import { createElement } from 'react';
import '../empty-state.js';

export function EmptyState({ name, look = 'mono', theme = 'light', accent = 'indigo', glow = false, bold = false,
                             lineScale, motion = 'orbit', yaw, pitch, phase, hiddenEdges = true, size = 240, style,
                             ...rest }) {
  const attrs = {
    name, look, theme, accent, motion,
    'hidden-edges': String(hiddenEdges),
    style: { width: typeof size === 'number' ? `${size}px` : size, ...style },
    ...rest,
  };
  if (glow) attrs.glow = '';
  if (bold) attrs.bold = '';
  if (lineScale) attrs['line-scale'] = String(lineScale);
  for (const [k, v] of Object.entries({ yaw, pitch, phase })) if (v != null) attrs[k] = String(v);
  return createElement('empty-state', attrs);
}

export default EmptyState;
