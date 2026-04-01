import {
  ApplicationRef,
  createComponent,
  createNgModule,
  EnvironmentInjector,
  inject,
  Injectable,
  Type,
} from '@angular/core';

import { ComposerStatusEnum } from '../enums';
import { COMPONENT_MAIN } from '../injection-tokens';

import { ComposerService } from './composer.service';
import { LoggerService } from './logger.service';

/**
 * Module Renderer Service
 * Handles dynamic instantiation and rendering of Angular modules into the DOM
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class ModuleRendererService {
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);

  /**
   * Renders a module and its components into a host element
   *
   * @param id - Unique module identifier
   * @param name - Module name for tracking
   * @param priority - Loading priority order
   * @param moduleClass - Angular module class to instantiate
   * @param hostElement - DOM element where components will be rendered
   * @param isolatedLoading - Whether module loads independently of global loader
   */
  public render(
    id: string,
    name: string,
    priority: number,
    moduleClass: Type<unknown>,
    hostElement: Element,
    isolatedLoading = false
  ): void {
    if (this.composer.registerList().some((reg) => reg.id === id)) {
      this.logger.warn(ModuleRendererService.name, 'Module already registered', id);
      return;
    }

    const moduleRef = createNgModule(moduleClass, this.envInjector);
    const componentsToRender = moduleRef.injector.get(COMPONENT_MAIN);

    for (const componentList of componentsToRender) {
      for (const component of componentList) {
        this.renderComponent(id, name, priority, component, hostElement, isolatedLoading);
      }
    }
  }

  /**
   * Renders a component and registers it with the composer
   */
  private renderComponent(
    id: string,
    name: string,
    priority: number,
    component: Type<unknown>,
    hostElement: Element,
    isolatedLoading: boolean
  ): void {
    try {
      const componentRef = createComponent(component, {
        environmentInjector: this.envInjector,
        hostElement,
      });
      this.appRef.attachView(componentRef.hostView);
      this.composer.addComposerRegister({
        id,
        name,
        priority,
        status: ComposerStatusEnum.LOADING,
        reference: componentRef,
        isolatedLoading,
      });
    } catch (error) {
      console.error('ERROR rendering component:', name, error);
      this.logger.error(ModuleRendererService.name, `Error rendering component "${name}" (${id})`, error);
      throw error;
    }
  }
}
