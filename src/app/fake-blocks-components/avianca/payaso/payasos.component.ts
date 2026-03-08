import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'payasos-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="payasos">
      <h2>Payasos de circo</h2>
      <div class="gallery">
        @for (image of images; track image.src) {
          <figure>
            <img
              [src]="image.src"
              [alt]="image.alt"
              loading="lazy"
              decoding="async" />
            <figcaption>{{ image.caption }}</figcaption>
          </figure>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .payasos {
        padding: 24px;
        background: #fff;
      }

      h2 {
        margin: 0 0 16px;
        color: #b1092d;
        font-size: 28px;
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }

      figure {
        margin: 0;
        border: 1px solid #ececec;
        border-radius: 10px;
        overflow: hidden;
        background: #fafafa;
      }

      img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
      }

      figcaption {
        padding: 10px;
        font-size: 14px;
        color: #333;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayasosComponent {
  public readonly images: Array<{ src: string; alt: string; caption: string }> = [
    {
      src: '/assets/illustrations/payasos/clown-1.svg',
      alt: 'Payaso de circo con maquillaje colorido',
      caption: 'Clown clasico',
    },
    {
      src: '/assets/illustrations/payasos/clown-2.svg',
      alt: 'Payaso sonriendo en espectaculo de circo',
      caption: 'Actuacion en pista',
    },
    {
      src: '/assets/illustrations/payasos/clown-3.svg',
      alt: 'Payaso en un show de circo',
      caption: 'Show de circo',
    },
  ];
}
