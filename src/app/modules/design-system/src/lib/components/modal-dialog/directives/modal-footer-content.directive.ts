import { Directive } from '@angular/core';

@Directive({
  selector: '[modalFooterContent]',
  standalone: true,
  host: { class: 'modal-footer-content' },
})
export class ModalFooterContentDirective {}
