import { Component } from '@angular/core';

@Component({
  selector: 'pb-banner',
  standalone: true,
  template: `
    <div class="banner-container text-white text-center d-flex flex-column justify-content-center align-items-center">
      <div class="bg-overlay p-5 rounded shadow">
        <h1 class="display-4 fw-bold">Discover the world with us</h1>
        <p class="lead">Book your flight at the best price, anytime</p>
        <a
          class="btn btn-light btn-lg mt-3"
          target="_blank"
          href="https://www.shopify.com/blog/payment-options"
          >Explore payment options</a
        >
      </div>
    </div>
  `,
  styles: [
    `
      .banner-container {
        background-image: url('https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80');
        background-size: cover;
        background-position: center;
        height: 300px;
        position: relative;
      }
      .bg-overlay {
        background-color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class BannerComponent {}
