import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextHelperService {
  /**
   * Capitalizes the first letter of each word and lowercases the rest.
   * Example: "john DOE" → "John Doe"
   */
  public getCapitalizeWords(text: string): string {
    if (!text?.trim()) return '';

    return text
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Returns the initial of the last word in the given text,
   * capitalized and followed by a dot.
   * Example: "John Doe" → "D."
   */
  public getLastWordInitialWithDot(text: string): string {
    if (!text) return '';
    const trimmed = text.trim();
    if (!trimmed) return '';
    const lastWord = trimmed.split(/\s+/).pop()!;
    return lastWord ? `${lastWord[0].toUpperCase()}.` : '';
  }

  /**
   * Returns the initials using the first character of the provided
   * first name and last name.
   *
   * Both values are trimmed and the result is returned in uppercase.
   *
   * Examples:
   * - firstName="John", lastName="Arias" → "JA"
   * - firstName="José María", lastName="López" → "JL"
   * - firstName="María José", lastName="García López" → "MG"
   */
  public getInitials(firstName?: string, lastName?: string): string {
    const firstInitial = firstName?.trim()?.charAt(0) ?? '';
    const lastInitial = lastName?.trim()?.charAt(0) ?? '';
    return firstInitial || lastInitial ? `${firstInitial}${lastInitial}`.toUpperCase() : '';
  }

  /**
   * Converts text to camelCase.
   * Example: "hello world example" → "helloWorldExample"
   */
  public toCamelCase(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  }

  /**
   * Converts text to kebab-case.
   * Example: "Hello World Example" → "hello-world-example"
   */
  public toKebabCase(text: string): string {
    if (!text) return '';
    return text
      .replaceAll(/([a-z])([A-Z])/g, '$1-$2')
      .replaceAll(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-/, '')
      .replace(/-$/, '')
      .toLowerCase();
  }

  /**
   * Capitalizes only the first letter of the string and lowercases the rest.
   * Example: "hELLO" → "Hello"
   */
  public toCapitalCase(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Concatenates the non-empty parts of a string array into a single string,
   * separated by a space.
   *
   * - Removes `null`, `undefined`, and empty strings.
   * - Trims unnecessary whitespace from each element before joining.
   * - Ensures no extra spaces at the beginning or end.
   *
   * @param parts - List of text fragments to concatenate.
   * @returns A string with the valid parts joined by a space, or an empty string if no valid parts exist.
   *
   * @example
   * concatValidParts(['123 Main St', '', 'New York'])
   * // Returns: '123 Main St New York'
   */
  public concatValidParts(parts: string[]): string {
    return parts.filter((p) => !!p && p.trim() !== '').join(' ');
  }

  /**
   * Normalizes the spacing of a string by trimming it and replacing multiple spaces with a single space.
   * @param value - string to normalize
   * @returns The normalized string with consistent spacing.
   *
   * @example
   * normalizeTextSpacing('  hello   world  ')
   */
  public normalizeTextSpacing(value: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value?.trim().replaceAll(/\s+/g, ' ');
  }

  /**
   * Normalizes text for URL parameters by removing accents, diacritics, and special characters.
   * Converts characters like "ñ" to "n", removes accents from vowels, normalizes spacing, and converts to lowercase.
   * This ensures proper handling by destination services that may not support special characters.
   *
   * @param value - The text value to normalize
   * @returns The normalized string safe for URL parameters in lowercase, or empty string if null/undefined/empty
   *
   * @example
   * normalizeUrlParameter('iñaqui') // Returns: 'inaqui'
   * normalizeUrlParameter('José María') // Returns: 'jose maria'
   * normalizeUrlParameter('García-López') // Returns: 'garcia-lopez'
   */
  public normalizeUrlParameter(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/[ñÑ]/g, 'n')
      .replaceAll(/[`¨^]/g, '')
      .trim()
      .replaceAll(/\s+/g, ' ')
      .toLowerCase();
  }

  /**
   * Formats passenger names by:
   * - Capitalizing the first letter of each word
   * - Lowercasing the rest
   * - Removing accents and diacritics
   * - Replacing "Ñ/ñ" with "N/n"
   *
   * This ensures consistent passenger name display across all pages.
   *
   * @param name - The passenger name to format
   * @returns Formatted name safe for display
   *
   * @example
   * formatPassengerName('JOSÉ MARÍA') // Returns: 'Jose Maria'
   * formatPassengerName('MUÑOZ') // Returns: 'Munoz'
   */
  public formatPassengerName(name: string): string {
    if (!name?.trim()) return '';

    // Normalize accents and special characters
    const normalized = name
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '') // Remove accents
      .replaceAll(/[ñÑ]/g, (match) => (match === 'ñ' ? 'n' : 'N')); // Replace ñ/Ñ

    // Capitalize first letter of each word
    return this.getCapitalizeWords(normalized);
  }
}
