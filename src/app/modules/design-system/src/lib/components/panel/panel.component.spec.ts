import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PanelComponent } from './panel.component';
import { PANEL_CONFIG } from './tokens/panel-default-config.token';
import {
  GenerateIdPipe,
  MergeConfigsService,
  HorizontalAlign,
  SectionColors,
} from '@dcx/ui/libs';
import { PanelBaseConfig } from './models/panel-base.config';
import { PanelHeaderComponent } from './components/panel-header/panel-header.component';
import { PanelTitleDirective } from './directives/panel-title.directive';
import { PanelContentDirective } from './directives/panel-content.directive';
import { PanelDescriptionDirective } from './directives/panel-description.directive';
import { PanelFooterDirective } from './directives/panel-footer.directive';
import { PanelHeaderAsideDirective } from './directives/panel-header-aside.directive';
import { PanelIconDirective } from './directives/panel-icon.directive';
import { PanelAppearance } from './enums/panel-appearance.enum';

@Component({
  standalone: true,
  imports: [
    PanelComponent,
    PanelHeaderComponent,
    PanelTitleDirective,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelFooterDirective,
    PanelHeaderAsideDirective,
    PanelIconDirective,
  ],
  template: `
    <panel>
      <panel-header>
        <span panelIcon>icon</span>
        <h2 panelTitle>My Panel Title</h2>
        <span panelHeaderAside>aside</span>
      </panel-header>
      <div panelContent>Panel content</div>
      <div panelDescription>Panel description</div>
      <div panelFooter>Panel footer</div>
    </panel>
  `,
})
class PanelHostComponent {}

