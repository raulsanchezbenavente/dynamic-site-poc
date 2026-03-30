import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from 'reactive-forms';

@Component({
  selector: 'form-control-story',
  templateUrl: './form-control-story.component.html',
  styleUrl: './form-control-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS],
})
export class FormControlStoryComponent {}
