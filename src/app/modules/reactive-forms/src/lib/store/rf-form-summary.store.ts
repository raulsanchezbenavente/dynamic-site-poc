/* eslint-disable @typescript-eslint/naming-convention */
import { computed, Signal } from '@angular/core';
import { FormSummaryComponent, FormSummaryViews } from '@dcx/ui/business-common';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface FormSummaryInstanceState {
  selectedTemplate: string;
  formSummary: FormSummaryComponent;
  forceParseConfig?: boolean;
}
export interface FormSummariesState {
  summaries: Record<string, FormSummaryInstanceState>;
}

const initialState: FormSummariesState = {
  summaries: {},
};

export const RfFormSummaryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    register(id: string, formSummary: FormSummaryComponent, initialView: string = FormSummaryViews.FORM_BUILDER): void {
      patchState(store, (state) => ({
        summaries: {
          ...state.summaries,
          [id]: { selectedTemplate: initialView, formSummary },
        },
      }));
    },

    getSummary(id: string): FormSummaryComponent {
      return computed(() => store.summaries()[id]?.formSummary ?? null)();
    },

    changeView(id: string, view: string): void {
      patchState(store, (state) => {
        if (!state.summaries[id]) {
          return state;
        }
        return {
          summaries: {
            ...state.summaries,
            [id]: { ...state.summaries[id], selectedTemplate: view, forceParseConfig: false },
          },
        };
      });
    },

    getSelectedView(id: string): Signal<string> {
      return computed(() => store.summaries()[id]?.selectedTemplate ?? FormSummaryViews.FORM_BUILDER);
    },

    unregister(id: string): void {
      const remainingSummaries: Record<string, FormSummaryInstanceState> = {};
      const summaries = store.summaries();

      for (const key in summaries) {
        if (key !== id) {
          remainingSummaries[key] = summaries[key];
        }
      }

      patchState(store, { summaries: remainingSummaries });
    },
    forceParseConfig(id: string): void {
      patchState(store, (state) => ({
        summaries: {
          ...state.summaries,
          [id]: { ...state.summaries[id], forceParseConfig: true },
        },
      }));
    },
    getForceParseConfig(id: string): Signal<boolean> {
      return computed(() => store.summaries()[id]?.forceParseConfig ?? false);
    },

    isAnyFormBuilderActive(): Signal<boolean> {
      return computed(() => {
        const summaries = store.summaries();
        for (const key in summaries) {
          if (summaries[key].selectedTemplate === FormSummaryViews.FORM_BUILDER) return true;
        }
        return false;
      });
    },
  }))
);
