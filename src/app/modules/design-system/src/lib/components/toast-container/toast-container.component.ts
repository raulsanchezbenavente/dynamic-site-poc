import { Component, inject, input } from '@angular/core';

import { ToastStatus } from '../toast/enums/toast-status.enum';
import { ToastComponent } from '../toast/toast.component';

import { ToastService } from './services/toast.service';

@Component({
  selector: 'toast-container',
  templateUrl: './toast-container.component.html',
  styleUrl: './styles/toast-container.styles.scss',
  imports: [ToastComponent],
  standalone: true,
})
export class ToastContainerComponent {
  public suffixToastId = input<string>('');
  public ToastStatus = ToastStatus;
  public document = document;
  public toastService = inject(ToastService);

  public hidden(toastCount: number): void {
    this.toastService.hidden(toastCount);
  }
}
