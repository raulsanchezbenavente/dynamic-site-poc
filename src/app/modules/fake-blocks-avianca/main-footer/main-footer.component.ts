import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

@Component({
  selector: 'main-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-footer.component.html',
  styleUrl: './main-footer.component.scss',
})
export class MainFooterComponent {
  public followTitle = input<string>('FOOTER.FOLLOW_US');

  public columns = input<FooterColumn[]>([
    {
      title: 'FOOTER.DISCOVER_BUY',
      links: [
        { label: 'FOOTER.CHEAP_FLIGHTS' },
        { label: 'FOOTER.HOTEL_BOOKINGS', external: true },
        { label: 'FOOTER.CAR_RENTAL', external: true },
      ],
    },
    {
      title: 'FOOTER.ABOUT_US',
      links: [
        { label: 'FOOTER.WE_ARE_AVIANCA' },
        { label: 'FOOTER.CAREERS', external: true },
        { label: 'FOOTER.CORP_NEWS' },
      ],
    },
    {
      title: 'FOOTER.PORTALS',
      links: [
        { label: 'FOOTER.LIFEMILES_PROGRAM', external: true },
        { label: 'FOOTER.AVIANCA_BUSINESS', external: true },
        { label: 'FOOTER.AVIANCA_DIRECT' },
      ],
    },
    {
      title: 'FOOTER.QUICK_LINKS',
      links: [
        { label: 'FOOTER.LEGAL_INFO' },
        { label: 'FOOTER.PRIVACY_POLICY' },
        { label: 'FOOTER.CARRIAGE_CONTRACT' },
      ],
    },
  ]);

  public trackByTitle(_: number, col: FooterColumn): string {
    return col.title;
  }

  public trackByLink(_: number, link: FooterLink): string {
    return link.label;
  }
}
