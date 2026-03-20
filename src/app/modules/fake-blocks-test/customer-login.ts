import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KeycloakAuthService } from '@navigation';

@Component({
  selector: 'pb-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="container my-5"
      style="max-width: 400px;">
      <div class="p-4 bg-light border rounded shadow">
        <h2 class="mb-4 text-center text-primary">Customer Login</h2>

        <form
          (ngSubmit)="login()"
          #loginForm="ngForm">
          <div class="mb-3">
            <label
              for="email"
              class="form-label"
              >Email address</label
            >
            <input
              type="email"
              class="form-control"
              id="email"
              name="email"
              required
              [(ngModel)]="email" />
          </div>
          <div class="mb-3">
            <label
              for="password"
              class="form-label"
              >Password</label
            >
            <input
              type="password"
              class="form-control"
              id="password"
              name="password"
              required
              [(ngModel)]="password" />
          </div>
          <div class="d-grid">
            <button
              class="btn btn-primary"
              type="submit"
              [disabled]="!loginForm.valid || isSubmitting">
              Log In
            </button>
          </div>
        </form>

        <p class="mt-3 text-center text-muted">Don't have an account? <a href="#">Sign up</a></p>
      </div>
    </div>
  `,
})
export class CustomerLoginComponent {
  private readonly auth = inject(KeycloakAuthService);

  public email = '';
  public password = '';
  public isSubmitting = false;

  public async login(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    try {
      await this.auth.login();
    } finally {
      this.isSubmitting = false;
    }
  }
}
