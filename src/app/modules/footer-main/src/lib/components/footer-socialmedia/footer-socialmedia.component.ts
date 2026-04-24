import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SocialMedia } from './models/socialmedia.model';

@Component({
  selector: 'footer-social-media',
  templateUrl: './footer-socialmedia.component.html',
  styleUrls: ['./styles/footer-socialmedia.styles.scss'],
  host: { class: 'footer-social-media' },
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterSocialMediaComponent {
  public socialLinks = input.required<SocialMedia>();
}
