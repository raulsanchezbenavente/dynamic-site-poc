import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransportOperatedByComponent } from './transport-operated-by.component';
import { TransportOperatedBy } from './models/transport-operated-by.model';

describe('TransportOperatedByComponent', () => {
  let component: TransportOperatedByComponent;
  let fixture: ComponentFixture<TransportOperatedByComponent>;
  let componentRef: ComponentRef<TransportOperatedByComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportOperatedByComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TransportOperatedByComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    translateService = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('data input', () => {
    it('should accept single carrier', () => {
      const carrier: TransportOperatedBy[] = [{ name: 'lufthansa' }];
      componentRef.setInput('data', carrier);
      fixture.detectChanges();

      expect(component.data()).toEqual(carrier);
    });

    it('should accept multiple carriers', () => {
      const carriers: TransportOperatedBy[] = [
        { name: 'lufthansa' },
        { name: 'american airlines' },
      ];
      componentRef.setInput('data', carriers);
      fixture.detectChanges();

      expect(component.data()).toEqual(carriers);
    });

    it('should accept empty array', () => {
      componentRef.setInput('data', []);
      fixture.detectChanges();

      expect(component.data()).toEqual([]);
    });

    it('should update when data changes', () => {
      const initialData: TransportOperatedBy[] = [{ name: 'initial' }];
      componentRef.setInput('data', initialData);
      fixture.detectChanges();

      const newData: TransportOperatedBy[] = [{ name: 'updated' }];
      componentRef.setInput('data', newData);
      fixture.detectChanges();

      expect(component.data()).toEqual(newData);
    });
  });

  describe('operatedByText', () => {
    it('should format text with single carrier', () => {
      componentRef.setInput('data', [{ name: 'lufthansa' }]);
      spyOn(translateService, 'instant').and.returnValue('Operated by');
      
      fixture.detectChanges();
      const result = component.operatedByText();

      expect(translateService.instant).toHaveBeenCalledWith('Common.Carriers.OperatedBy');
      expect(result).toBe('Operated by lufthansa');
    });

    it('should format text with multiple carriers using Intl.ListFormat', () => {
      const carriers: TransportOperatedBy[] = [
        { name: 'lufthansa' },
        { name: 'american airlines' },
      ];
      componentRef.setInput('data', carriers);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      const result = component.operatedByText();

      expect(translateService.instant).toHaveBeenCalledWith('Common.Carriers.OperatedBy');
      expect(result).toContain('lufthansa');
      expect(result).toContain('american airlines');
      expect(result).toMatch(/^Operated by lufthansa (and|y|et|und|e) american airlines$/);
    });

    it('should handle empty array', () => {
      componentRef.setInput('data', []);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      const result = component.operatedByText();

      expect(result).toBe('Operated by ');
    });

    it('should use correct translation key', () => {
      componentRef.setInput('data', [{ name: 'test' }]);
      const spy = spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      component.operatedByText();

      expect(spy).toHaveBeenCalledWith('Common.Carriers.OperatedBy');
    });

    it('should format text with three carriers using commas and locale-aware conjunction', () => {
      const carriers: TransportOperatedBy[] = [
        { name: 'Lufthansa' },
        { name: 'American Airlines' },
        { name: 'British Airways' },
      ];
      componentRef.setInput('data', carriers);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      const result = component.operatedByText();

      expect(translateService.instant).toHaveBeenCalledWith('Common.Carriers.OperatedBy');
      expect(result).toContain('Lufthansa');
      expect(result).toContain('American Airlines');
      expect(result).toContain('British Airways');
      expect(result).toMatch(/^Operated by Lufthansa, American Airlines,? (and|y|et|und|e) British Airways$/);
    });

    it('should format text with four carriers using commas and locale-aware conjunction', () => {
      const carriers: TransportOperatedBy[] = [
        { name: 'Lufthansa' },
        { name: 'American Airlines' },
        { name: 'British Airways' },
        { name: 'Air France' },
      ];
      componentRef.setInput('data', carriers);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      const result = component.operatedByText();

      expect(result).toContain('Lufthansa');
      expect(result).toContain('American Airlines');
      expect(result).toContain('British Airways');
      expect(result).toContain('Air France');
      expect(result).toMatch(/^Operated by Lufthansa, American Airlines, British Airways,? (and|y|et|und|e) Air France$/);
    });
  });

  describe('template rendering', () => {
    it('should render formatted text', () => {
      const carriers: TransportOperatedBy[] = [{ name: 'lufthansa' }];
      componentRef.setInput('data', carriers);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();

      const text = fixture.nativeElement.textContent.trim();
      expect(text).toBe('Operated by lufthansa');
    });

    it('should update template when data changes', () => {
      componentRef.setInput('data', [{ name: 'initial' }]);
      spyOn(translateService, 'instant').and.returnValue('Operated by');

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toContain('initial');

      componentRef.setInput('data', [{ name: 'updated' }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toContain('updated');
    });
  });
});
