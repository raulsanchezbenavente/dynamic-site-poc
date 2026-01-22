import { Component } from '@angular/core';

@Component({
  selector: 'pb-header',
  standalone: true,
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <a class="navbar-brand fw-bold" href="/">AirBooking</a>
        <a class="text-white text-decoration-none d-flex align-items-center gap-2" href="/login">
          <span class="fs-5">Login</span>
          <i class="bi bi-person-circle fs-4"></i>
        </a>
      </div>
    </nav>
  `
})
export class HeaderComponent {}
