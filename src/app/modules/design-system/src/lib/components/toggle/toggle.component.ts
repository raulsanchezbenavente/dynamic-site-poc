import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { GenerateIdPipe, ToggleConfig } from '@dcx/ui/libs';

@Component({
  selector: 'toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./styles/toggle.style.scss'],
  imports: [NgClass],
    standalone: true
})
export class ToggleComponent implements OnInit {
  @Input({ required: true }) public config!: ToggleConfig;

  @Output() public toggleClickEmitter = new EventEmitter<boolean>();

  public inputId: string = '';
  public labelId: string = '';

  constructor(protected generateId: GenerateIdPipe) {}

  public ngOnInit(): void {
    this.inputId = this.generateId.transform('toggleId_');
    this.labelId = this.generateId.transform('labelId_');
  }

  public toggleChange(): void {
    this.config.isChecked = !this.config.isChecked;
    this.toggleClickEmitter.next(this.config.isChecked);
  }
}
