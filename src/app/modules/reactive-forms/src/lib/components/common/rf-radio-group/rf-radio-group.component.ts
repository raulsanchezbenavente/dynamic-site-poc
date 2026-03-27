import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, inject, input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { RfRadioComponent } from '../../rf-radio/rf-radio.component';

@Component({
  selector: 'rf-radio-group',
  imports: [],
  templateUrl: './rf-radio-group.component.html',
  styleUrl: './styles/rf-radio-group.component.scss',
  host: { class: 'rf-radio-group' },
  standalone: true,
})
export class RfRadioGroupComponent implements OnDestroy, AfterContentInit {
  @ContentChild(RfRadioComponent, { static: false }) public radio!: RfRadioComponent;
  public legend = input<string>();
  public isInvalid: boolean = false;
  public ariaId: string | null = '';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private statusSub?: Subscription;

  public ngAfterContentInit(): void {
    const control = this.radio.getFormControl();
    this.isInvalid = control?.invalid || false;
    if (control) {
      this.isInvalid = control.invalid;
      this.statusSub = control.statusChanges.subscribe(() => {
        this.isInvalid = control.invalid;
        this.changeDetector.markForCheck();
      });
    }
    this.ariaId = this.radio?.ariaId();
    this.radio?.legend.set(this.legend());
    this.changeDetector.detectChanges();
  }

  public ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }
}
