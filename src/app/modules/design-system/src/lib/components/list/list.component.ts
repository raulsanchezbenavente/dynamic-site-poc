import { NgClass } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { IconComponent } from '../icon/icon.component';

import { ListAppearance } from './enums/list-appearance.enum';
import { ListItem } from './models/list-item.model';
import { ListConfig } from './models/list.config';

@Component({
  selector: 'ds-list',
  templateUrl: './list.component.html',
  styleUrls: ['./styles/list.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ds-list',
  },
  imports: [NgClass, IconComponent],
  standalone: true,
})
export class ListComponent implements OnInit {
  @Input() public config?: ListConfig;
  @Input() public appearance?: ListAppearance;

  public items: (ListItem & { safeContent: SafeHtml })[] = [];

  constructor(private readonly sanitizer: DomSanitizer) {}

  public ngOnInit(): void {
    if (this.config) {
      this.items = this.config.items.map((item) => ({
        ...item,
        safeContent: this.sanitizer.bypassSecurityTrustHtml(item.content),
      }));
    }
  }
}
