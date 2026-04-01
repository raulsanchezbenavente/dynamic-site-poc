export interface SliderBreakpointsConfig {
  XS: SliderBreakpointsVM;
  S?: SliderBreakpointsVM;
  M?: SliderBreakpointsVM;
  L?: SliderBreakpointsVM;
  XL?: SliderBreakpointsVM;
  XXL?: SliderBreakpointsVM;
}

export interface SliderBreakpointsVM {
  visibleItems: number;
  itemsMargin?: number;
  itemsToScroll?: number;
}
