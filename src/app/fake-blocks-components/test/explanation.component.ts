import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'pb-explanation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="explanation">
      <h3 class="explanation__title">Need help?</h3>

      <p class="explanation__text">
        Here you can review the available options and make your selection.
        Take your time to compare details before continuing.
      </p>

      <ul class="explanation__list">
        <li>All prices include taxes</li>
        <li>Availability may change</li>
        <li>You can modify your choice later</li>
      </ul>
    </aside>
  `,
})
export class ExplanationComponent {}
