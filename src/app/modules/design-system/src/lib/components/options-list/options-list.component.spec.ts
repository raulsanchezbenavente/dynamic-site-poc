import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OptionsListComponent } from './options-list.component';
import {
  DictionaryType,
  ExternalLinkPipe,
  GenerateIdPipe,
  LinkTarget,
  OptionsList,
  OptionsListConfig,
} from '@dcx/ui/libs';
import { By } from '@angular/platform-browser';
import { Directive, Input } from '@angular/core';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';

@Directive({
  selector: 'a[accessibleLink]',
  standalone: true,
})
class MockAccessibleLinkDirective {
  @Input() link: any;
  @Input() translations: any;
  @Input() skipRel: boolean = false;
  @Input() showIcon: boolean = true;
}

describe('OptionsListComponent', () => {
  let fixture: ComponentFixture<OptionsListComponent>;
  let component: OptionsListComponent;

  // Centralized mocks
  let generateIdPipeMock: jasmine.SpyObj<GenerateIdPipe>;

  // Base mock data
  const translationsMock: DictionaryType = {
    select: 'Select',
    menu: 'Menu',
  } as unknown as DictionaryType;

  const optionsMock: OptionsList[] = [
    { code: 'A', name: 'Option A', isSelected: false, isDisabled: false } as OptionsList,
    { code: 'B', name: 'Option B', isSelected: true, isDisabled: false } as OptionsList,
    { code: 'C', name: 'Option C', isSelected: false, isDisabled: true } as OptionsList,
  ];

  const baseConfig: OptionsListConfig = {
    options: structuredClone(optionsMock),
    // mode not set → should default to 'selection'
  } as unknown as OptionsListConfig;

  beforeAll(() => {
    generateIdPipeMock = jasmine.createSpyObj('GenerateIdPipe', ['transform']);
    generateIdPipeMock.transform.and.returnValue('generated_id');
  });

  beforeEach(fakeAsync(() => {
    // Reset spies
    generateIdPipeMock.transform.calls.reset();

    // Configure TestBed
    TestBed.configureTestingModule({
      imports: [
        OptionsListComponent,
        MockAccessibleLinkDirective,
        ...i18nTestingImportsWithMemoryLoader({})
      ],
      providers: [
        ExternalLinkPipe,
        { provide: GenerateIdPipe, useValue: generateIdPipeMock }
      ],
    });

    fixture = TestBed.createComponent(OptionsListComponent);
    component = fixture.componentInstance;

    // Set required inputs by default
    fixture.componentRef.setInput('config', structuredClone(baseConfig));
    fixture.componentRef.setInput('translations', translationsMock);

    fixture.detectChanges();
    tick();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.linkTarget).toBe(LinkTarget);
  });

  it('should throw when required inputs are missing (Angular required input error)', fakeAsync(() => {
    const fx = TestBed.createComponent(OptionsListComponent);
    try {
      fx.detectChanges();
      tick();
      fail('Expected Angular required-input error, but nothing was thrown');
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      expect(msg).toContain('NG0950');
    }
  }));

  it('should default to mode "selection" and roles listbox/option when mode is not provided', () => {
    expect(component.mode).toBe('selection');
    expect(component.listRole).toBe('listbox');
    expect(component.itemRole).toBe('option');
  });

  it('should compute roles menu/menuitem when mode is "menu"', () => {
    const configWithMenu: OptionsListConfig = {
      ...structuredClone(baseConfig),
      mode: 'menu',
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', configWithMenu);
    fixture.detectChanges();

    expect(component.mode).toBe('menu');
    expect(component.listRole).toBe('menu');
    expect(component.itemRole).toBe('menuitem');
  });

  it('should set aria-current="page" when mode is "menu"', () => {
    const configWithMenu: OptionsListConfig = {
      ...structuredClone(baseConfig),
      mode: 'menu',
      accessibilityConfig: { id: 'test-id' },
      options: [
        // mark as selected so template sets aria-current="page"
        { code: 'X', name: 'Opt X', isSelected: true, isDisabled: false, link: { url: '/x', target: LinkTarget.BLANK } } as OptionsList
      ]
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', configWithMenu);
    fixture.detectChanges();

    const anchorEl = fixture.debugElement.query(By.css('a.ds-options-list_item_option')).nativeElement;
    expect(anchorEl.getAttribute('aria-current')).toBe('page');
  });

  it('should not set aria-current when mode is "selection"', () => {
    const configWithSelection: OptionsListConfig = {
      ...structuredClone(baseConfig),
      mode: 'selection',
      accessibilityConfig: { id: 'test-id' },
      options: [
        { code: 'Y', name: 'Opt Y', isSelected: false, isDisabled: false, link: { url: '/y', target: LinkTarget.BLANK } } as OptionsList
      ]
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', configWithSelection);
    fixture.detectChanges();

    const anchorEl = fixture.debugElement.query(By.css('a.ds-options-list_item_option')).nativeElement;
    expect(anchorEl.hasAttribute('aria-current')).toBeFalse();
  });

  it('should set listId from accessibilityConfig.id and emit idEmitter on init', fakeAsync(() => {
    // reset pipe spy to avoid calls from default fixture created in beforeEach
    generateIdPipeMock.transform.calls.reset();

    const configWithId: OptionsListConfig = {
      ...structuredClone(baseConfig),
      accessibilityConfig: { id: 'list-id-123' },
    } as unknown as OptionsListConfig;

    // create isolated fixture to ensure no previous initialization interferes
    const fx = TestBed.createComponent(OptionsListComponent);
    const comp = fx.componentInstance;
    const emitSpy = spyOn(comp.idEmitter, 'emit');

    fx.componentRef.setInput('config', configWithId);
    fx.componentRef.setInput('translations', translationsMock);

    fx.detectChanges();
    tick();

    expect(comp.listId).toBe('list-id-123');
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('list-id-123');
    expect(generateIdPipeMock.transform).not.toHaveBeenCalled();
  }));

  it('should generate listId via GenerateIdPipe and not emit id when no accessibility id provided', () => {
    const emitSpy = spyOn(component.idEmitter, 'emit');

    fixture.componentRef.setInput('config', structuredClone(baseConfig));
    fixture.detectChanges();

    expect(generateIdPipeMock.transform).toHaveBeenCalledTimes(1);
    expect(generateIdPipeMock.transform).toHaveBeenCalledWith('optionListId_');
    expect(component.listId).toBe('generated_id');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should select clicked enabled option, unselect others and emit valueEmitter', () => {
    const valueEmitSpy = spyOn(component.valueEmitter, 'emit');

    fixture.componentRef.setInput(
      'config',
      {
        ...structuredClone(baseConfig),
        options: structuredClone(optionsMock),
      } as unknown as OptionsListConfig
    );
    fixture.detectChanges();

    const cfg = component.config()!;
    expect(cfg.options[1].isSelected).toBeTrue();

    component.optionClicked(cfg.options[0]);

    expect(cfg.options[0].isSelected).toBeTrue();
    expect(cfg.options[1].isSelected).toBeFalse();
    expect(cfg.options[2].isSelected).toBeFalse();
    expect(valueEmitSpy).toHaveBeenCalledTimes(1);
    expect(valueEmitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ code: 'A' }));
  });

  it('should not change selection nor emit when clicking a disabled option', () => {
    const valueEmitSpy = spyOn(component.valueEmitter, 'emit');

    const cfgWithDisabledClick: OptionsListConfig = {
      ...structuredClone(baseConfig),
      options: structuredClone(optionsMock),
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', cfgWithDisabledClick);
    fixture.detectChanges();

    const cfg = component.config()!;
    component.optionClicked(cfg.options[2]);

    expect(cfg.options[1].isSelected).toBeTrue();
    expect(cfg.options[0].isSelected).toBeFalse();
    expect(cfg.options[2].isSelected).toBeFalse();
    expect(valueEmitSpy).not.toHaveBeenCalled();
  });

  it('should set isSelected according to checkbox and emit on multiselectOptionClicked (enabled)', () => {
    const valueEmitSpy = spyOn(component.valueEmitter, 'emit');

    const cfgMulti: OptionsListConfig = {
      ...structuredClone(baseConfig),
      options: structuredClone(optionsMock),
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', cfgMulti);
    fixture.detectChanges();

    const cfg = component.config()!;
    const target = cfg.options[0];

    component.multiselectOptionClicked(true, target);

    expect(target.isSelected).toBeTrue();
    expect(valueEmitSpy).toHaveBeenCalledTimes(1);
    expect(valueEmitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ code: 'A' }));

    component.multiselectOptionClicked(false, target);

    expect(target.isSelected).toBeFalse();
    expect(valueEmitSpy).toHaveBeenCalledTimes(2);
  });

  it('should ignore multiselectOptionClicked when option is disabled', () => {
    const valueEmitSpy = spyOn(component.valueEmitter, 'emit');

    const cfgMulti: OptionsListConfig = {
      ...structuredClone(baseConfig),
      options: structuredClone(optionsMock),
    } as unknown as OptionsListConfig;

    fixture.componentRef.setInput('config', cfgMulti);
    fixture.detectChanges();

    const cfg = component.config()!;
    const disabledOpt = cfg.options[2];

    component.multiselectOptionClicked(true, disabledOpt);

    expect(disabledOpt.isSelected).toBeFalse();
    expect(valueEmitSpy).not.toHaveBeenCalled();
  });
});
