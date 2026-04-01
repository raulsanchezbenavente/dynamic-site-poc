import { Component, ElementRef, inject, model, OnInit, output, viewChild } from '@angular/core';
import { IconConfig } from '@dcx/ui/libs';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import '@angular/localize/init';

import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconButtonConfig } from '../icon-button/models/icon-button.model';
import { IconComponent } from '../icon/icon.component';

import { Toast } from './models/toast.model';

@Component({
  selector: 'toast',
  templateUrl: './toast.component.html',
  styleUrl: './styles/toast.styles.scss',
  host: {
    class: 'ds-toast',
  },
  imports: [TranslateModule, IconComponent, IconButtonComponent, NgbToast],
  standalone: true,
})
export class ToastComponent implements OnInit {
  public toast = viewChild<NgbToast>('ngToast');
  public toastRef = viewChild<ElementRef>('ngToast');

  public config = model<Toast>({} as Toast);
  public hidden = output<void>();

  public iconConfig!: IconConfig;
  public closeIconButtonConfig!: Partial<IconButtonConfig>;

  private readonly translate = inject(TranslateService);

  private readonly iconI18nKeyByStatus: Record<Toast['status'], string> = {
    success: 'Common.A11y.Status_Icon.Success',
    error: 'Common.A11y.Status_Icon.Error',
    info: 'Common.A11y.Status_Icon.Info',
    warning: 'Common.A11y.Status_Icon.Warning',
  };

  public ngOnInit(): void {
    this.setConfig();
  }

  public onHidden(): void {
    this.hidden.emit();
  }

  public onClose(): void {
    this.toast()?.hide();
  }

  public open(): void {
    this.toast()?.show();
  }

  public close(): void {
    this.toast()?.hide();
  }

  private setConfig(config?: Toast): void {
    if (config) this.config.set(config);

    const status = this.config().status;

    this.iconConfig = {
      name: this.resolveIconName(status),
      ariaAttributes: {
        ariaLabel: this.translate.instant(this.iconI18nKeyByStatus[status]),
      },
    };
    this.closeIconButtonConfig = {
      ariaAttributes: {
        ariaLabel: this.translate.instant('Common.Close'),
      },
      icon: {
        name: 'cross',
      },
    };
  }

  private resolveIconName(status: Toast['status']): string {
    switch (status) {
      case 'success':
        return 'check-circle-filled';
      case 'error':
        return 'cross-circle-filled';
      case 'info':
        return 'info-circle-filled';
      case 'warning':
        return 'error-circle-filled';
      default:
        return 'info-circle-filled';
    }
  }
}
