import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'form-group-story',
  templateUrl: './form-group-story.component.html',
  styleUrl: './form-group-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class FormGroupStoryComponent {}
