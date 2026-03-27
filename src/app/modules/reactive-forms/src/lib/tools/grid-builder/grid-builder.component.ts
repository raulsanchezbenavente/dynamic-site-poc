import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';

import { GridBuilderLayout } from './enums/grid-builder-layout.enum';
import { GridBuilderColspan, GridBuilderCustomType } from './types/grid-builder.type';

/**
 * GridBuilderComponent
 *
 * Renders a configurable grid of form controls. The component accepts:
 * - a plain config object (`config`) mapping control keys to control definitions,
 * - an optional `customFields` map that groups several keys into a single "composite" item
 *   with optional `cssClass` and `colSpan`,
 * - a layout setting (`appearance`), and
 * - the desired number of columns (`columns`).
 *
 * Internally, it computes a linear iteration (`configIteration`) that interleaves
 * single keys (string) and grouped items (`GridBuilderColspan`). It also builds
 * a `classMap` so both the grouped object and each of its keys share the same CSS classes.
 *
 * @selector grid-builder
 * @remarks
 * - Uses Angular signals for inputs/outputs (`input`, `output`) and reactive `effect`.
 * - Complexity is reduced by indexing `customFields` for O(1) lookup.
 * @see GridBuilderColspan
 * @see GridBuilderCustomType
 */
@Component({
  selector: 'grid-builder',
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './grid-builder.component.html',
  styleUrl: './styles/grid-builder.styles.scss',
  host: { class: 'grid-builder' },
})
export class GridBuilderComponent {
  /**
   * Emits whenever the `config` signal changes (debounced via the internal effect).
   * Consumers can subscribe to react to configuration changes.
   * @fires configChange
   */
  public configChange = output<any>();

  /**
   * Optional form name identifier. Useful for generating element IDs or ARIA relationships.
   */
  public formName = input<string>('');

  /**
   * Main configuration object for the grid. Keys are control identifiers;
   * values are control definitions (type `any` to allow different consumers).
   */
  public config = input<Record<string, any>>({});

  /**
   * Declarative grouping configuration. Each entry groups multiple keys and may provide
   * optional `cssClass` and `colSpan` that affect rendering.
   */
  public customFields = input<GridBuilderCustomType>({});

  /**
   * Desired number of columns for the grid. The template may adapt CSS classes accordingly.
   */
  public columns = input<number>(2);

  /**
   * Stable order comparator used by Angular structural directives (e.g., *ngFor with keyvalue pipe)
   * to preserve original object order.
   * @example
   * <ng-container *ngFor="let kv of config() | keyvalue: originalOrder">
   *   ...
   * </ng-container>
   */
  public originalOrder: () => number = () => 0;

  /**
   * Visual appearance of the grid (e.g., default/compact/etc.).
   */
  public appearance = input<GridBuilderLayout>(GridBuilderLayout.DEFAULT);

  /**
   * Controls to hide from the grid. Can be either:
   * - An array of control names (strings) to hide
   * - A function that receives a control name and returns true if it should be hidden
   * Hidden controls respect the flex layout by using display: none.
   */
  public hiddenControls = input<string[]>([]);

  /**
   * Linearized iteration of the config to render. Contains either:
   * - a plain key (string) for single controls, or
   * - a `GridBuilderColspan` object for grouped controls.
   */
  public configIteration: (string | GridBuilderColspan)[] = [];

  /**
   * Map of item (group object or key string) to its CSS class list.
   * Ensures both the group object and each of its keys resolve to the same computed classes.
   */
  public classMap = new Map<any, string[]>();

  /**
   * Computed map of container keys to their precomputed CSS class objects.
   * Avoids calling getContainerClasses() repeatedly in the template.
   * Recalculates automatically when configIteration, classMap, or hiddenControls change.
   */
  public containerClassesMap = computed(() => {
    const map = new Map<string, Record<string, boolean>>();
    const hidden = this.hiddenControls();

    for (const item of this.configIteration) {
      if (typeof item === 'string') {
        map.set(item, this.buildClasses(item, item, hidden));
        continue;
      }

      for (const key of item.keys) {
        map.set(key, this.buildClasses(key, item, hidden));
      }
    }

    return map;
  });

  /**
   * Cache to avoid reprocessing the same config reference in the reactive effect.
   */
  private previousFormConfig: Record<string, any> | undefined;

  /**
   * Reactive effect that:
   * 1) Detects changes to `config()`,
   * 2) Emits `configChange`, and
   * 3) Rebuilds the `configIteration` and `classMap`.
   * Guarded by `previousFormConfig` reference check to avoid redundant work.
   */
  private readonly registerEffect = effect(() => {
    const currentFormConfig: Record<string, any> = this.config();
    if (currentFormConfig === this.previousFormConfig) {
      return;
    }
    this.previousFormConfig = currentFormConfig;
    this.configChange.emit(this.config());
    this.buildConfigIteration();
  });

  /**
   * Computes `configIteration` from the current `config()` and `customFields()`,
   * grouping keys as specified and populating the internal `classMap`.
   * Uses an indexed map for O(1) lookup of keys to custom grouping.
   * @private
   */
  private buildConfigIteration(): void {
    const configKeys = Object.keys(this.config());
    const keyToCustom = this.indexCustomFields(this.customFields()); // lookup O(1)
    const used = new Set<string>();
    const result: (string | GridBuilderColspan)[] = [];

    for (const key of configKeys) {
      if (used.has(key)) continue;

      const custom = keyToCustom.get(key);
      if (custom && this.noneUsed(custom.keys, used)) {
        result.push(this.toGroup(custom));
        for (const k of custom.keys) used.add(k);
        continue;
      }

      result.push(key);
      used.add(key);
    }

    this.configIteration = result;
    this.rebuildClassMap(result);
  }

