import { Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalEventsService implements OnDestroy {
  private readonly renderer: Renderer2;
  private readonly unlistenDown?: () => void;
  private readonly unlistenUp?: () => void;
  private readonly unlistenKeydown?: () => void;

  private readonly mousedownSubject = new Subject<MouseEvent>();
  private readonly mouseupSubject = new Subject<MouseEvent>();
  private readonly keydownSubject = new Subject<KeyboardEvent>();

  public readonly mousedown$ = this.mousedownSubject.asObservable();
  public readonly mouseup$ = this.mouseupSubject.asObservable();
  public readonly keydown$ = this.keydownSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    this.unlistenDown = this.renderer.listen('window', 'mousedown', (e: MouseEvent) => {
      this.mousedownSubject.next(e);
    });

    this.unlistenUp = this.renderer.listen('window', 'mouseup', (e: MouseEvent) => {
      this.mouseupSubject.next(e);
    });

    this.unlistenKeydown = this.renderer.listen('window', 'keydown', (e: KeyboardEvent) => {
      this.keydownSubject.next(e);
    });
  }

  public ngOnDestroy(): void {
    this.unlistenDown?.();
    this.unlistenUp?.();
    this.unlistenKeydown?.();
  }
}
