import { Component, inject } from '@angular/core';

import { PanelHeaderComponent } from '../../panel/components/panel-header/panel-header.component';
import { PanelContentDirective } from '../../panel/directives/panel-content.directive';
import { PanelDescriptionDirective } from '../../panel/directives/panel-description.directive';
import { PanelTitleDirective } from '../../panel/directives/panel-title.directive';
import { PanelComponent } from '../../panel/panel.component';
import { ToastService } from '../../toast-container/services/toast.service';
import { ToastContainerComponent } from '../../toast-container/toast-container.component';
import { ToastStatus } from '../../toast/enums/toast-status.enum';
import type { Toast } from '../../toast/models/toast.model';

@Component({
  selector: 'toast-container-story-host',
  styleUrls: ['./stories-styles.scss'],
  template: `
    <div style="display:flex; flex-direction: column; gap:48px">
      <!-- Panel slot -->
      <section>
        <h3 class="dcx-story-heading">Panel slot</h3>
        <p class="dcx-story-description">
          Uses <code>data-toast-slot="panel"</code>. Toast sticks to the top of the viewport while scrolling.
        </p>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="spawn(ToastStatus.SUCCESS, 'Changes saved successfully', 'toastTargetPanel')">
            Success
          </button>
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="spawn(ToastStatus.ERROR, 'Operation failed', 'toastTargetPanel')">
            Error
          </button>
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="clearTarget('toastTargetPanel')">
            Clear
          </button>
        </div>

        <div
          data-toast-slot="panel"
          [id]="'toastTargetPanel'"></div>

        <panel>
          <panel-header>
            <h2 panelTitle>Travel documents</h2>
            <div panelDescription>Manage your identification documents for a smoother check-in experience.</div>
          </panel-header>
          <div panelContent>
            <p>
              Here you can add or update your travel documents such as passport, national ID, or visa. Keeping your
              documents up to date helps us verify your identity and speeds up the check-in process.
            </p>
            <p>
              You can store multiple documents and select which one to use for each trip. All your information is
              encrypted and stored securely in compliance with data protection regulations.
            </p>
          </div>
        </panel>
      </section>

      <!-- Default (no slot) -->
      <section>
        <h3 class="dcx-story-heading">Default (no slot)</h3>
        <p class="dcx-story-description">
          Without <code>data-toast-slot</code>. Toast is positioned absolutely inside its container.
        </p>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="spawn(ToastStatus.INFO, 'Informational message', 'toastTargetDefault')">
            Info
          </button>
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="spawn(ToastStatus.WARNING, 'Warning message', 'toastTargetDefault')">
            Warning
          </button>
          <button
            class="stbook-btn stbook-btn-primary"
            type="button"
            (click)="clearTarget('toastTargetDefault')">
            Clear
          </button>
        </div>

        <div style="position: relative; border:1px dashed #999; padding:8px; min-height:140px;">
          <div id="toastTargetDefault"></div>
        </div>
      </section>
    </div>

    <toast-container />
  `,
  standalone: true,
  imports: [
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
    ToastContainerComponent,
  ],
})
export class ToastContainerStoryHostComponent {
  public readonly ToastStatus = ToastStatus;

  private readonly toastSvc = inject(ToastService);

  public spawn(status: ToastStatus, messageKey: string, targetId: string): void {
    const CONFIG: Toast = { status, autohide: false, delay: 8000, message: messageKey };
    this.toastSvc.show(CONFIG, targetId);
  }

  public clearTarget(targetId: string): void {
    document.getElementById(targetId)?.replaceChildren();
  }
}
