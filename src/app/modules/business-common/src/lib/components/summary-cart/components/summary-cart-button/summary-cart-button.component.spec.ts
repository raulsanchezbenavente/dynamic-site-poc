import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { SummaryCartButtonComponent } from './summary-cart-button.component';
import { SummaryCartButtonConfig } from './models/summary-cart-button.config';

describe('SummaryCartButtonComponent', () => {
  let fixture: ComponentFixture<SummaryCartButtonComponent>;
  let component: SummaryCartButtonComponent;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  const buttonConfigMock: SummaryCartButtonConfig = {
    toggleButtonConfig: { ariaAttributes: {} },
    amount: 0,
    currency: 'EUR',
  } as any;

  beforeEach(fakeAsync(() => {
    translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant'], {
      currentLang: 'es',
      onLangChange: new Subject(),
      onTranslationChange: new Subject(),
      onDefaultLangChange: new Subject(),
    });
    translateServiceMock.instant.and.returnValue('Resumen de compra');

    TestBed.configureTestingModule({
      imports: [SummaryCartButtonComponent],
      providers: [{ provide: TranslateService, useValue: translateServiceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SummaryCartButtonComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SummaryCartButtonComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should throw if required input [config] is missing (Angular input.required)', fakeAsync(() => {
    expect(() => {
      fixture.detectChanges();
      (component as any).config();
    }).toThrow();
  }));

  // ------------------
  // ngAfterViewChecked
  // ------------------

  it('ngAfterViewChecked should remove host aria-expanded via Renderer2', fakeAsync(() => {
    // Arrange
    fixture.componentRef.setInput('config', buttonConfigMock);
    fixture.componentRef.setInput('ariaExpanded', true);

    const r = (component as any).r as Renderer2;
    const el = (component as any).el as ElementRef;

    el.nativeElement.setAttribute('aria-expanded', 'true');

    const removeAttrSpy = spyOn(r, 'removeAttribute').and.callThrough();

    // Act
    component.ngAfterViewChecked();
    tick();

    // Assert
    expect(removeAttrSpy).toHaveBeenCalledWith(el.nativeElement, 'aria-expanded');
  }));

  // ------------------
  // onClickHandler -> Output
  // ------------------

  it('onClickHandler should emit buttonClicked', fakeAsync(() => {
    // Arrange
    fixture.componentRef.setInput('config', buttonConfigMock);
    const emitSpy = spyOn(component.buttonClicked, 'emit');

    // Act
    component.onClickHandler();
    tick();

    // Assert
    expect(emitSpy).toHaveBeenCalled();
  }));

  // ------------------
  // [ariaExpanded] input is accepted (forwarding se prueba en integración)
  // ------------------

  it('should accept ariaExpanded input without errors', fakeAsync(() => {
    fixture.componentRef.setInput('config', buttonConfigMock);
    fixture.componentRef.setInput('ariaExpanded', false);

    fixture.detectChanges();
    tick();

    expect(component.ariaExpanded).toBeFalse();
  }));
});
