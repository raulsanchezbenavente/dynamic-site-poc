# Border Selected

Layout styling mixin used to give a border indication to a selected or active element.

```scss
@include border-selected (
    $size: $border-selected-size, 
    $pos: $border-selected-pos, 
    $elem: $border-selected-elem, 
    $radius: $border-selected-border-radius, 
    $color: $border-selected-color
)
```

## Arguments

| Argument  | Value Description |
|-----------|------------------|
| **$size**  | Accepts `px` or `rem` values. Sets the width/height of the border. |
| **$pos**  | Accepts `'left'` or `'bottom'` values. Sets border position inside the element. |
| **$elem**  | Accepts `'before'` (default) and `'after'`. Sets the pseudo-element. |
| **$radius**  | Accepts `px` or `rem` values. Sets border radius. |
| **$color**  | Accepts color variables. Sets border color. |
