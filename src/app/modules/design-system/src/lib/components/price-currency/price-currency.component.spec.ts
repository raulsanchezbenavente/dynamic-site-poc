import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BUSINESS_CONFIG, BusinessConfig, CultureServiceEx } from '@dcx/ui/libs';

import { PriceCurrencyComponent } from './price-currency.component';

describe('PriceCurrencyComponent', () => {
  let component: PriceCurrencyComponent;
  let fixture: ComponentFixture<PriceCurrencyComponent>;
  let cultureServiceExStub: jasmine.SpyObj<CultureServiceEx>;

  const mockBusinessConfig: BusinessConfig = {
    priceWithoutDecimals: false,
    roundingCurrencyFactors: [
      { code: 'USD', factor: '0.01' },
      { code: 'EUR', factor: '0.01' },
    ],
  } as BusinessConfig;

  beforeEach(async () => {
    cultureServiceExStub = jasmine.createSpyObj<CultureServiceEx>('CultureServiceEx', ['getCulture']);
    cultureServiceExStub.getCulture.and.returnValue('en-US');

    await TestBed.configureTestingModule({
      imports: [PriceCurrencyComponent],
      providers: [
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        { provide: CultureServiceEx, useValue: cultureServiceExStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceCurrencyComponent);
    component = fixture.componentInstance;
    component.currency = 'USD';
    component.price = 1234.56;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get culture from CultureServiceEx', () => {
    expect(component.culture).toBe('en-US');
    expect(cultureServiceExStub.getCulture).toHaveBeenCalled();
  });

  it('should set price as absolute value', () => {
    component.price = -100;
    expect(component.price).toBe(100);
  });

  it('should initialize showDecimals based on business config', () => {
    component.ngOnInit();
    expect(component.showDecimals).toBe(true);
  });

  it('should set showDecimals to false when priceWithoutDecimals is true', async () => {
    const configWithoutDecimals = { ...mockBusinessConfig, priceWithoutDecimals: true };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PriceCurrencyComponent],
      providers: [
        { provide: BUSINESS_CONFIG, useValue: configWithoutDecimals },
        { provide: CultureServiceEx, useValue: cultureServiceExStub },
      ],
    }).compileComponents();
    const testFixture = TestBed.createComponent(PriceCurrencyComponent);
    const comp = testFixture.componentInstance;
    comp.currency = 'USD';
    comp.ngOnInit();
    expect(comp.showDecimals).toBe(false);
  });

  it('should set decimal digits to 0 when showDecimals is false', async () => {
    const configWithoutDecimals = { ...mockBusinessConfig, priceWithoutDecimals: true };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PriceCurrencyComponent],
      providers: [
        { provide: BUSINESS_CONFIG, useValue: configWithoutDecimals },
        { provide: CultureServiceEx, useValue: cultureServiceExStub },
      ],
    }).compileComponents();
    const testFixture = TestBed.createComponent(PriceCurrencyComponent);
    component = testFixture.componentInstance;
    component.currency = 'USD';
    component.ngOnInit();
    expect(component.decimalDigits).toBe(0);
  });

  it('should use provided decimalDigits when specified', () => {
    component.decimalDigits = 3;
    component.ngOnInit();
    expect(component.decimalDigits).toBe(3);
  });

  it('should set format to CompleteNumber when priceWithoutDecimals is true and format is not provided', async () => {
    const configWithoutDecimals = { ...mockBusinessConfig, priceWithoutDecimals: true };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PriceCurrencyComponent],
      providers: [
        { provide: BUSINESS_CONFIG, useValue: configWithoutDecimals },
        { provide: CultureServiceEx, useValue: cultureServiceExStub },
      ],
    }).compileComponents();
    const testFixture = TestBed.createComponent(PriceCurrencyComponent);
    const comp = testFixture.componentInstance;
    comp.currency = 'USD';
    comp.ngOnInit();
    expect(comp.format).toBeDefined();
    expect(comp.format).toBe('CompleteNumber');
  });
});
