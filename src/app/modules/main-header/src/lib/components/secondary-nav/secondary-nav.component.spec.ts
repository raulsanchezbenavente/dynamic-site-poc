import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SecondaryNavComponent } from './secondary-nav.component';
import { SecondaryNav } from './models/secondary-nav.model';
import { SecondaryNavComponents } from './enums/secondary-nav-components.enum';
import { DATA_INITIAL_VALUE } from '../../stories/data/data-inital-value.fake';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';
import { BUSINESS_CONFIG } from '@dcx/ui/libs';

describe('SecondaryNavComponent', () => {
  let component: SecondaryNavComponent;
  let fixture: ComponentFixture<SecondaryNavComponent>;

  const mockSecondaryNavOptions: SecondaryNav = {
    availableComponents: [
      SecondaryNavComponents.LANGUAGE_SELECTOR,
      SecondaryNavComponents.POINT_OF_SALE_SELECTOR
    ],
    config: {
      languageSelectorListConfig: DATA_INITIAL_VALUE.languageSelectorListConfig,
      culture: 'en-US',
    }
  };

  const BUSINESS_CONFIG_MOCK = {
    culture: 'en-US',
    pointsOfSale: [],
  };

  beforeEach(fakeAsync(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SecondaryNavComponent,
        ...i18nTestingImportsWithMemoryLoader({ }),
      ],
      providers: [
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(SecondaryNavComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('secondaryNavOptions', mockSecondaryNavOptions);
    fixture.componentRef.setInput('isResponsive', false);

    fixture.detectChanges();
    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have secondaryNavOptions input assigned', () => {
    expect(component.secondaryNavOptions).toBe(mockSecondaryNavOptions);
  });

  it('should have isResponsive input assigned', () => {
    expect(component.isResponsive).toBeFalse();
    fixture.componentRef.setInput('isResponsive', true);
    fixture.detectChanges();
    expect(component.isResponsive).toBeTrue();
  });

  it('should expose SecondaryNavComponents enum', () => {
    expect(component.secondaryNavComponents).toBe(SecondaryNavComponents);
  });
});
