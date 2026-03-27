import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RfReactiveFormsModule } from '../../../../../../lib/reactive-forms.module';

@Component({
  selector: 'form-group-story',
  templateUrl: './form-group-story.component.html',
  styleUrl: './form-group-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, RfReactiveFormsModule],
})
export class FormGroupStoryComponent {}
