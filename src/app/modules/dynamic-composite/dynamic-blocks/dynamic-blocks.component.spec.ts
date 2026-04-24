import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { DynamicBlocksComponent } from './dynamic-blocks.component';

describe('DynamicBlocksComponent', () => {
  let fixture: ComponentFixture<DynamicBlocksComponent>;
  let component: DynamicBlocksComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicBlocksComponent, HttpClientTestingModule],
      providers: [
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj<TranslateService>('TranslateService', [
            'setTranslation',
            'setFallbackLang',
            'use',
          ]),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicBlocksComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one block-outlet per block', () => {
    fixture.componentRef.setInput('blocks', [{ component: 'header' }, { component: 'footer' }]);
    fixture.detectChanges();

    const outlets = fixture.nativeElement.querySelectorAll('block-outlet');
    expect(outlets.length).toBe(2);
  });

  it('should return a stable key priority id > name > fallback', () => {
    expect(component.trackByKey(0, { id: 'b-1', name: 'x', component: 'cmp' })).toBe('b-1');
    expect(component.trackByKey(1, { name: 'hero', component: 'cmp' })).toBe('hero');
    expect(component.trackByKey(2, { component: 'header' })).toBe('header-2');
  });
});
