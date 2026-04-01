import { TestBed } from '@angular/core/testing';
import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  NgModule,
  Type,
} from '@angular/core';

import { ModuleRendererService } from '../module-renderer.service';
import { ComposerService } from '../composer.service';
import { LoggerService } from '../logger.service';
import { COMPONENT_MAIN } from '../../injection-tokens';
import { ComposerStatusEnum } from '../../enums';

@Component({
  standalone: true,
  selector: 'lib-module-renderer-test',
  template: 'Test component',
})
class TestMainComponent {}

@NgModule({
  providers: [
    { provide: COMPONENT_MAIN, useValue: [[TestMainComponent]] },
  ],
})
class TestModule {}

describe('ModuleRendererService', () => {
  let service: ModuleRendererService;
  let composerMock: jasmine.SpyObj<ComposerService>;
  let loggerMock: jasmine.SpyObj<LoggerService>;
  let appRef: ApplicationRef;
  let envInjector: EnvironmentInjector;

  beforeEach(() => {
    composerMock = jasmine.createSpyObj('ComposerService', [
      'registerList',
      'addComposerRegister',
    ]);

    loggerMock = jasmine.createSpyObj('LoggerService', ['log', 'warn']);

    TestBed.configureTestingModule({
      providers: [
        ModuleRendererService,
        { provide: ComposerService, useValue: composerMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(ModuleRendererService);
    appRef = TestBed.inject(ApplicationRef);
    envInjector = TestBed.inject(EnvironmentInjector);

    spyOn(appRef, 'attachView');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not render module if already registered', () => {
    composerMock.registerList.and.returnValue([{ id: 'test' } as any]);

    const host = document.createElement('div');

    service.render('test', 'Existing module', 1, TestModule as Type<unknown>, host);

    expect(composerMock.addComposerRegister).not.toHaveBeenCalled();
    expect(appRef.attachView).not.toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalledWith(
      ModuleRendererService.name,
      'Module already registered',
      'test'
    );
  });

  it('should render module if not registered', () => {
    composerMock.registerList.and.returnValue([]);

    const host = document.createElement('div');

    service.render('new', 'New module', 2, TestModule as Type<unknown>, host);

    expect(composerMock.addComposerRegister).toHaveBeenCalledTimes(1);
    const reg = composerMock.addComposerRegister.calls.mostRecent().args[0];

    expect(reg).toEqual(jasmine.objectContaining({
      id: 'new',
      name: 'New module',
      priority: 2,
      status: ComposerStatusEnum.LOADING,
      isolatedLoading: false,
    }));
    expect(reg.reference).toBeTruthy();
    expect(appRef.attachView).toHaveBeenCalledWith(reg.reference.hostView);
    expect(host.textContent).toContain('Test component');
  });

  it('should propagate isolatedLoading flag', () => {
    composerMock.registerList.and.returnValue([]);

    const host = document.createElement('div');

    service.render('iso', 'Isolated module', 5, TestModule as Type<unknown>, host, true);

    expect(composerMock.addComposerRegister).toHaveBeenCalledTimes(1);
    const reg = composerMock.addComposerRegister.calls.mostRecent().args[0];

    expect(reg).toEqual(jasmine.objectContaining({
      id: 'iso',
      name: 'Isolated module',
      priority: 5,
      status: ComposerStatusEnum.LOADING,
      isolatedLoading: true,
    }));
    expect(reg.reference).toBeTruthy();
  });
});
