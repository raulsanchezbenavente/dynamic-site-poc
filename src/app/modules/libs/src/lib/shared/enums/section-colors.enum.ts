/**
 * SectionColors is used to apply color variants to specific sections.
 * Each value represents a BEM modifier class like `foo--sc-[name]` applied to define a section's color theme.
 *
 * Example usage in a template:
 * <div class="foo foo--{{ SectionColors.BOOKING }}"></div>
 */
export enum SectionColors {
  BOOKING = 'sc-booking',
  INFO = 'sc-info',
  OFFER = 'sc-offer',
  FARE_BUSINESS = 'sc-fare-business',
}
