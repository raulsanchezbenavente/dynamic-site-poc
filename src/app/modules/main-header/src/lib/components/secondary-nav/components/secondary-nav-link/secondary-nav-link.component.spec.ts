import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SecondaryNavLinkConfig } from '../../models/secondary-nav-link.config';
import { SecondaryNavLinkComponent } from './secondary-nav-link.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('SecondaryNavLinkComponent', () => {
  let component: SecondaryNavLinkComponent;
  let fixture: ComponentFixture<SecondaryNavLinkComponent>;

  const mockConfig: SecondaryNavLinkConfig = {
    link: { url: '/test' },
    icon: { name: 'external' },
  };

  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(fakeAsync(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'stream']);
    mockTranslateService.stream.and.callFake((k: string | string[]) => of(k));
    mockTranslateService.instant.and.callFake((k: string) => k);

    TestBed.configureTestingModule({
      imports: [SecondaryNavLinkComponent],
      providers: [{ provide: TranslateService, useValue: mockTranslateService }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(SecondaryNavLinkComponent);
    component = fixture.componentInstance;

    // Set required inputs before first change detection
    fixture.componentRef.setInput('config', mockConfig);

    fixture.detectChanges();
    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input assigned', () => {
    expect(component.config).toBe(mockConfig);
  });
});
