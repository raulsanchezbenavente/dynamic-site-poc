import { inject, Injectable } from '@angular/core';

import { Toast } from '../../toast/models/toast.model';

import { ToastStickyBehaviorService } from './toast-sticky-behavior.service';

@Injectable({ providedIn: 'root' })
export class ToastService {
  public toastCount: number = 0;
  public toastConfigs: Toast[] = [];
  private section: string = '';
  private readonly stickyCleanupFunctions = new Map<number, () => void>();

  private readonly stickyBehaviorService = inject(ToastStickyBehaviorService);

  public show(config: Toast, container: string): void {
    if (container) {
      this.toastCount++;
      this.toastConfigs.push(config);
      setTimeout(() => {
        const idToast = 'dynamicToast-' + (this.toastCount - 1);
        const dynamicToast = document.getElementById(idToast);
        const containerToast = document.getElementById(container);
        if (containerToast && dynamicToast) {
          containerToast.appendChild(dynamicToast);

          const cleanup = this.stickyBehaviorService.attachStickyBehavior(
            dynamicToast,
            containerToast,
            config.stickyViewportOffset
          );
          this.stickyCleanupFunctions.set(this.toastCount - 1, cleanup);
        }
      }, 10);
    }
  }

  public setSection(section: string): void {
    this.section = section;
  }

  public getSection(): string {
    return this.section;
  }

  public hidden(toastIndex: number): void {
    const toast = document.getElementById('dynamicToast-' + toastIndex);
    if (toast?.parentNode) {
      // Cleanup sticky behavior if exists
      const cleanup = this.stickyCleanupFunctions.get(toastIndex);
      if (cleanup) {
        cleanup();
        this.stickyCleanupFunctions.delete(toastIndex);
      }

      toast.remove();
    }
  }
}
