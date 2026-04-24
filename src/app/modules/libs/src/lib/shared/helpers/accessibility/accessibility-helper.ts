export const accessibilityHelper = {
  hideElementAccessibility,
  restoreElementAccessibility,
};

const ACCESSIBLE_ELEMENTS_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([disabled]):not([tabindex="-1"])',
];

function getElementTabbableNodes(elem: HTMLElement): NodeListOf<Element> {
  const selector = ACCESSIBLE_ELEMENTS_SELECTORS.join(', ');
  return elem.querySelectorAll(selector);
}

function hideElementAccessibility(elem: HTMLElement | null): void {
  if (!elem) {
    return;
  }

  const tabbableElements = getElementTabbableNodes(elem);

  for (const elem of Array.from(tabbableElements)) {
    elem.setAttribute('tabindex', '-1');
  }
}

function restoreElementAccessibility(elem: HTMLElement | null): void {
  if (!elem) {
    return;
  }

  const tabbableElements = getElementTabbableNodes(elem);

  for (const elem of Array.from(tabbableElements)) {
    elem.setAttribute('tabindex', '0');
  }
}
