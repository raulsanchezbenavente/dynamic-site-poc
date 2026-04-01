import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateIdPipe } from '@dcx/ui/libs';

import { DsGroupOptionsComponent } from './group-options.component';
import { GroupOptionElementData } from './components/models/group-option-element.model';

describe('DsGroupOptionsComponent', () => {
  let component: DsGroupOptionsComponent;
  let fixture: ComponentFixture<DsGroupOptionsComponent>;
  let generateIdPipeMock: jasmine.SpyObj<GenerateIdPipe>;

  const mockOptionList: GroupOptionElementData[] = [
    {
      title: 'Help Center',
      description: 'Find useful information',
      image: { src: 'test.svg', altText: 'Icon' },
      link: { url: '/help' },
    },
    {
      title: 'Check-in',
      description: 'Get your boarding pass',
      image: { src: 'checkin.svg', altText: 'Check-in icon' },
      link: { url: '/check-in' },
    },
  ];

  beforeEach(() => {
    generateIdPipeMock = jasmine.createSpyObj<GenerateIdPipe>('GenerateIdPipe', ['transform']);
    generateIdPipeMock.transform.and.callFake((prefix: string) => `${prefix}test-id`);

    TestBed.configureTestingModule({
      imports: [DsGroupOptionsComponent],
      providers: [{ provide: GenerateIdPipe, useValue: generateIdPipeMock }],
    });

    fixture = TestBed.createComponent(DsGroupOptionsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('templateStyle', 'horizontal');
    fixture.componentRef.setInput('templateGrid', '3');
    fixture.componentRef.setInput('optionList', mockOptionList);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should accept templateStyle input', () => {
      fixture.componentRef.setInput('templateStyle', 'vertical');
      fixture.detectChanges();

      expect(component.templateStyle()).toBe('vertical');
    });

    it('should accept templateGrid input', () => {
      fixture.componentRef.setInput('templateGrid', '4');
      fixture.detectChanges();

      expect(component.templateGrid()).toBe('4');
    });

    it('should accept enableHorizontalScroll input with default false', () => {
      expect(component.enableHorizontalScroll()).toBe(false);
    });

    it('should accept enableHorizontalScroll input when set to false', () => {
      fixture.componentRef.setInput('enableHorizontalScroll', false);
      fixture.detectChanges();

      expect(component.enableHorizontalScroll()).toBe(false);
    });

    it('should accept optionList input', () => {
      expect(component.optionList()).toEqual(mockOptionList);
    });
  });

  describe('computed signals', () => {
    it('should generate optionListId as computed signal', () => {
      expect(component.optionListId()).toBe('GroupOptionsList_test-id');
      expect(generateIdPipeMock.transform).toHaveBeenCalledWith('GroupOptionsList_');
    });

    it('should generate unique IDs for different instances', () => {
      generateIdPipeMock.transform.and.returnValue('unique-id-123');

      const secondFixture = TestBed.createComponent(DsGroupOptionsComponent);
      secondFixture.componentRef.setInput('templateStyle', 'horizontal');
      secondFixture.componentRef.setInput('templateGrid', '3');
      secondFixture.componentRef.setInput('optionList', mockOptionList);
      secondFixture.detectChanges();

      expect(secondFixture.componentInstance.optionListId()).toBe('unique-id-123');
    });
  });

  describe('Template rendering', () => {
    it('should render container with correct ID', () => {
      const container = fixture.nativeElement.querySelector('.group-options');

      expect(container).toBeTruthy();
      expect(container.getAttribute('id')).toBe('GroupOptionsList_test-id');
    });

    it('should apply correct style class based on templateStyle input', () => {
      fixture.componentRef.setInput('templateStyle', 'vertical');
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.group-options');

      expect(container.classList.contains('go-style--vertical')).toBe(true);
    });

    it('should render ds-group-options-list child component', () => {
      const listComponent = fixture.nativeElement.querySelector('ds-group-options-list');

      expect(listComponent).toBeTruthy();
    });

    it('should pass inputs to child component', () => {
      const listComponent = fixture.debugElement.query((el) => el.name === 'ds-group-options-list');

      expect(listComponent).toBeTruthy();
    });
  });
});

