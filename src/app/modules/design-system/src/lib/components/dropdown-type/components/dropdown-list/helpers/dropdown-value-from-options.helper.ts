import { OptionsList } from '@dcx/ui/libs';

/**
 * Resolves the selected value code from a list of options.
 *
 * Priority:
 * 1. If a value code is provided and matches an option, that option is selected.
 * 2. If no code is provided, but one option has `isSelected: true`, it is selected.
 * 3. If neither apply, no option is selected.
 *
 * Important: this function mutates the `options` array to update selection state (`isSelected`).
 *
 * @param valueCode The value code from the dropdown model, if any.
 * @param options The list of available options.
 * @returns The resolved `code` of the selected option, or empty string if none matched.
 */
export function resolveDropdownValueFromOptions(valueCode: string | undefined, options: OptionsList[] = []): string {
  if (valueCode) {
    const matchedOption = options.find((opt) => opt.code === valueCode);
    for (const opt of options) {
      opt.isSelected = matchedOption ? opt.code === matchedOption.code : false;
    }
    return matchedOption?.code ?? '';
  }

  const fallbackSelected = options.find((opt) => opt.isSelected);
  for (const opt of options) {
    opt.isSelected = fallbackSelected ? opt.code === fallbackSelected.code : false;
  }

  return fallbackSelected?.code ?? '';
}
