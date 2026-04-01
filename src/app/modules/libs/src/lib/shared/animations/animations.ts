import {
  animate,
  animation,
  group,
  sequence,
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';

export const curtainEffec = trigger('curtainEffec', [
  transition('void => *', [
    style({
      overflow: 'hidden',
      height: 0,
    }),
    sequence([
      animate(
        '400ms',
        style({
          height: '*',
          overflow: 'hidden',
        })
      ),
      animate(
        '0ms 400ms',
        style({
          overflow: 'visible',
        })
      ),
    ]),
  ]),
  transition('* => void', [
    style({
      height: '*',
      overflow: 'hidden',
    }),
    group([
      animate(
        '10ms',
        style({
          overflow: 'hidden',
        })
      ),
      animate(
        '400ms 10ms ease-in-out',
        style({
          height: '0',
        })
      ),
    ]),
  ]),
]);
export const collapseAnimation = trigger('collapse', [
  state(
    'open',
    style({
      display: '*',
      height: '*',
      overflow: 'visible',
    })
  ),
  state(
    'closed',
    style({
      height: '0',
      overflow: 'hidden',
    })
  ),
  state(
    'none',
    style({
      height: '*',
    })
  ),
  transition('closed => open', [
    group([
      animate(
        '400ms ease-in-out',
        style({
          height: '*',
        })
      ),
      animate(
        '90ms 500ms ease-in-out',
        style({
          overflow: 'visible',
        })
      ),
    ]),
  ]),
  transition('open => closed', [
    style({
      height: '*',
      overflow: 'hidden',
    }),
    group([
      animate(
        '10ms', // 10ms
        style({
          overflow: 'hidden',
        })
      ),
      animate(
        '400ms 10ms', // 460ms ease-in-out
        style({
          height: '0',
        })
      ),
    ]),
  ]),
]);

/**
 * collapseAnimation
 *
 * Reusable animation trigger for collapsible sections (e.g., accordions, collapsible menus).
 * Combines height and opacity transitions for a smoother visual effect.
 *
 * - Enter/open: animates from height: 0 and opacity: 0 → height: auto and opacity: 1.
 * - Leave/close: animates from current height and opacity: 1 → height: 0 and opacity: 0.
 * - overflow: hidden is applied during animation to avoid scroll glitches or content jumps.
 * - overflow: visible is restored at the end of the expansion.
 *
 * Notes:
 * - Uses useAnimation(...) for reusable parameterized definitions.
 * - Compatible with both structural `*ngIf` transitions (:enter/:leave) and state-based toggling.
 * - Only animates valid CSS properties (no warnings like `overflow` being non-animatable).
 */
const expand = animation([
  style({
    height: '0',
    opacity: 0,
    overflow: 'hidden',
  }),
  animate(
    '{{timing}}',
    style({
      height: '*',
      opacity: 1,
    })
  ),
]);
const collapse = animation([
  style({
    height: '*',
    opacity: 1,
    overflow: 'hidden',
  }),
  animate(
    '{{timing}}',
    style({
      height: 0,
      opacity: 0,
    })
  ),
]);
export const collapseAnimationV2 = trigger('collapseAnimation', [
  transition(':enter', [
    useAnimation(expand, { params: { timing: '300ms ease-in-out' } }),
    style({ overflow: 'visible' }),
  ]),
  transition(':leave', [useAnimation(collapse, { params: { timing: '300ms ease-in-out' } })]),
  transition('closed => open', [
    useAnimation(expand, { params: { timing: '300ms ease-in-out' } }),
    style({ overflow: 'visible' }),
  ]),
  transition('open => closed', [useAnimation(collapse, { params: { timing: '300ms ease-in-out' } })]),
]);