  /**
   * Builds an index from each key in `customFields` to its grouping object,
   * enabling constant-time lookup while iterating over `config` keys.
   * @param customFields - The custom grouping configuration.
   * @returns A map from individual key to its `GridBuilderColspan` config.
   * @private
   */
  private indexCustomFields(customFields: Record<string, GridBuilderColspan>): Map<string, GridBuilderColspan> {
    const map = new Map<string, GridBuilderColspan>();
    for (const cfg of Object.values(customFields)) {
      for (const k of cfg.keys) map.set(k, cfg);
    }
    return map;
  }

  /**
   * Checks that none of the provided keys have been marked as used.
   * @param keys - Keys to be tested.
   * @param used - Set containing already processed keys.
   * @returns `true` if none of the keys are found in `used`; otherwise `false`.
   * @private
   */
  private noneUsed(keys: string[], used: Set<string>): boolean {
    for (const k of keys) if (used.has(k)) return false;
    return true;
  }

  /**
   * Produces a normalized grouping object from a `GridBuilderColspan` input.
   * Copies only present optional fields (`cssClass`, `colSpan`) to keep the object minimal.
   * @param cfg - The grouping configuration.
   * @returns A normalized `GridBuilderColspan`.
   * @private
   */
  private toGroup(cfg: GridBuilderColspan): GridBuilderColspan {
    const group: GridBuilderColspan = { keys: cfg.keys };
    if (cfg.cssClass) group.cssClass = cfg.cssClass;
    if (cfg.colSpan) group.colSpan = cfg.colSpan;
    return group;
  }

  /**
   * Rebuilds `classMap` so that each grouped item and its child keys share the same class list.
   * Computes class list once per group to avoid redundant work.
   * @param items - The computed iteration of keys/groups.
   * @private
   */
  private rebuildClassMap(items: (string | GridBuilderColspan)[]): void {
    this.classMap.clear();
    for (const item of items) {
      if (typeof item === 'string') continue;
      const classes = this.getClassList(item);
      this.classMap.set(item, classes);
      for (const key of item.keys) this.classMap.set(key, classes);
    }
  }

  /**
   * Ensures a uniform way to obtain keys from either a single key (string)
   * or a grouped container (`GridBuilderColspan`).
   * @param controlContainer - A key string or a grouping object.
   * @returns An array of keys.
   */
  public getKeys(controlContainer: string | GridBuilderColspan): string[] {
    return (controlContainer as GridBuilderColspan).keys;
  }

  /**
   * Utility to check whether a grouped control container has more than one key.
   * Used to decide between rendering a flat field or a field group (e.g., rf-inner-grid).
   * @param controlContainer - A key string or a grouping object.
   * @returns `true` if the container has more than one key; otherwise `false`.
   */
  public hasMultipleKeys(controlContainer: string | GridBuilderColspan): boolean {
    return this.getKeys(controlContainer).length > 1;
  }

  /**
   * Returns the first key from a control container, regardless of whether it's a single key or a group.
   * Ensures consistent access to a field key when rendering or binding controls.
   * @param container - A key string or a grouping object.
   * @returns The first key to use for rendering/binding.
   */
  public getFirstKey(container: string | GridBuilderColspan): string {
    return typeof container === 'string' ? container : container.keys[0];
  }

  /**
   * Resolves the CSS class string associated with a given column span semantic.
   * @param colSpan - Semantic colSpan value: 'colspan2' | 'colspan3' | 'full' | undefined.
   * @returns A space-separated class string, or `null` if no span applies.
   */
  public getColSpanClass(colSpan?: string): string | null {
    switch (colSpan) {
      case 'colspan2':
        return 'rf-grid-colspan rf-grid-colspan-2';
      case 'colspan3':
        return 'rf-grid-colspan rf-grid-colspan-3';
      case 'full':
        return 'rf-grid-colspan rf-grid-colspan-full';
      default:
        return null;
    }
  }

  /**
   * Produces the full list of CSS classes for a grouped item by combining:
   * - the span class derived from `colSpan`, and
   * - any explicit `cssClass` on the group.
   * @param item - The grouped item definition.
   * @returns An array of CSS class names to apply.
   */
  public getClassList(item: GridBuilderColspan): string[] {
    const classList: string[] = [];
    const spanClass = this.getColSpanClass(item.colSpan);
    if (spanClass) classList.push(spanClass);
    if (item.cssClass) classList.push(item.cssClass);
    return classList;
  }

  /**
   * Builds the CSS class object for a container.
   * Used by containerClassesMap computed signal.
   * @param container - The control container key.
   * @param extra - The extra object reference for class map lookup.
   * @param hidden - Array of hidden control names.
   * @returns An object with CSS classes as keys and boolean values.
   */
  private buildClasses(
    container: string,
    extra: string | GridBuilderColspan,
    hidden: string[]
  ): Record<string, boolean> {
    const classes: Record<string, boolean> = {};

    const mappedClasses = this.classMap.get(extra);
    if (mappedClasses) {
      for (const cls of mappedClasses) {
        classes[cls] = true;
      }
    }

    classes['rf-grid_col--hidden'] = hidden.includes(container);

    return classes;
  }
}
