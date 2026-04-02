import { Component, Input } from '@angular/core';
import { PassengerTypesVM } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'passenger-types',
  templateUrl: './passenger-types.component.html',
  styleUrls: ['./styles/passenger-types.style.scss'],
  imports: [TranslateModule],
  standalone: true,
})
export class PassengerTypesComponent {
  @Input() public model!: PassengerTypesVM;
}
