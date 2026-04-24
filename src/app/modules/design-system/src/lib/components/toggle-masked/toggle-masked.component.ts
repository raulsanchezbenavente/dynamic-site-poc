import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonTranslationKeys, MaskPipe, ToggleMaskedConfig, ToggleMaskedData } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'toggle-masked',
  templateUrl: './toggle-masked.component.html',
  styleUrls: ['./styles/toggle-masked.style.scss'],
  imports: [],
  standalone: true,
})
export class ToggleMaskedComponent implements OnInit {
  public maskActionText: string = '';
  public unmaskActionText: string = '';
  public unmaskedStatusText: string = '';
  public maskedStatusText: string = '';
  public maskEnabled: boolean | undefined = false;
  public isCodeMasked: boolean | undefined = false;
  public code: string = '';
  protected initToggleCode: boolean = false;
  protected maskedCode: string = '';
  protected unMaskedCode: string = '';

  private readonly translate = inject(TranslateService);

  @Input({ required: true }) public config!: ToggleMaskedConfig;
  @Input({ required: true }) public data!: ToggleMaskedData;

  constructor(protected maskPipe: MaskPipe) {}

  public ngOnInit(): void {
    this.handleMask();
    this.setTexts();
  }

  public toggleCodeMask(): void {
    this.initToggleCode = true;
    this.isCodeMasked = !this.isCodeMasked;
    this.code = this.isCodeMasked ? this.maskedCode : this.unMaskedCode;
  }

  protected setTexts(): void {
    this.maskedStatusText = this.replaceLabel(
      this.translate.instant(CommonTranslationKeys.Common_ToggleMasked_Status_Masked),
      this.data.label!
    );
    this.unmaskedStatusText = this.replaceLabel(
      this.translate.instant(CommonTranslationKeys.Common_ToggleMasked_Status_Unmasked),
      this.data.label!
    );
    this.maskActionText = this.replaceLabel(
      this.translate.instant(CommonTranslationKeys.Common_ToggleMasked_Action_Mask),
      this.data.label!
    );
    this.unmaskActionText = this.replaceLabel(
      this.translate.instant(CommonTranslationKeys.Common_ToggleMasked_Action_Unmask),
      this.data.label!
    );
  }

  protected handleMask(): void {
    if (this.data) {
      this.unMaskedCode = this.data.code;
      this.code = this.unMaskedCode;
      this.maskEnabled = this.isMaskEnabled();
      this.isCodeMasked = this.maskEnabled;
      if (this.maskEnabled) {
        this.setMask(this.unMaskedCode, this.config.mask);
        if (this.maskedCode === this.unMaskedCode) {
          this.maskEnabled = false;
        }
      }
    }
  }

  protected isMaskEnabled(): boolean | undefined {
    return !!this.config.mask && this.config.mask.length === this.data.code.length;
  }

  protected setMask(code: string, mask: string): void {
    this.maskedCode = this.maskPipe.transform(code, mask);
    this.code = this.maskedCode;
  }

  protected replaceLabel(text: string, label: string): string {
    if (text.includes('{{label}}')) {
      return text.replace('{{label}}', label);
    }
    return text;
  }
}
