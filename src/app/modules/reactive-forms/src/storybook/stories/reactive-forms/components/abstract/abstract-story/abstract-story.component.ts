import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from 'reactive-forms';

@Component({
  selector: 'abstract-story',
  templateUrl: './abstract-story.component.html',
  styleUrl: './abstract-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS],
})
export class AbstractStoryComponent {}
