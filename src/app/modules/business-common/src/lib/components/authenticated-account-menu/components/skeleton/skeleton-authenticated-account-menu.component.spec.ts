import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonAuthenticatedAccountMenuComponent } from './skeleton-authenticated-account-menu.component';
import { EnumAppearenceSkeleton } from '@dcx/ui/libs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SkeletonAuthenticatedAccountMenuComponent', () => {
  let component: SkeletonAuthenticatedAccountMenuComponent;
  let fixture: ComponentFixture<SkeletonAuthenticatedAccountMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonAuthenticatedAccountMenuComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonAuthenticatedAccountMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have skeletonConfig defined', () => {
    expect(component['skeletonConfig']).toBeDefined();
  });

  it('should initialize skeletonConfig with CUSTOM_CONTENT appearance', () => {
    expect(component['skeletonConfig'].appearance).toBe(EnumAppearenceSkeleton.CUSTOM_CONTENT);
  });

  it('should have the correct appearance type', () => {
    const config = component['skeletonConfig'];
    expect(config.appearance).toEqual(EnumAppearenceSkeleton.CUSTOM_CONTENT);
  });
});
