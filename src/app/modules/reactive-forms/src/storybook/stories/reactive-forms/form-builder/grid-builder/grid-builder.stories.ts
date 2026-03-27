import { DsButtonComponent } from '@dcx/storybook/design-system';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { GridBuilderLayout } from '../../../../../lib/tools/grid-builder/enums/grid-builder-layout.enum';
import { GridBuilderComponent } from '../../../../../lib/tools/grid-builder/grid-builder.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { GRID_BUILDER_FAKE_CONFIG, GRID_BUILDER_LOGIN_FAKE_CONFIG } from '../configs/form-builder.config';

import { GridBuilderStoryComponent } from './grid-builder-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<GridBuilderStoryComponent> = {
  title: 'Main/Reactive Forms/Form & Grid Builders/Grid Builder',
  component: GridBuilderStoryComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Grid Builder allows you to structure forms using a flexible and consistent column-based layout.\nIt simplifies the visual and semantic arrangement of individual or grouped form fields.\n\nView full usage guide: [Grid Builder - Form Layout System](https://flyr.atlassian.net/wiki/spaces/DC/pages/5326602556/Grid+Builder+-+Form+Layout+System)',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<grid-builder-story [columns]="columns" [config]="config" [customFields]="customFields || {}" />`,
  }),

  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        FormValidationFeaturesComponent,
        GridBuilderComponent,
        GridBuilderStoryComponent,
        HoverOpacityDirective,
        RfFormBuilderComponent,
        DsButtonComponent,
      ],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<GridBuilderStoryComponent>;

export const ONE_COL: Story = {
  name: '1 Columns',
  args: {
    columns: 1,
    config: GRID_BUILDER_FAKE_CONFIG,
  },
};
export const TWO_COLS: Story = {
  name: '2 Columns',
  args: {
    columns: 2,
    config: GRID_BUILDER_FAKE_CONFIG,
  },
};
export const THREE_COLS: Story = {
  name: '3 Columns',
  args: {
    columns: 3,
    config: GRID_BUILDER_FAKE_CONFIG,
  },
};
export const FOUR_COLS: Story = {
  name: '4 Columns',
  args: {
    columns: 4,
    config: GRID_BUILDER_FAKE_CONFIG,
  },
};

// inline
export const TWO_COLS_INLINE_APPEARANCE: Story = {
  name: '2 Columns / Inline Appearance',
  args: {
    columns: 2,
    appearance: GridBuilderLayout.INLINE,
    config: {
      ['surname']: GRID_BUILDER_LOGIN_FAKE_CONFIG['surname'],
      ['email']: GRID_BUILDER_LOGIN_FAKE_CONFIG['email'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
    <rf-form-builder
      #myFormInline
      [name]="'MyFormInline'"
      [config]="bypassedConfig"
      [displayErrorsMode]="currentDisplayErrorMode">
      <grid-builder
        [config]="config"
        [columns]="columns"
        [appearance]="appearance"
        (configChange)="bypassedConfig = $event">

        <ds-button [config]="{label: 'Submit'}" />
      </grid-builder>
    </rf-form-builder>
    `,
  }),
};
export const THREE_COLS_INLINE_APPEARANCE: Story = {
  name: '3 Columns / Inline Appearance',
  args: {
    columns: 3,
    appearance: GridBuilderLayout.INLINE,
    config: {
      ['name']: GRID_BUILDER_LOGIN_FAKE_CONFIG['name'],
      ['surname']: GRID_BUILDER_LOGIN_FAKE_CONFIG['surname'],
      ['email']: GRID_BUILDER_LOGIN_FAKE_CONFIG['email'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
    <rf-form-builder
      #myFormInline1
      [name]="'MyFormInline'"
      [config]="bypassedConfig"
      [displayErrorsMode]="currentDisplayErrorMode">
      <grid-builder
        [config]="config"
        [columns]="columns"
        [appearance]="appearance"
        (configChange)="bypassedConfig = $event">

        <ds-button [config]="{label: 'Submit'}" />
      </grid-builder>
    </rf-form-builder>
    `,
  }),
};

// variations: colspan, grouped fields, customClass
export const TWO_COLS_FIELDGROUP_COLSPAN: Story = {
  name: '2 Columns - Field Group (Gender + Name) and ColspanFull',
  args: {
    columns: 2,
    config: GRID_BUILDER_FAKE_CONFIG,
    customFields: {
      genderName: {
        keys: ['gender', 'name'],
        cssClass: 'custom-field-group',
      },
      birthday: {
        keys: ['selectDatePicker'],
        colSpan: 'full',
      },
    },
  },
};
export const THREE_COLS_COLSPAN: Story = {
  name: '3 Columns - Field Group (Gender + Name) and Colspan2',
  args: {
    columns: 3,
    config: GRID_BUILDER_FAKE_CONFIG,
    customFields: {
      genderName: {
        keys: ['gender', 'name'],
      },
      phoneNumber: {
        keys: ['phoneNumber'],
        colSpan: 'colspan2',
      },
    },
  },
};

export const FOUR_COLS_COLSPAN: Story = {
  name: '4 Columns - Colspan2',
  args: {
    columns: 4,
    config: GRID_BUILDER_FAKE_CONFIG,
    customFields: {
      birthday: {
        keys: ['selectDatePicker'],
        colSpan: 'colspan2',
      },
    },
  },
};
