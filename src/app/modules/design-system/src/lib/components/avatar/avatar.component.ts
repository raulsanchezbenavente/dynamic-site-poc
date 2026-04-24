import {
  Component,
  DestroyRef,
  inject,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MergeConfigsService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';

import { IconComponent } from '../icon/icon.component';

import { AvatarSize } from './enums/avatar-size.enum';
import { TranslationKeys } from './enums/translation-keys.enum';
import { AvatarConfig } from './models/avatar.config';
import { AVATAR_CONFIG } from './tokens/avatar-default-config.token';

@Component({
  selector: 'avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./styles/avatar.styles.scss'],
  host: {
    class: 'avatar',
    '[class.avatar--smallest]': 'config.size === avatarSize.SMALLEST',
    '[class.avatar--extra-small]': 'config.size === avatarSize.EXTRA_SMALL',
    '[class.avatar--small]': 'config.size === avatarSize.SMALL',
    '[class.avatar--medium]': 'config.size === avatarSize.MEDIUM',
    '[class.avatar--large]': 'config.size === avatarSize.LARGE',
  },
  imports: [IconComponent],
  standalone: true,
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input({ required: true }) public config!: AvatarConfig;

  public avatarSize = AvatarSize;
  public avatarInitials!: string;

  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private notApplicableLabel = '';

  constructor(
    private readonly mergeConfigsService: MergeConfigsService,
    @Inject(AVATAR_CONFIG)
    @Optional()
    private readonly defaultConfig: AvatarConfig
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.initDefaultConfiguration();
    }
  }

  public ngOnInit(): void {
    this.notApplicableLabel = this.translate.instant(TranslationKeys.Avatar_NotApplicable_Text);

    // Reactive updates on language/dictionary changes for this single key
    this.translate
      .stream(TranslationKeys.Avatar_NotApplicable_Text)
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((label: string): void => {
        this.notApplicableLabel = label;
        this.updateAvatarInitials();
      });

    this.initDefaultConfiguration();
  }

  /** Merges defaults with input config and recomputes initials. */
  protected initDefaultConfiguration(): void {
    this.config = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config);
    this.updateAvatarInitials();
  }

  /** Computes the initials reactively using current config and i18n label. */
  private updateAvatarInitials(): void {
    const raw: string = this.config?.avatarText?.trim?.() ?? '';
    this.avatarInitials = raw ? raw.toUpperCase() : this.notApplicableLabel;
  }
}
