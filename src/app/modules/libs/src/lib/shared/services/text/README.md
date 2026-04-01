# Text Utilities (`TextHelperService`)

This library provides a centralized service for common text transformations used across the application.  
It ensures consistent behavior, avoids re-implementing the same logic in multiple places, and improves maintainability.

## Overview

The `TextHelperService` contains pure, reusable string transformation methods.  
All methods are idempotent and return an empty string (`""`) for `null`, `undefined`, or empty input.

## API Reference

### `getCapitalizeWords(text: string): string`

Capitalizes the first letter of each word and lowercases the rest.

**Example**
```ts
getCapitalizeWords('john DOE');       // "John Doe"
getCapitalizeWords('  john   arias'); // "John Arias"
```


### `getLastWordInitialWithDot(text: string): string`
Returns the initial of the last word, capitalized and followed by a dot.

**Example**
```ts
getLastWordInitialWithDot('John Arias');               // "A."
getLastWordInitialWithDot('  John   Freddy   Arias '); // "A."
```


### `toCamelCase(text: string): string`
Converts text to camelCase. Splits by non-alphanumeric characters and capitalizes each subsequent word.

**Example**
```ts
toCamelCase('hello-world_example text'); // "helloWorldExampleText"
toCamelCase('Order 123 Status OK');      // "order123StatusOk"
```


### `toKebabCase(text: string): string`
Converts text to kebab-case. Splits camel/Pascal boundaries and replaces non-alphanumerics with dashes.

**Example**
```ts
toKebabCase('HelloWorldExample');     // "hello-world-example"
toKebabCase('Hello World Example');   // "hello-world-example"
```

Note:
The current implementation does not collapse multiple dashes or trim leading/trailing dashes.

**Example**
```ts
toKebabCase('Hello--World'); // "hello--world"
```


### `toCapitalCase(text: string): string`
Capitalizes only the first letter of the string and lowercases the rest.

**Example**
```ts
toCapitalCase('hELLO'); // "Hello"
```

## Conventions
- Keep this service focused exclusively on text operations.
- All methods must be idempotent: calling them multiple times should yield the same result.
- Any change to the logic must be accompanied by updated unit tests.

## File Locations
- Service: src/lib/text-helper.service.ts
- Unit Tests: src/lib/text-helper.service.spec.ts

## Running Tests
Run the unit tests for this library:

```bash
npm run test text-utils
```

## Changelog
Last updated: 2025-08-13
