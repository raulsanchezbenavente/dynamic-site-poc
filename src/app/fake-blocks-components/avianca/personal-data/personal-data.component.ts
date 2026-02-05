import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'personal-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent {}
