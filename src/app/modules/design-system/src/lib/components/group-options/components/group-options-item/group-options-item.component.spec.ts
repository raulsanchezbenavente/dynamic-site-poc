import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DsGroupOptionsItemComponent } from './group-options-item.component';
import { GroupOptionElementData } from '../models/group-option-element.model';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';
import { GroupOptionsEventService } from '../../services/group-options-event.service';

describe('GroupOptionsItemComponent', () => {
  let component: DsGroupOptionsItemComponent;
  let fixture: ComponentFixture<DsGroupOptionsItemComponent>;
  let groupOptionsEventService: jasmine.SpyObj<GroupOptionsEventService>;

  beforeEach(fakeAsync(() => {
    const eventServiceSpy = jasmine.createSpyObj('GroupOptionsEventService', ['publishEvent']);
    TestBed.configureTestingModule({
      imports: [DsGroupOptionsItemComponent],
      providers: [
        { provide: GroupOptionsEventService, useValue: eventServiceSpy }
      ]
    });
    TestBed.overrideTemplate(DsGroupOptionsItemComponent, '<div></div>');

    fixture = TestBed.createComponent(DsGroupOptionsItemComponent);
    component = fixture.componentInstance;
    groupOptionsEventService = TestBed.inject(GroupOptionsEventService) as jasmine.SpyObj<GroupOptionsEventService>;
  }));

  it('should create', () => {
    fixture.componentRef.setInput('data', {});
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should compute buttonConfig when data has buttonText and link', fakeAsync(() => {
    const mockData: GroupOptionElementData = {
      buttonText: 'Click Me',
      code: 'option-1',
      link: {
        url: '/test-link',
      },
    };

    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    tick();

    expect(component.buttonConfig()).toEqual({
      label: 'Click Me',
      layout: {
        style: ButtonStyles.PRIMARY,
        size: LayoutSize.SMALL,
      },
      link: {
        url: '/test-link',
      },
    });
  }));

  it('should use secondary button style when buttonStyle input is SECONDARY', fakeAsync(() => {
    const mockData: GroupOptionElementData = {
      buttonText: 'Click Me',
      link: { url: '/test-link' },
    };

    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('buttonStyle', ButtonStyles.SECONDARY);
    fixture.detectChanges();
    tick();

    expect(component.buttonConfig().layout?.style).toBe(ButtonStyles.SECONDARY);
  }));

  it('should compute default values for buttonConfig when data is empty', fakeAsync(() => {
    const mockData: GroupOptionElementData = {} as GroupOptionElementData;

    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    tick();

    expect(component.buttonConfig().label).toBe('');
    expect(component.buttonConfig().link).toBe(undefined);
    expect(component.buttonConfig().layout?.style).toBe(ButtonStyles.PRIMARY);
    expect(component.buttonConfig().layout?.size).toBe(LayoutSize.SMALL);
  }));

  describe('emitEventOnClick', () => {
    it('should call publishEvent with correct optionType when emitEventOnClick is called', fakeAsync(() => {
      const mockData: GroupOptionElementData = {
        code: 'test-option',
        buttonText: 'Test Button',
        emitsEvent: true,
      };

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();
      tick();

      component.emitEventOnClick();

      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledWith({ optionType: 'test-option' });
      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledTimes(1);
    }));

    it('should publish event with correct code for different option types', fakeAsync(() => {
      const mockData: GroupOptionElementData = {
        code: 'baggage-service',
        buttonText: 'Add Baggage',
        emitsEvent: true,
      };

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();
      tick();

      component.emitEventOnClick();

      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledWith({ optionType: 'baggage-service' });
    }));

    it('should handle emitEventOnClick when called multiple times', fakeAsync(() => {
      const mockData: GroupOptionElementData = {
        code: 'meal-service',
        buttonText: 'Add Meal',
        emitsEvent: true,
      };

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();
      tick();

      component.emitEventOnClick();
      component.emitEventOnClick();
      component.emitEventOnClick();

      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledTimes(3);
      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledWith({ optionType: 'meal-service' });
    }));

    it('should publish event even when buttonText is not provided', fakeAsync(() => {
      const mockData: GroupOptionElementData = {
        code: 'no-text-option',
        emitsEvent: true,
      };

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();
      tick();

      component.emitEventOnClick();

      expect(groupOptionsEventService.publishEvent).toHaveBeenCalledWith({ optionType: 'no-text-option' });
    }));
  });
});