describe('PanelComponent', () => {
  let fixture: ComponentFixture<PanelHostComponent>;
  let generateIdPipeMock: jasmine.SpyObj<GenerateIdPipe>;
  let mergeConfigsServiceMock: jasmine.SpyObj<MergeConfigsService>;
  let injectedRendererSpy: jasmine.SpyObj<Renderer2>;

  const injectedDefaultConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
    ariaAttributes: {},
    layoutConfig: {},
    sectionsColors: undefined,
  };

  beforeEach(async () => {
    generateIdPipeMock = jasmine.createSpyObj('GenerateIdPipe', ['transform']);
    generateIdPipeMock.transform.and.returnValue('panelTitleId-generated');

    mergeConfigsServiceMock = jasmine.createSpyObj('MergeConfigsService', ['mergeConfigs']);
    mergeConfigsServiceMock.mergeConfigs.and.callFake((defCfg: any, currentCfg: any) => ({
      ...(defCfg || {}),
      ...(currentCfg || {}),
    }));

    // This spy WILL NOT be used directly by the component; we still provide it for consistency,
    // but we will spy on the instance renderer after component creation.
    injectedRendererSpy = jasmine.createSpyObj<Renderer2>('Renderer2', [
      'addClass',
      'setAttribute',
      'removeClass',
      'createElement',
      'appendChild',
      'removeChild',
      'setStyle',
      'removeStyle',
      'setProperty',
      'listen',
    ]);

    await TestBed.configureTestingModule({
      imports: [PanelHostComponent],
      providers: [
        { provide: GenerateIdPipe, useValue: generateIdPipeMock },
        { provide: MergeConfigsService, useValue: mergeConfigsServiceMock },
        { provide: PANEL_CONFIG, useValue: injectedDefaultConfig },
        { provide: Renderer2, useValue: injectedRendererSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelHostComponent);
    fixture.detectChanges(); // runs ngOnInit + first ngAfterContentInit
  });

  function getPanel(): PanelComponent {
    return fixture.debugElement.query(By.directive(PanelComponent)).componentInstance as PanelComponent;
  }

  it('should create', () => {
    expect(getPanel()).toBeTruthy();
  });

  it('should merge default config on init', () => {
    const panel = getPanel();
    expect(mergeConfigsServiceMock.mergeConfigs).toHaveBeenCalled();
    expect(panel.config().appearance).toBe(PanelAppearance.SHADOW);
  });

  it('should auto-generate aria-labelledby when a panelTitle is projected and none provided', () => {
    const panel = getPanel();

    // Spy on actual renderer instance used by the panel (not injected mock)
    const realRenderer = (panel as any).renderer as Renderer2;
    const setAttrSpy = spyOn(realRenderer, 'setAttribute').and.callThrough();

    // Reset pipe calls (first run may have generated already depending on timing)
    generateIdPipeMock.transform.calls.reset();

    // Clear id to force regeneration scenario
    const titleEl = fixture.debugElement.query(By.css('[panelTitle]')).nativeElement as HTMLElement;
    titleEl.removeAttribute('id');
    panel.config.set({ ...panel.config(), ariaAttributes: {} });

    panel.ngAfterContentInit();

    expect(generateIdPipeMock.transform).toHaveBeenCalledWith('panelTitleId');
    expect(panel.ariaLabelledBy).toBe('panelTitleId-generated');
    expect(panel.role).toBe('region');
    expect(setAttrSpy).toHaveBeenCalledWith(titleEl, 'id', 'panelTitleId-generated');
  });

  it('should not overwrite aria-labelledby if already set', () => {
    const panel = getPanel();
    const realRenderer = (panel as any).renderer as Renderer2;
    const setAttrSpy = spyOn(realRenderer, 'setAttribute').and.callThrough();
    generateIdPipeMock.transform.calls.reset();

    panel.config.set({
      ...panel.config(),
      ariaAttributes: { ariaLabelledBy: 'predefined-id' },
    });

    // Ensure title has no id (should still not generate)
    const titleEl = fixture.debugElement.query(By.css('[panelTitle]')).nativeElement as HTMLElement;
    titleEl.removeAttribute('id');

    panel.ngAfterContentInit();

    expect(panel.ariaLabelledBy).toBe('predefined-id');
    expect(generateIdPipeMock.transform).not.toHaveBeenCalled();
    expect(setAttrSpy).not.toHaveBeenCalled();
  });

  it('should respect existing id on projected panelTitle', () => {
    const panel = getPanel();
    const realRenderer = (panel as any).renderer as Renderer2;
    const setAttrSpy = spyOn(realRenderer, 'setAttribute').and.callThrough();
    generateIdPipeMock.transform.calls.reset();

    const titleEl = fixture.debugElement.query(By.css('[panelTitle]')).nativeElement as HTMLElement;
    titleEl.id = 'existing-title-id';
    panel.config.set({ ...panel.config(), ariaAttributes: {} });

    panel.ngAfterContentInit();

    expect(panel.ariaLabelledBy).toBe('existing-title-id');
    expect(generateIdPipeMock.transform).not.toHaveBeenCalled();
    expect(setAttrSpy).not.toHaveBeenCalled();
  });

  it('should add header alignment class when headerHorizontalAlign is set', () => {
    const panel = getPanel();
    const realRenderer = (panel as any).renderer as Renderer2;
    const addClassSpy = spyOn(realRenderer, 'addClass').and.callThrough();

    panel.config.set({
      ...panel.config(),
      layoutConfig: { headerHorizontalAlign: HorizontalAlign.CENTER },
    });

    panel.ngAfterContentInit();

    expect(addClassSpy).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      'ds-panel-header--align-center'
    );
  });

  it('should add content alignment class when contentHorizontalAlign is set', () => {
    const panel = getPanel();
    const realRenderer = (panel as any).renderer as Renderer2;
    const addClassSpy = spyOn(realRenderer, 'addClass').and.callThrough();

    panel.config.set({
      ...panel.config(),
      layoutConfig: { contentHorizontalAlign: HorizontalAlign.RIGHT },
    });

    panel.ngAfterContentInit();

    expect(addClassSpy).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      'ds-panel-content--align-right'
    );
  });

  it('should build hostClasses based on config', () => {
    const panel = getPanel();
    panel.config.set({
      ...panel.config(),
      appearance: PanelAppearance.SHADOW,
      sectionsColors: SectionColors.BOOKING,
    });
    const classes = panel.hostClasses;
    expect(classes).toContain('ds-panel--appearance-shadow');
    expect(classes).toContain('ds-panel-section ds-panel-section--sc-booking');
  });
});
