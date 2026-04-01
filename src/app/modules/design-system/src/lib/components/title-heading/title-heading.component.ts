import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostBinding, input } from '@angular/core';
import { HorizontalAlign } from '@dcx/ui/libs';

import { TitleHeading } from './enums/title-heading.enum';
import { TitleHeadingConfig } from './models/title-heading.model';

@Component({
  selector: 'ds-title-heading',
  templateUrl: './title-heading.component.html',
  styleUrls: ['./styles/title-heading.styles.scss'],
  host: { class: 'title-heading' },
  imports: [NgClass],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTitleHeadingComponent {
  public readonly config = input.required<TitleHeadingConfig>();
  public readonly titleHeading = TitleHeading;

  protected readonly resolvedConfig = computed(() => {
    const cfg = this.config();

    const htmlTag = this.resolveHeading(cfg.htmlTag ?? TitleHeading.H2);
    const styleClass = cfg.styleClass ?? TitleHeading.H1;
    const alignment = cfg.horizontalAlignment ?? HorizontalAlign.CENTER;

    return {
      title: cfg.title?.trim() ?? '',
      introText: cfg.introText?.trim() ?? '',
      htmlTag,
      alignment,
      isHidden: cfg.isVisuallyHidden ?? false,
      cssClasses: `title-heading_title context-${styleClass}`,
    };
  });

  @HostBinding('class')
  protected get hostClasses(): string {
    const alignment = this.resolvedConfig().alignment;
    return `title-heading--align-${alignment}`;
  }

  private resolveHeading(value: unknown): TitleHeading {
    return Object.values(TitleHeading).includes(value as TitleHeading) ? (value as TitleHeading) : TitleHeading.H2;
  }
}
