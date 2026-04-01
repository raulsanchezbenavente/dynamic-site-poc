import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ButtonStyles, GenerateIdPipe } from '@dcx/ui/libs';

import { DsGroupOptionsListComponent } from './components/group-options-list/group-options-list.component';
import { GroupOptionElementData } from './components/models/group-option-element.model';
import { GroupOptionsTemplateStyles } from './enums/template-styles.enum';

@Component({
  selector: 'ds-group-options',
  templateUrl: './group-options.component.html',
  styleUrls: ['./styles/group-options-base.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, DsGroupOptionsListComponent],
  standalone: true,
})
export class DsGroupOptionsComponent {
  public templateStyle = input.required<GroupOptionsTemplateStyles>();
  public templateGrid = input.required<'1' | '2' | '3' | '4'>();
  public enableHorizontalScroll = input<boolean>(false);
  public optionList = input.required<GroupOptionElementData[]>();

  private readonly generateId = inject(GenerateIdPipe);

  public readonly optionListId = computed(() => this.generateId.transform('GroupOptionsList_'));

  public readonly buttonStyle = computed<ButtonStyles>(() =>
    this.templateStyle() === GroupOptionsTemplateStyles.COVER_IMAGE ? ButtonStyles.SECONDARY : ButtonStyles.PRIMARY
  );
}
