import { NgClass } from '@angular/common';
import { Component, effect, input, OnInit } from '@angular/core';
import { IconConfig } from '@dcx/ui/libs';

@Component({
  selector: 'icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./styles/icon.styles.scss'],
  host: { class: 'ds-icon' },
  imports: [NgClass],
  standalone: true,
})
export class IconComponent implements OnInit {
  public ariaLabel: string | null = null;
  public config = input<Partial<IconConfig>>({});

  constructor() {}

  private readonly registerEffect = effect(() => {
    this.internalInit();
  });

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    const label = this.config()?.ariaAttributes?.ariaLabel;
    this.ariaLabel = label && label.trim() !== '' ? label.trim() : null;
  }
}
