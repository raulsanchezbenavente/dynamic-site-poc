import { Component, input } from '@angular/core';

@Component({
  selector: 'rf-aria-described-error',
  imports: [],
  templateUrl: './rf-aria-described-error.component.html',
  standalone: true,
})
export class RfAriaDescribedErrorComponent {
  public id = input<string | undefined | null>('');
  public errorMessage = input<string | undefined | null>('');
}
