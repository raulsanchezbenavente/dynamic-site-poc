import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { GenerateIdPipe, KeyCodeEnum } from '@dcx/ui/libs';

import { MainMenuItem } from '../../models/main-menu-item.model';
import { PrimaryNavSubMenuComponent } from '../primary-nav-sub-menu/primary-nav-sub-menu.component';
import { PrimaryNavComponent } from './primary-nav.component';

describe('PrimaryNavComponent', () => {
  let component: PrimaryNavComponent;
  let fixture: ComponentFixture<PrimaryNavComponent>;

  // Mocks
  const generateIdPipeMock = jasmine.createSpyObj('GenerateIdPipe', ['transformWithUUID']);
  const elementRefMock = jasmine.createSpyObj('ElementRef', [], { nativeElement: {} });

  // Test data
  const mockMenuList: MainMenuItem[] = [
    { id: 'item-1', label: 'Home', link: { url: '/home' }, columns: [] },
    {
      id: 'item-2',
      label: 'About',
      columns: [{ sections: [{ link: { url: '/about/team' } }, { link: { url: '/about/company' } }] }],
    },
    { label: 'NoId', columns: [] } as any,
  ];

  // -------- helpers para QueryList
  function setMenuItemRefs(items: Array<ElementRef<HTMLElement>>) {
    const ql = new QueryList<ElementRef<HTMLElement>>();
    (ql as any).reset(items);
    (ql as any).notifyOnChanges();
    Object.defineProperty(component, 'menuItemRefs', { value: ql, writable: true });
  }

  function setSubMenus(items: Array<PrimaryNavSubMenuComponent>) {
    const ql = new QueryList<PrimaryNavSubMenuComponent>();
    (ql as any).reset(items);
    (ql as any).notifyOnChanges();
    Object.defineProperty(component, 'subMenusComponents', { value: ql, writable: true });
  }

  function elRef(): ElementRef<HTMLElement> {
    return { nativeElement: { focus: jasmine.createSpy('focus') } } as unknown as ElementRef<HTMLElement>;
  }
  // ----------------------------------

  beforeEach(fakeAsync(() => {
    generateIdPipeMock.transformWithUUID.calls.reset();

    TestBed.configureTestingModule({
      imports: [PrimaryNavComponent],
      providers: [
        { provide: GenerateIdPipe, useValue: generateIdPipeMock },
        { provide: ElementRef, useValue: elementRefMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PrimaryNavComponent);
    component = fixture.componentInstance;

    // Inputs obligatorios
    fixture.componentRef.setInput('mainMenuList', JSON.parse(JSON.stringify(mockMenuList)));

    // QueryLists vacíos por defecto
    setMenuItemRefs([]);
    setSubMenus([]);

    generateIdPipeMock.transformWithUUID.and.returnValue('generated-id');

    fixture.detectChanges();
    tick();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit / setActiveMenuItemIndex', () => {
    it('should set activeMenuItemIndex based on current path', () => {
      const originalHref = globalThis.location.href;
      history.pushState({}, '', '/about/team');

      (component as any).setActiveMenuItemIndex(mockMenuList);
      expect(component.activeMenuItemIndex).toBe(1);

      history.pushState({}, '', originalHref);
    });

    it('should set activeMenuItemIndex to -1 if no match', () => {
      const originalHref = globalThis.location.href;
      history.pushState({}, '', '/unknown');

      (component as any).setActiveMenuItemIndex(mockMenuList);
      expect(component.activeMenuItemIndex).toBe(-1);

      history.pushState({}, '', originalHref);
    });

    it('should assign generated id to menu items without id', fakeAsync(() => {
      const menuList = [{ label: 'NoId', columns: [] } as any];
      fixture.componentRef.setInput('mainMenuList', menuList);
      fixture.detectChanges();
      tick();

      (component as any).ensureMenuItemIds();

      expect(menuList[0].id).toBe('generated-id');
      expect(generateIdPipeMock.transformWithUUID).toHaveBeenCalledWith('primaryNavItemId');
    }));
  });

  describe('toggleSubMenu', () => {
    it('should open submenu and emit subMenuOpened', () => {
      const emitSpy = spyOn(component.subMenuOpened, 'emit');
      component.toggleSubMenu(1);
      expect((component as any).expandedIndexes()).toEqual({ 1: true });
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should close submenu and emit subMenuOpened', () => {
      (component as any).expandedIndexes.set({ 1: true });
      const emitSpy = spyOn(component.subMenuOpened, 'emit');
      component.toggleSubMenu(1);
      expect((component as any).expandedIndexes()).toEqual({});
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should call afterOpenFocus callback when opening', fakeAsync(() => {
      spyOn(globalThis, 'requestAnimationFrame').and.callFake(cb => { cb(0); return 1 as any; });
      let called = false;
      component.toggleSubMenu(2, () => { called = true; });
      tick();
      expect(called).toBeTrue();
    }));
  });

  describe('trackByMenuItem', () => {
    it('returns item id if present', () => {
      const item = { id: 'myId', label: 'X', columns: [] } as any;
      expect(component.trackByMenuItem(0, item)).toBe('myId');
    });

    it('returns index as string if id is missing', () => {
      const item = { label: 'Test', columns: [] } as any;
      expect(component.trackByMenuItem(2, item)).toBe('2');
    });
  });

  describe('onToggleClick', () => {
    it('calls toggleSubMenu with index', () => {
      const toggleSpy = spyOn(component, 'toggleSubMenu');
      const event = new MouseEvent('click');
      component.onToggleClick(event, 1);
      expect(toggleSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('isExpanded', () => {
    it('true if expanded', () => {
      (component as any).expandedIndexes.set({ 1: true });
      expect(component.isExpanded(1)).toBeTrue();
    });

    it('false if not expanded', () => {
      (component as any).expandedIndexes.set({});
      expect(component.isExpanded(0)).toBeFalse();
    });
  });

  describe('onCloseMenu', () => {
    it('closes submenu, emits and restores focus', () => {
      (component as any).expandedIndexes.set({ 1: true });
      const emitSpy = spyOn(component.subMenuOpened, 'emit');
      const escSpy = spyOn(component.closedByEscEmit, 'emit');
      const focusSpy = spyOn<any>(component, 'focusMenuItem');

      component.onCloseMenu(1);

      expect((component as any).expandedIndexes()).toEqual({});
      expect(emitSpy).toHaveBeenCalledWith(false);
      expect(escSpy).toHaveBeenCalledWith(true);
      expect(focusSpy).toHaveBeenCalledWith(1);
    });

    it('does not change expanded state if closed, but emits ESC and restores focus', () => {
      expect((component as any).expandedIndexes()).toEqual({});
      const emitSpy = spyOn(component.subMenuOpened, 'emit');
      const escSpy = spyOn(component.closedByEscEmit, 'emit');
      const focusSpy = spyOn<any>(component, 'focusMenuItem');

      component.onCloseMenu(0);

      expect(emitSpy).not.toHaveBeenCalled();
      expect(escSpy).toHaveBeenCalledWith(true);
      expect(focusSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('closeAllSubMenus', () => {
    it('closes all and emits false', () => {
      (component as any).expandedIndexes.set({ 0: true, 1: true });
      const emitSpy = spyOn(component.subMenuOpened, 'emit');
      component.closeAllSubMenus();
      expect((component as any).expandedIndexes()).toEqual({});
      expect(emitSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('getTabIndex', () => {
    it('returns -1 if expanded', () => {
      spyOn(component, 'isExpanded').and.returnValue(true);
      expect(component.getTabIndex(0)).toBe(-1);
    });

    it('returns 0 if focusable and not expanded', () => {
      spyOn(component, 'isExpanded').and.returnValue(false);
      spyOn(component, 'isFocusable').and.returnValue(true);
      expect(component.getTabIndex(1)).toBe(0);
    });

    it('returns -1 if not focusable and not expanded', () => {
      spyOn(component, 'isExpanded').and.returnValue(false);
      spyOn(component, 'isFocusable').and.returnValue(false);
      expect(component.getTabIndex(2)).toBe(-1);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      setMenuItemRefs([elRef(), elRef(), elRef()]);
      fixture.detectChanges();
    });

    it('ArrowRight (desktop) → next', () => {
      spyOn(component, 'isResponsive').and.returnValue(false);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_RIGHT });
      component.onKeyDown(event, 0);
      expect((component as any).focusedMenuIndex()).toBe(1);
    });

    it('ArrowLeft (desktop) → prev', () => {
      spyOn(component, 'isResponsive').and.returnValue(false);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_LEFT });
      component.onKeyDown(event, 0);
      expect((component as any).focusedMenuIndex()).toBe(2);
    });

    it('Enter abre submenu', () => {
      spyOn(component, 'isResponsive').and.returnValue(false);
      const openSpy = spyOn<any>(component, 'openSubMenuAndFocus');
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ENTER });
      component.onKeyDown(event, 1);
      expect(openSpy).toHaveBeenCalledWith(1);
    });

    it('ArrowDown (desktop) abre submenu', () => {
      spyOn(component, 'isResponsive').and.returnValue(false);
      const openSpy = spyOn<any>(component, 'openSubMenuAndFocus');
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_DOWN });
      component.onKeyDown(event, 1);
      expect(openSpy).toHaveBeenCalledWith(1);
    });

    it('ArrowRight (mobile) abre submenu', () => {
      spyOn(component, 'isResponsive').and.returnValue(true);
      const openSpy = spyOn<any>(component, 'openSubMenuAndFocus');
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_RIGHT });
      component.onKeyDown(event, 1);
      expect(openSpy).toHaveBeenCalledWith(1);
    });

    it('Escape cierra y restaura foco', () => {
      const closeSpy = spyOn(component, 'closeAllSubMenus');
      const focusSpy = spyOn<any>(component, 'focusMenuItem');
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ESCAPE });
      component.onKeyDown(event, 1);
      expect(closeSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('focusMenuItem', () => {
    it('focuses the index', () => {
      const el = elRef();
      setMenuItemRefs([el]);
      (component as any).focusMenuItem(0);
      expect(el.nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe('isFocusable', () => {
    it('true iff focusedMenuIndex === index', () => {
      (component as any).focusedMenuIndex.set(2);
      expect(component.isFocusable(2)).toBeTrue();
      expect(component.isFocusable(1)).toBeFalse();
    });
  });

  describe('focusFirstItem', () => {
    it('focuses the first menu item', () => {
      const first = elRef();
      const second = elRef();
      setMenuItemRefs([first, second]);
      component.focusFirstItem();
      expect(first.nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe('openSubMenuAndFocus', () => {
    it('opens submenu and focuses first item when not open', () => {
      spyOn(component, 'isExpanded').and.returnValue(false);

      // hacemos que toggleSubMenu ejecute el callback inmediatamente
      const toggleSpy = spyOn(component, 'toggleSubMenu').and.callFake((index: number, cb?: () => void) => {
        if (cb) { cb(); }
      });

      const subMenu = jasmine.createSpyObj('PrimaryNavSubMenuComponent', ['focusFirstItem']);
      setSubMenus([subMenu as any]);

      (component as any).openSubMenuAndFocus(0);

      expect(toggleSpy).toHaveBeenCalledWith(0, jasmine.any(Function));
      expect(component.focusedSubmenuIndex()).toBe(0);
      expect(subMenu.focusFirstItem).toHaveBeenCalled();
    });

    it('does nothing if already expanded', () => {
      spyOn(component, 'isExpanded').and.returnValue(true);
      const toggleSpy = spyOn(component, 'toggleSubMenu');
      (component as any).openSubMenuAndFocus(0);
      expect(toggleSpy).not.toHaveBeenCalled();
    });
  });

  describe('onSubmenuTabOut', () => {
    it('no-op on mobile', () => {
      spyOnProperty(component as any, 'isMobile', 'get').and.returnValue(true);
      expect(() => component.onSubmenuTabOut()).not.toThrow();
    });

    it('closes all if focus goes outside (desktop)', fakeAsync(() => {
      spyOnProperty(component as any, 'isMobile', 'get').and.returnValue(false);
      spyOn(globalThis, 'requestAnimationFrame').and.callFake(cb => { cb(0); return 1 as any; });

      // asegura que hay submenu abierto y clickOutside activo
      (component as any).expandedIndexes.set({ 0: true });
      component.disableClickOutside = false;

      const closeSpy = spyOn(component, 'closeAllSubMenus');

      const host = document.createElement('div');
      setSubMenus([{ hostEl: { nativeElement: host }, focusFirstItem: () => {} } as any]);

      const outsideBtn = document.createElement('button');
      document.body.appendChild(outsideBtn);
      outsideBtn.focus();

      component.onSubmenuTabOut();
      tick();
      expect(closeSpy).toHaveBeenCalled();

      document.body.removeChild(outsideBtn);
    }));

    it('keeps open if focus stays inside (desktop)', fakeAsync(() => {
      spyOnProperty(component as any, 'isMobile', 'get').and.returnValue(false);
      spyOn(globalThis, 'requestAnimationFrame').and.callFake(cb => { cb(0); return 1 as any; });

      (component as any).expandedIndexes.set({ 0: true });
      component.disableClickOutside = false;

      const closeSpy = spyOn(component, 'closeAllSubMenus');

      const host = document.createElement('div');
      const focusable = document.createElement('button');
      host.appendChild(focusable);
      document.body.appendChild(host);

      setSubMenus([{ hostEl: { nativeElement: host }, focusFirstItem: () => {} } as any]);

      focusable.focus();
      component.onSubmenuTabOut();
      tick();

      expect(closeSpy).not.toHaveBeenCalled();

      document.body.removeChild(host);
    }));
  });

  describe('Signals and Computed', () => {
    it('subMenuOpen computed', () => {
      (component as any).expandedIndexes.set({});
      expect(component.subMenuOpen()).toBeFalse();
      (component as any).expandedIndexes.set({ 1: true });
      expect(component.subMenuOpen()).toBeTrue();
    });

    it('clickOutsideIsActive computed', () => {
      (component as any).expandedIndexes.set({ 1: true });
      component.disableClickOutside = false;
      expect(component.clickOutsideIsActive()).toBeTrue();
    });
  });
});
