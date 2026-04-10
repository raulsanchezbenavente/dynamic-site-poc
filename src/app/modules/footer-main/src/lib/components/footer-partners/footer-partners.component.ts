import { Component, Input } from '@angular/core';

import { FooterPartner } from './models/footer-partner.model';
import { AccessibleLinkDirective } from '@dcx/ui/libs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'footer-partners',
  templateUrl: './footer-partners.component.html',
  styleUrls: ['./styles/footer-partners.styles.scss'],
  host: { class: 'footer-partners' },
  imports: [AccessibleLinkDirective, TranslatePipe],
  standalone: true,
})
export class FooterPartnersComponent {
  @Input({ required: true }) public config!: FooterPartner[];
}
