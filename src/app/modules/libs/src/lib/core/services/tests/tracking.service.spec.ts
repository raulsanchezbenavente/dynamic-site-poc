import { TestBed } from '@angular/core/testing';
import { TrackingService } from '../tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrackingService],
    });
    service = TestBed.inject(TrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error when setDataLayer is called', () => {
    expect(() => service.setDataLayer({}, {})).toThrowError('Method not implemented.');
  });
});
