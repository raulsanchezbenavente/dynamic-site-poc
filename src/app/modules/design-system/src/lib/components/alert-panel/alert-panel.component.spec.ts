import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AlertPanelComponent } from './alert-panel.component';
import { AlertPanelConfig } from './models/alert-panel.config';
import { AlertPanelType } from './enums/alert-panel-type.enum';

describe('AlertPanelComponent', () => {
  let fixture: ComponentFixture<AlertPanelComponent>;
  let component: AlertPanelComponent;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [AlertPanelComponent, TranslateModule.forRoot()],
    });

    fixture = TestBed.createComponent(AlertPanelComponent);
    component = fixture.componentInstance;

    // Provide required input for any test that might access signals.
    fixture.componentRef.setInput('config', {});
  }));

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should render with role="alert" for accessibility', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      title: 'Test Alert',
      alertType: AlertPanelType.WARNING,
    });
    fixture.detectChanges();
    tick();

    const alertElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertElement).toBeTruthy();
  }));

  it('should apply correct type class based on alertType', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      alertType: AlertPanelType.ERROR,
    });
    fixture.detectChanges();
    tick();

    const alertElement = fixture.nativeElement.querySelector('.alert-panel');
    expect(alertElement.classList.contains('alert-panel-type--error')).toBe(true);
  }));

  it('should render custom id when provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', { title: 'Test' });
    fixture.componentRef.setInput('id', 'custom-alert-id');
    fixture.detectChanges();
    tick();

    const alertElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertElement.getAttribute('id')).toBe('custom-alert-id');
  }));

  it('should not render id attribute when id input is not provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', { title: 'Test' });
    fixture.detectChanges();
    tick();

    const alertElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertElement.hasAttribute('id')).toBe(false);
  }));

  it('should render aria-labelledby when provided in config', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      title: 'Test',
      ariaAttributes: { ariaLabelledBy: 'external-label' },
    });
    fixture.detectChanges();
    tick();

    const alertElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertElement.getAttribute('aria-labelledby')).toBe('external-label');
  }));

  it('should render title when provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      title: 'Alert Title',
      alertType: AlertPanelType.INFO,
    });
    fixture.detectChanges();
    tick();

    const titleElement = fixture.nativeElement.querySelector('.alert-panel_title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.innerHTML).toContain('Alert Title');
  }));

  it('should render description when provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      title: 'Title',
      description: 'This is a description with <a href="#">link</a>',
      alertType: AlertPanelType.SUCCESS,
    });
    fixture.detectChanges();
    tick();

    const descElement = fixture.nativeElement.querySelector('.alert-panel_description');
    expect(descElement).toBeTruthy();
    expect(descElement.innerHTML).toContain('This is a description with <a href="#">link</a>');
  }));

  it('should not render title element when title is not provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      description: 'Only description',
      alertType: AlertPanelType.INFO,
    });
    fixture.detectChanges();
    tick();

    const titleElement = fixture.nativeElement.querySelector('.alert-panel_title');
    expect(titleElement).toBeFalsy();
  }));

  it('should not render description element when description is not provided', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      title: 'Only title',
      alertType: AlertPanelType.WARNING,
    });
    fixture.detectChanges();
    tick();

    const descElement = fixture.nativeElement.querySelector('.alert-panel_description');
    expect(descElement).toBeFalsy();
  }));

  it('should merge configs with defaults when resolvedConfig is evaluated', () => {
    const inputConfig: Partial<AlertPanelConfig> = {
      title: 'Panel custom title',
      alertType: AlertPanelType.WARNING,
    };

    fixture.componentRef.setInput('config', inputConfig);

    const resolved = component.resolvedConfig();
    expect(resolved.title).toBe('Panel custom title');
    expect(resolved.alertType).toBe(AlertPanelType.WARNING);
  });

  it('should use default alertType when not provided', () => {
    fixture.componentRef.setInput('config', {
      title: 'Test without type',
    });

    const resolved = component.resolvedConfig();
    expect(resolved.alertType).toBe(AlertPanelType.NEUTRAL);
  });

  it('should deep merge ariaAttributes from config', () => {
    const inputConfig: Partial<AlertPanelConfig> = {
      title: 'Panel error title',
      alertType: AlertPanelType.ERROR,
      ariaAttributes: { ariaLabelledBy: 'custom-label-id' },
    };

    fixture.componentRef.setInput('config', inputConfig);

    const resolved = component.resolvedConfig();
    expect(resolved.ariaAttributes?.ariaLabelledBy).toBe('custom-label-id');
    expect(resolved.title).toBe('Panel error title');
    expect(resolved.alertType).toBe(AlertPanelType.ERROR);
  });
});
