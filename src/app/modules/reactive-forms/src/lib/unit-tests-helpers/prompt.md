You are generating a Jasmine + Angular TestBed spec for an Angular *standalone* component
that extends a Reactive Forms base (RfBaseReactiveComponent). Your goal is to produce tests
that cover the ENTIRE PUBLIC API of the component (public properties/signals/outputs,
public methods, static methods), without touching private details.

OUTPUT REQUIREMENTS
- Output a single, runnable spec file in ENGLISH, named `<ComponentFileName>.public-api.spec.ts`.
- Use this structure/style:
  - Root: `describe('<ComponentClassName> — Public API', () => { ... })`
  - Nested `describe` blocks PER PUBLIC FEATURE (e.g., `writeValue()`, `registerOnChange / registerOnTouched`,
    `maxlength / minLength`, `inputPattern`, `password mode / toggleIconPassword()`, `label & classes`,
    `appearance()`, `errorMessagesShouldBeDisplayed`, `IDs & utilities`, `static showErrorsAccordingDisplayConfig()`).
  - Inside each nested `describe`, use focused `it(...)` cases for concrete behaviors.
- Test names and comments must be in ENGLISH.
- Do NOT include any extra explanation outside the code.

DISCOVERY OF PUBLIC API
- Parse the provided component source and enumerate PUBLIC API elements:
  - Public fields (including Angular 17 signals created via `input()`, `model()`, `output()`, `viewChild()`, etc.).
  - Public getters/setters.
  - Public methods.
  - Public outputs (EventEmitters/signals).
  - Public static methods exposed via the component or its base (if accessible).
- Ignore private/protected members and internal helpers.

TESTBED & HOST SETUP
- Create a minimal standalone `HostComponent` that imports the target component and binds only required inputs.
- Use the component’s actual `selector` from `@Component` metadata in the Host template.
- Let the component create its own RfFormControl internally (standalone-control pattern). Do NOT use Angular FormGroup/FormControl unless strictly required.
- Provide mocks only if the component (or its base) injects them. Common examples:
  ```ts
  import { Subject } from 'rxjs';
  class MockIdService { private i=0; generateRandomId(){ this.i+=1; return `id-${this.i}`; } }
  class MockGlobalMouseService { mousedown$ = new Subject<void>(); mouseup$ = new Subject<void>(); }
  // Prefer real tokens if available:
  // providers: [{provide: IdService, useClass: MockIdService}, {provide: GlobalMouseService, useClass: MockGlobalMouseService}]
