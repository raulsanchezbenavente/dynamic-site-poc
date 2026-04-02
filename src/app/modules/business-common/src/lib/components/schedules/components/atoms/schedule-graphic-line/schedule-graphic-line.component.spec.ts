import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ScheduleGraphicLineComponent } from './schedule-graphic-line.component';

describe('ScheduleGraphicLineComponent', () => {
  let component: ScheduleGraphicLineComponent;
  let fixture: ComponentFixture<ScheduleGraphicLineComponent>;
  let componentRef: ComponentRef<ScheduleGraphicLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleGraphicLineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleGraphicLineComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasConnection input', () => {
    it('should have default value of false', () => {
      expect(component.hasConnection()).toBe(false);
    });

    it('should update when input changes', () => {
      componentRef.setInput('hasConnection', true);
      fixture.detectChanges();

      expect(component.hasConnection()).toBe(true);

      componentRef.setInput('hasConnection', false);
      fixture.detectChanges();

      expect(component.hasConnection()).toBe(false);
    });
  });

  describe('Template rendering', () => {
    it('should render main container with aria-hidden', () => {
      const graphicElement = fixture.nativeElement.querySelector('.schedule-graphic');

      expect(graphicElement).toBeTruthy();
      expect(graphicElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should always render line element', () => {
      const lineElement = fixture.nativeElement.querySelector('.schedule-graphic_line');
      expect(lineElement).toBeTruthy();

      componentRef.setInput('hasConnection', true);
      fixture.detectChanges();

      const lineElementAfterChange = fixture.nativeElement.querySelector('.schedule-graphic_line');
      expect(lineElementAfterChange).toBeTruthy();
    });

    it('should render plane icon when hasConnection is false', () => {
      componentRef.setInput('hasConnection', false);
      fixture.detectChanges();

      const planeElement = fixture.nativeElement.querySelector('.schedule-graphic_plane');
      const stopElement = fixture.nativeElement.querySelector('.schedule-graphic_stop');

      expect(planeElement).toBeTruthy();
      expect(stopElement).toBeNull();
    });

    it('should render stop icon when hasConnection is true', () => {
      componentRef.setInput('hasConnection', true);
      fixture.detectChanges();

      const stopElement = fixture.nativeElement.querySelector('.schedule-graphic_stop');
      const planeElement = fixture.nativeElement.querySelector('.schedule-graphic_plane');

      expect(stopElement).toBeTruthy();
      expect(planeElement).toBeNull();
    });

    it('should switch between plane and stop icons when hasConnection changes', () => {
      componentRef.setInput('hasConnection', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.schedule-graphic_plane')).toBeTruthy();

      componentRef.setInput('hasConnection', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.schedule-graphic_plane')).toBeNull();
      expect(fixture.nativeElement.querySelector('.schedule-graphic_stop')).toBeTruthy();
    });
  });
});
