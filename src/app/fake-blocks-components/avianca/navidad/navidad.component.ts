import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'navidad-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="navidad-wrapper">
      <div
        class="snow-layer"
        aria-hidden="true">
        @for (flake of flakes; track flake.left + '-' + flake.delay + '-' + flake.duration) {
          <span
            class="flake"
            [style.left.%]="flake.left"
            [style.animationDelay.s]="flake.delay"
            [style.animationDuration.s]="flake.duration"
            [style.opacity]="flake.opacity"
            [style.--scale]="flake.scale"
            [style.--drift.px]="10 + (flake.left % 6) * 3">
          </span>
        }
      </div>

      <div class="content">
        <h2>Temporada Navideña</h2>
        <p>Vuelos con ambiente festivo, luces, pinos y nieve cayendo.</p>
        <div
          class="motifs"
          aria-hidden="true">
          <div class="gift"></div>
          <div class="tree"></div>
          <div class="star"></div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .navidad-wrapper {
        position: relative;
        overflow: hidden;
        min-height: 190px;
        padding: 18px 22px;
        background: linear-gradient(180deg, #0f203d 0%, #1f4f82 60%, #2f7bb7 100%);
        color: #fff;
      }

      .snow-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .flake {
        position: absolute;
        top: -20px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #fff;
        animation-name: snowfallSine;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        will-change: transform;
      }

      .content {
        position: relative;
        z-index: 1;
        max-width: 620px;
      }

      h2 {
        margin: 0 0 8px;
        font-size: 26px;
      }

      p {
        margin: 0 0 14px;
        font-size: 15px;
        line-height: 1.45;
      }

      .motifs {
        display: flex;
        align-items: flex-end;
        gap: 16px;
      }

      .gift {
        width: 44px;
        height: 44px;
        background: #dc2626;
        position: relative;
        border-radius: 6px;
      }

      .gift::before,
      .gift::after {
        content: '';
        position: absolute;
        background: #fde68a;
      }

      .gift::before {
        width: 10px;
        height: 44px;
        left: 17px;
      }

      .gift::after {
        width: 44px;
        height: 10px;
        top: 17px;
      }

      .tree {
        width: 0;
        height: 0;
        border-left: 24px solid transparent;
        border-right: 24px solid transparent;
        border-bottom: 56px solid #16a34a;
        position: relative;
      }

      .tree::after {
        content: '';
        position: absolute;
        left: -5px;
        bottom: -66px;
        width: 10px;
        height: 12px;
        background: #78350f;
      }

      .star {
        width: 0;
        height: 0;
        border-right: 16px solid transparent;
        border-bottom: 11px solid #fde047;
        border-left: 16px solid transparent;
        transform: rotate(35deg);
        margin-bottom: 18px;
      }

      .star::before,
      .star::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
      }

      .star::before {
        border-bottom: 13px solid #fde047;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        top: -8px;
        left: -10px;
        transform: rotate(-35deg);
      }

      .star::after {
        border-right: 16px solid transparent;
        border-bottom: 11px solid #fde047;
        border-left: 16px solid transparent;
        top: 0;
        left: -17px;
        transform: rotate(-70deg);
      }

      @keyframes snowfallSine {
        0% {
          transform: translate3d(0, 0, 0) scale(var(--scale, 1));
        }

        12.5% {
          transform: translate3d(calc(var(--drift, 18px) * 0.7), 29px, 0) scale(var(--scale, 1));
        }

        25% {
          transform: translate3d(var(--drift, 18px), 58px, 0) scale(var(--scale, 1));
        }

        37.5% {
          transform: translate3d(calc(var(--drift, 18px) * 0.45), 86px, 0) scale(var(--scale, 1));
        }

        50% {
          transform: translate3d(0, 115px, 0) scale(var(--scale, 1));
        }

        62.5% {
          transform: translate3d(calc(var(--drift, 18px) * -0.55), 144px, 0) scale(var(--scale, 1));
        }

        75% {
          transform: translate3d(calc(var(--drift, 18px) * -1), 173px, 0) scale(var(--scale, 1));
        }

        87.5% {
          transform: translate3d(calc(var(--drift, 18px) * -0.35), 202px, 0) scale(var(--scale, 1));
        }

        100% {
          transform: translate3d(0, 230px, 0) scale(var(--scale, 1));
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavidadComponent {
  public readonly flakes = [
    { left: 5, delay: 0, duration: 7, opacity: 0.75, scale: 1 },
    { left: 14, delay: 1.8, duration: 8.5, opacity: 0.6, scale: 0.9 },
    { left: 22, delay: 0.7, duration: 6.8, opacity: 0.8, scale: 1.1 },
    { left: 27, delay: 0.4, duration: 7.3, opacity: 0.74, scale: 0.95 },
    { left: 31, delay: 2.4, duration: 9.2, opacity: 0.55, scale: 0.85 },
    { left: 36, delay: 1.4, duration: 6.4, opacity: 0.79, scale: 1.15 },
    { left: 40, delay: 1.2, duration: 7.4, opacity: 0.65, scale: 1 },
    { left: 44, delay: 2.7, duration: 9.4, opacity: 0.52, scale: 0.82 },
    { left: 49, delay: 0.3, duration: 6.2, opacity: 0.85, scale: 1.2 },
    { left: 53, delay: 1.9, duration: 7.8, opacity: 0.66, scale: 0.98 },
    { left: 58, delay: 2.8, duration: 8.8, opacity: 0.5, scale: 0.8 },
    { left: 62, delay: 0.6, duration: 6.6, opacity: 0.82, scale: 1.07 },
    { left: 67, delay: 1.6, duration: 7.1, opacity: 0.7, scale: 1 },
    { left: 71, delay: 2.1, duration: 8.9, opacity: 0.57, scale: 0.9 },
    { left: 76, delay: 0.9, duration: 6.9, opacity: 0.65, scale: 1.05 },
    { left: 80, delay: 1.5, duration: 7.6, opacity: 0.69, scale: 0.94 },
    { left: 85, delay: 2.2, duration: 8.1, opacity: 0.58, scale: 0.95 },
    { left: 89, delay: 0.2, duration: 6.7, opacity: 0.8, scale: 1.12 },
    { left: 93, delay: 1.1, duration: 7.7, opacity: 0.72, scale: 1.1 },
    { left: 97, delay: 2.9, duration: 9.1, opacity: 0.54, scale: 0.86 },
    { left: 8, delay: 1.3, duration: 8.2, opacity: 0.61, scale: 0.92 },
    { left: 18, delay: 2.5, duration: 9.3, opacity: 0.5, scale: 0.78 },
    { left: 34, delay: 0.1, duration: 6.1, opacity: 0.86, scale: 1.2 },
    { left: 46, delay: 1.7, duration: 7.9, opacity: 0.64, scale: 0.96 },
    { left: 60, delay: 2.3, duration: 8.6, opacity: 0.56, scale: 0.84 },
    { left: 74, delay: 0.8, duration: 6.5, opacity: 0.83, scale: 1.08 },
    { left: 88, delay: 1.0, duration: 7.2, opacity: 0.71, scale: 1.03 },
  ];
}
