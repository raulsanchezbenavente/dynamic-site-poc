import { Component, input } from '@angular/core';

@Component({
  selector: 'schedule-graphic-line',
  templateUrl: './schedule-graphic-line.component.html',
  styleUrls: ['./styles/schedule-graphic-line.styles.scss'],
  host: {
    class: 'schedule-graphic-line',
  },
  imports: [],
  standalone: true,
})
export class ScheduleGraphicLineComponent {
  public hasConnection = input<boolean>(false);
}
