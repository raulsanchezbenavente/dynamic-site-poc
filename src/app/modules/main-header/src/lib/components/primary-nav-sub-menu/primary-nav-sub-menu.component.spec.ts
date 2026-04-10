import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef, QueryList } from '@angular/core';
import { KeyCodeEnum, LinkTarget } from '@dcx/ui/libs';
import { MainMenuItem } from '../../models/main-menu-item.model';
import { PrimaryNavSubMenuComponent } from './primary-nav-sub-menu.component';

describe('PrimaryNavSubMenuComponent', () => {
  let component: PrimaryNavSubMenuComponent;
  let fixture: ComponentFixture<PrimaryNavSubMenuComponent>;

  // Mocks
  const elementRefMock = {
    nativeElement: document.createElement('div'),
  } as ElementRef<HTMLElement>;

  // Signals mock
  let focusedSubmenuIndexSignal: any;

  // Test data
  const menuItem: MainMenuItem = {
    id: 'id1',
    title: 'Test',
    columns: [],
  };

  beforeEach(fakeAsync(() => {
    focusedSubmenuIndexSignal = Object.assign(
      () => 0,
      { set: jasmine.createSpy('set') }
    );

    TestBed.configureTestingModule({
      imports: [PrimaryNavSubMenuComponent],
      providers: [
        { provide: ElementRef, useValue: elementRefMock },
      ],
    });

    fixture = TestBed.createComponent(PrimaryNavSubMenuComponent);
    component = fixture.componentInstance;

    // Set ALL required inputs before detectChanges
    fixture.componentRef.setInput('isResponsive', false);
    fixture.componentRef.setInput('focusedSubmenuIndex', focusedSubmenuIndexSignal);
    fixture.componentRef.setInput('menuItem', menuItem);

    fixture.detectChanges();
    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('menuItem Input', () => {
    it('should set and get menuItem', () => {
      const newMenuItem: MainMenuItem = { id: 'id2', title: 'Other', columns: [] };
      component.menuItem = newMenuItem;
      expect(component.menuItem).toBe(newMenuItem);
    });
  });

  describe('focusFirstItem', () => {
    it('should focus the first submenu item if present', fakeAsync(() => {
      // 1) RAF inmediato para ejecutar el focus dentro del callback
      spyOn(globalThis, 'requestAnimationFrame').and.callFake(cb => { cb(0); return 1 as any; });

      // 2) QueryList inicializado correctamente (para que .first no sea undefined)
      const button = document.createElement('button');
      spyOn(button, 'focus');
      const el = { nativeElement: button } as ElementRef<HTMLElement>;

      const ql = new QueryList<ElementRef<HTMLElement>>();
      (ql as any).reset([el]);
      (ql as any).notifyOnChanges();

      Object.defineProperty(component as any, 'submenuItemRefs', { value: ql, writable: true });

      component.focusFirstItem();
      tick(); // por si hay microtareas adicionales

      expect(button.focus).toHaveBeenCalled();
    }));

    it('should not throw if no submenu items', fakeAsync(() => {
      const ql = new QueryList<ElementRef<HTMLElement>>();
      (ql as any).reset([]);
      (ql as any).notifyOnChanges();
      Object.defineProperty(component as any, 'submenuItemRefs', { value: ql, writable: true });

      expect(() => {
        component.focusFirstItem();
        tick();
      }).not.toThrow();
    }));
  });

  describe('onKeyDown', () => {
    let items: ElementRef<HTMLElement>[];
    let ql: QueryList<ElementRef<HTMLElement>>;

    beforeEach(() => {
      // Create three focusable submenu items
      items = [
        { nativeElement: document.createElement('button') } as ElementRef<HTMLElement>,
        { nativeElement: document.createElement('button') } as ElementRef<HTMLElement>,
        { nativeElement: document.createElement('button') } as ElementRef<HTMLElement>,
      ];
      ql = new QueryList<ElementRef<HTMLElement>>();
      (ql as any)._results = items;
      Object.defineProperty(component, 'submenuItemRefs', { value: ql, writable: true });
    });

    function setFocus(index: number) {
      items[index].nativeElement.tabIndex = 0;
      items[index].nativeElement.focus();
    }

    it('should do nothing if no submenu items', () => {
      Object.defineProperty(component, 'submenuItemRefs', { value: new QueryList<ElementRef<HTMLElement>>(), writable: true });
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_DOWN });
      expect(() => component.onKeyDown(event)).not.toThrow();
    });

    it('should do nothing if active element is not found', () => {
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_DOWN });
      expect(() => component.onKeyDown(event)).not.toThrow();
    });

    it('should focus next item on ArrowDown and update focusedSubmenuIndex', () => {
      setFocus(0);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_DOWN });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[0].nativeElement);

      spyOn(items[1].nativeElement, 'focus');
      component.onKeyDown(event);

      expect(focusedSubmenuIndexSignal.set).toHaveBeenCalledWith(1);
      expect(items[1].nativeElement.focus).toHaveBeenCalled();
    });

    it('should wrap to first item on ArrowDown at end', () => {
      setFocus(2);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_DOWN });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[2].nativeElement);

      spyOn(items[0].nativeElement, 'focus');
      component.onKeyDown(event);

      expect(focusedSubmenuIndexSignal.set).toHaveBeenCalledWith(0);
      expect(items[0].nativeElement.focus).toHaveBeenCalled();
    });

    it('should focus previous item on ArrowUp and update focusedSubmenuIndex', () => {
      setFocus(1);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_UP });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[1].nativeElement);

      spyOn(items[0].nativeElement, 'focus');
      component.onKeyDown(event);

      expect(focusedSubmenuIndexSignal.set).toHaveBeenCalledWith(0);
      expect(items[0].nativeElement.focus).toHaveBeenCalled();
    });

    it('should wrap to last item on ArrowUp at start', () => {
      setFocus(0);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_UP });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[0].nativeElement);

      spyOn(items[2].nativeElement, 'focus');
      component.onKeyDown(event);

      expect(focusedSubmenuIndexSignal.set).toHaveBeenCalledWith(2);
      expect(items[2].nativeElement.focus).toHaveBeenCalled();
    });

    it('should emit closeMenuExternal on Escape', () => {
      setFocus(1);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ESCAPE });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[1].nativeElement);

      const closeSpy = spyOn(component.closeMenuExternal, 'emit');
      component.onKeyDown(event);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should emit submenuTabOut on Tab if not responsive', () => {
      setFocus(1);
      component.isResponsive = false;
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.TAB });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[1].nativeElement);

      const tabOutSpy = spyOn(component.submenuTabOut, 'emit');
      component.onKeyDown(event);

      expect(tabOutSpy).toHaveBeenCalledWith(event);
    });

    it('should not emit submenuTabOut on Tab if responsive', () => {
      setFocus(1);
      component.isResponsive = true;
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.TAB });
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(items[1].nativeElement);

      const tabOutSpy = spyOn(component.submenuTabOut, 'emit');
      component.onKeyDown(event);

      expect(tabOutSpy).not.toHaveBeenCalled();
    });
  });

  describe('LinkTarget', () => {
    it('should expose LinkTarget enum', () => {
      expect(component.LinkTarget).toBe(LinkTarget);
    });
  });
});
