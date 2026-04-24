import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, model, output, viewChild } from '@angular/core';
import { IconComponent } from '@dcx/ui/design-system';

import { RfAppearanceTypes } from '../../../abstract/enums/rf-base-reactive-appearance.enum';
import { IdService } from '../../../services/id/id.service';
import { RfAnimatedLabelComponent } from '../rf-animated-label/rf-animated-label.component';

@Component({
  selector: 'rf-generic-drop-button',
  templateUrl: './rf-generic-drop-button.component.html',
  styleUrls: ['./styles/fr-generic-drop-button.styles.scss'],
  imports: [RfAnimatedLabelComponent, NgClass, IconComponent],
  standalone: true,
})
export class RfGenericDropButtonComponent {
  public idService = inject(IdService);
  public clickButton = output<MouseEvent>();
  public keydownButton = output<KeyboardEvent>();
  public readonly input = viewChild<ElementRef>('input');
  public appearance = model<RfAppearanceTypes>(RfAppearanceTypes.DEFAULT);
  public ariaId = model<string | null>('');
  public value = model<unknown>();
  public invalid = model<unknown>();
  public disabled = model<boolean | undefined>(false);
  public animatedLabel = model<string>('');
  public placeholder = model<string>('');
  public floatingLabel = model<boolean>(false);
  public dropIsOpen = model<boolean>(false);
  public readonly = model<boolean>(false);
  public activeDescendant = model<string | null>();
  public controls = model<string | null>();
  public classes = model<string | undefined>('');
  public rightIcon = model<string>('');
  public leftIcon = model<string>('');
  public hideCaret = model<boolean>(false);
  public errorMessagesShouldBeDisplayed = model<boolean>(false);
  public ariaLabelledBy = model<string>();
  public required = model<boolean>();
  public ariaReadonly = model<boolean>();
  public e2eId = model<string | null>(null);
  public appearanceTypes = RfAppearanceTypes;
  public labelId = this.idService.generateRandomId();

  get isLabelOnTop(): boolean {
    return !!(
      this.placeholder() ||
      this.appearance() === this.appearanceTypes.INTEGRATED ||
      this.dropIsOpen() ||
      this.value()
    );
  }

  public handleClick(event: MouseEvent): void {
    this.clickButton.emit(event);
  }

  public handleKeyDown(event: KeyboardEvent): void {
    this.keydownButton.emit(event);
  }

  public focusButton(): void {
    this.input()?.nativeElement.focus();
  }

  /** Set the focus on focussable element */
  public focus(): void {
    this.input()?.nativeElement.focus();
  }
}
