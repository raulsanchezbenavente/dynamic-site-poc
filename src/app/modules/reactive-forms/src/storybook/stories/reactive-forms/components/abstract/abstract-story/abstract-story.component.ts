import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RfReactiveFormsModule } from 'reactive-forms';

@Component({
  selector: 'abstract-story',
  templateUrl: './abstract-story.component.html',
  styleUrl: './abstract-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, RfReactiveFormsModule],
})
export class AbstractStoryComponent {}
