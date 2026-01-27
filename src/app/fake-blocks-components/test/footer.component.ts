import { Component } from '@angular/core';

@Component({
  selector: 'pb-footer',
  standalone: true,
  template: `
    <footer class="bg-dark text-white py-4 mt-5">
      <div class="container text-center">
        <p class="mb-1">&copy; {{ currentYear }} AirBooking. All rights reserved.</p>
        <p class="mb-0 small">
          <a href="#" class="text-white text-decoration-underline">Terms of Service</a> |
          <a href="#" class="text-white text-decoration-underline">Privacy Policy</a> |
          <a href="#" class="text-white text-decoration-underline">Contact Us</a>
        </p>
      </div>
    </footer>
  `
})
export class FooterComponent {
  public currentYear = new Date().getFullYear();
}
