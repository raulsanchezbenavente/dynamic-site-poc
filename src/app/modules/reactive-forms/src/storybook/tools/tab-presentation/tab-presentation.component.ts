import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'tab-presentation',
  imports: [NgClass],
  templateUrl: './tab-presentation.component.html',
  styleUrl: './tab-presentation.component.scss',
  standalone: true,
})
export class TabPresentationComponent {
  public activeTab: number = 0;

  public activateTab(tab: number): void {
    this.activeTab = tab;
  }
}
