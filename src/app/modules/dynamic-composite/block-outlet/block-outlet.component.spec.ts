import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  BLOCK_COMPONENT_REGISTRY,
  BlockComponentMap,
  BlockOutletComponent,
} from './block-outlet.component';

@Component({
  selector: 'test-mock-block',
  standalone: true,
  template: '<p class="mock">Mock {{ value() }}</p>',
})
class MockBlockComponent {
  public value = input<string>('');
}

describe('BlockOutletComponent', () => {
  let fixture: ComponentFixture<BlockOutletComponent>;
  let component: BlockOutletComponent;
  let componentMap: BlockComponentMap;

  beforeEach(async () => {
    componentMap = {};

    await TestBed.configureTestingModule({
      imports: [BlockOutletComponent],
      providers: [
        {
          provide: BLOCK_COMPONENT_REGISTRY,
          useValue: {
            componentMap,
            loadBlockComponent: (key: string) => Promise.resolve(componentMap[key] ? componentMap[key]() : null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockOutletComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loaded component and forward non-structural inputs', async () => {
    componentMap['__test-block__'] = () => Promise.resolve(MockBlockComponent);

    fixture.componentRef.setInput('block', { component: '__test-block__', span: 6, value: 'hello' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.mock')?.textContent ?? '';
    expect(text).toContain('hello');
  });

  it('should render missing component when loader resolves null', async () => {
    fixture.componentRef.setInput('block', { component: 'missing-key' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Missing component');
    expect(text).toContain('missing-key');
  });
});
