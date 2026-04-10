import { FooterPartner } from '../components/footer-partners/models/footer-partner.model';
import { SocialMedia } from '../components/footer-socialmedia/models/socialmedia.model';

import { Copyright } from './copyright.model';
import { FooterMainLogo } from './footer-main-logo.model';
import { FooterNav } from './footer-nav.model';

export interface FooterMainConfig {
  logo: FooterMainLogo;
  columns: FooterNav[];
  socialMedia: SocialMedia;
  copyright: Copyright;
  partners?: FooterPartner[];
}
