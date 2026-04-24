import { AfterViewInit, ChangeDetectorRef, Component, ContentChild, inject, input } from '@angular/core';

import { RfCheckboxComponent } from '../../rf-checkbox/rf-checkbox.component';

@Component({
  selector: 'rf-checkbox-group',
  imports: [],
  templateUrl: './rf-checkbox-group.component.html',
  styleUrls: ['./styles/rf-checkbox-group.styles.scss'],
  host: { class: 'rf-checkbox-group' },
  standalone: true,
})
export class RfCheckboxGroupComponent implements AfterViewInit {
  @ContentChild(RfCheckboxComponent, { static: false }) public checkbox!: RfCheckboxComponent;
  public legend = input<string>();
  private readonly changeDetector = inject(ChangeDetectorRef);
  public ngAfterViewInit(): void {
    this.checkbox?.legend.set(this.legend());
    this.changeDetector.detectChanges();
  }
}
