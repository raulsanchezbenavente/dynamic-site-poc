import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FooterNavComponent } from './footer-nav.component';
import { FooterNav } from '../../models/footer-nav.model';
import { LinkTarget } from '@dcx/ui/libs';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Pipe({ name: 'isExternalLink', standalone: true })
export class MockIsExternalLinkPipe implements PipeTransform {
  public transform(value: string): boolean {
    return value?.startsWith('http') || false;
  }
}

describe('FooterNavComponent', () => {
  let component: FooterNavComponent;
  let fixture: ComponentFixture<FooterNavComponent>;

  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockData: FooterNav = {
    title: 'Support',
    items: [
      { title: 'Contact us', url: '/contact' },
      {
        title: 'Hotel reservations',
        url: 'https://sp.booking.com/dealspage.html?aid=2434507&label=hotels_shortcut',
        target: LinkTarget.BLANK,
      },
    ],
  };

  beforeEach(fakeAsync(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'stream']);
    mockTranslateService.stream.and.callFake((k: string | string[]) => of(k));
    mockTranslateService.instant.and.callFake((k: string) => k);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, FooterNavComponent],
      providers: [{ provide: TranslateService, useValue: mockTranslateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterNavComponent);
    component = fixture.componentInstance;

    // Set required and optional inputs
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput('isResponsive', false);
    fixture.componentRef.setInput('selectedMenu', '');

    tick();
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose LinkTarget enum', () => {
    expect(component.linkTarget).toBe(LinkTarget);
  });

  it('should compute navMenuId correctly', () => {
    expect(component.navMenuId()).toBe('footerNavMenuId-1');
  });

  it('should compute navTitleId based on navMenuId', () => {
    expect(component.navTitleId()).toBe('footerNavTitleId_footerNavMenuId-1');
  });

  it('should not be collapsed if not responsive (regardless of selectedMenu)', fakeAsync(() => {
    fixture.componentRef.setInput('isResponsive', false);
    fixture.componentRef.setInput('selectedMenu', 'some-id');
    tick();
    fixture.detectChanges();

    expect(component.isCollapsed()).toBeFalse();
  }));

  it('should be collapsed if responsive and selectedMenu != navMenuId', fakeAsync(() => {
    fixture.componentRef.setInput('isResponsive', true);
    fixture.componentRef.setInput('selectedMenu', 'anotherMenuId');
    tick();
    fixture.detectChanges();

    expect(component.isCollapsed()).toBeTrue();
  }));

  it('should not be collapsed if responsive and selectedMenu == navMenuId', fakeAsync(() => {
    fixture.componentRef.setInput('isResponsive', true);
    fixture.componentRef.setInput('selectedMenu', 'footerNavMenuId-1');
    tick();
    fixture.detectChanges();

    expect(component.isCollapsed()).toBeFalse();
  }));

  it('should emit navMenuId on collapseNav when responsive', fakeAsync(() => {
    fixture.componentRef.setInput('isResponsive', true);
    tick();
    fixture.detectChanges();

    spyOn(component.menuToggleEmitter, 'emit');

    component.collapseNav();

    expect(component.menuToggleEmitter.emit).toHaveBeenCalledWith('footerNavMenuId-1');
  }));

  it('should not emit on collapseNav when not responsive', () => {
    spyOn(component.menuToggleEmitter, 'emit');

    component.collapseNav();

    expect(component.menuToggleEmitter.emit).not.toHaveBeenCalled();
  });

  it('should recompute ids when index changes', fakeAsync(() => {
    fixture.componentRef.setInput('index', 3);
    tick();
    fixture.detectChanges();

    expect(component.navMenuId()).toBe('footerNavMenuId-3');
    expect(component.navTitleId()).toBe('footerNavTitleId_footerNavMenuId-3');
  }));
});

describe('FooterNavComponent (required inputs validation)', () => {
  it('should throw NG01314 when required inputs are missing', () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, FooterNavComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FooterNavComponent);
    // Intentionally do not set required inputs: data, index
    expect(() => fixture.detectChanges()).toThrowError(/(NG0950|NG01314)/i);
  });
});
