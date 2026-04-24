import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'rf-animated-label',
  templateUrl: './rf-animated-label.component.html',
  styleUrls: ['./styles/rf-animated-label.styles.scss'],
  host: {
    class: 'rf-animated-label',
  },
  imports: [NgClass],
})
export class RfAnimatedLabelComponent {
  public id = input<string | null>(null);
  public floating = input<boolean>(false);
  public focused = input<boolean>(false);
  public hide = input<boolean>(false);
  public error = input<boolean>(false);
  public disabled = input<boolean>();
  public for = input<string>('');
  public e2eId = input<string | null>(null);
}
