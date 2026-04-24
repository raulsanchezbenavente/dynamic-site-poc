import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mask',
    standalone: true
})
export class MaskPipe implements PipeTransform {
  transform(input: string, mask: string): string {
    let maskedInput = '';

    if (!input || !mask) {
      return maskedInput;
    }

    for (let i = 0; i < mask.length; i++) {
      const characterMask = mask.charAt(i);
      if (this.isValidMaskCharacter(characterMask)) {
        maskedInput += input.charAt(i);
      } else {
        maskedInput += characterMask;
      }
    }

    return maskedInput;
  }

  private isValidMaskCharacter(character: string): boolean {
    const regexToValidateMask = /^[a-zA-Z0-9]+$/;
    return regexToValidateMask.test(character);
  }
}
