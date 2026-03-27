import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridBuilderComponent } from './grid-builder.component';

describe('GridBuilderComponent', () => {
  let component: GridBuilderComponent;
  let fixture: ComponentFixture<GridBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
