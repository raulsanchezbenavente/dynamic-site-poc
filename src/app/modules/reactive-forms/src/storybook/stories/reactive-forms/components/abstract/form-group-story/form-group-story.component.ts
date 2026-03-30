import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../../lib/standalone-imports';

@Component({
  selector: 'form-group-story',
  templateUrl: './form-group-story.component.html',
  styleUrl: './form-group-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS],
})
export class FormGroupStoryComponent {}
