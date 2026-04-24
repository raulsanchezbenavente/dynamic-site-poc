export const windowHelper = {
  scrollToError,
  getWindowScrollY,
};

function scrollToError(elementRef: any, selectorQueryService: any) {
  const target = selectorQueryService.SelectInvalidInput(elementRef);
  if (target && target !== '') {
    target.parentElement.scrollIntoView();
    globalThis.scrollBy(0, -90);
  }
}

/**
 * Return the scrollY property. The deprecated pageYOffset is used for IE compatibility
 */
function getWindowScrollY(): number {
  return globalThis.scrollY || globalThis.pageYOffset;
}
