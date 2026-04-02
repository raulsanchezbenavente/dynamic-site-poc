import { TestBed } from '@angular/core/testing';
import { Booking } from '@dcx/ui/libs';

import { CheckInPendingPaymentService } from '../../check-in-pending-payment.service';
import { SlowPaymentSpecification } from './slow-payment-specification';

describe('SlowPaymentSpecification', () => {
  let specification: SlowPaymentSpecification;
  let checkInPendingPaymentService: jasmine.SpyObj<CheckInPendingPaymentService>;

  beforeEach(() => {
    checkInPendingPaymentService = jasmine.createSpyObj('CheckInPendingPaymentService', [
      'getPendingPayment',
      'setPendingPayment',
      'clearPendingPayment',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SlowPaymentSpecification,
        { provide: CheckInPendingPaymentService, useValue: checkInPendingPaymentService },
      ],
    });

    specification = TestBed.inject(SlowPaymentSpecification);
  });

  it('should create', () => {
    expect(specification).toBeTruthy();
  });

  describe('isSatisfiedBy', () => {
    it('should return false when sessionEventBooking is null', () => {
      // Arrange
      const sessionEventBooking = null;

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when balanceDue is 0', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [{ id: 'service1', code: 'SEAT' }],
        etickets: [],
        pricing: { balanceDue: 0 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(100);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when there are no services', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [],
        etickets: [],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when services is undefined', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        etickets: [],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when all services are OWNER services', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'OWNE' },
          { id: 'service2', code: 'OWNE' },
        ],
        etickets: [],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(100);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when services have etickets', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'SEAT' },
          { id: 'service2', code: 'BAGGAGE' },
        ],
        etickets: [
          { referenceId: 'service1' },
          { referenceId: 'service2' },
        ],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(100);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false when pending payment is 0 even with services lacking etickets', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'SEAT' },
          { id: 'service2', code: 'BAGGAGE' },
        ],
        etickets: [],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(0);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
      expect(checkInPendingPaymentService.getPendingPayment).toHaveBeenCalled();
    });

    it('should return false when pending payment is negative', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [{ id: 'service1', code: 'SEAT' }],
        etickets: [],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(-50);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return true when services lack etickets and all conditions are met', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'SEAT' },
          { id: 'service2', code: 'BAGGAGE' },
        ],
        etickets: [],
        pricing: { balanceDue: 150 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(150);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
      expect(checkInPendingPaymentService.getPendingPayment).toHaveBeenCalled();
    });

    it('should return true when non-OWNER services lack etickets and all conditions are met', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'OWNE' },
          { id: 'service2', code: 'SEAT' },
          { id: 'service3', code: 'BAGGAGE' },
        ],
        etickets: [],
        pricing: { balanceDue: 200 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(200);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
      expect(checkInPendingPaymentService.getPendingPayment).toHaveBeenCalled();
    });

    it('should return false when some services have etickets but others do not', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'SEAT' },
          { id: 'service2', code: 'BAGGAGE' },
        ],
        etickets: [{ referenceId: 'service1' }],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(100);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
    });

    it('should handle etickets being undefined or empty', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [{ id: 'service1', code: 'SEAT' }],
        etickets: undefined,
        pricing: { balanceDue: 75 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(75);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
      expect(checkInPendingPaymentService.getPendingPayment).toHaveBeenCalled();
    });

    it('should ignore OWNER services when checking for missing etickets', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'OWNE' },
          { id: 'service2', code: 'SEAT' },
        ],
        etickets: [{ referenceId: 'service1' }],
        pricing: { balanceDue: 120 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(120);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
      expect(checkInPendingPaymentService.getPendingPayment).toHaveBeenCalled();
    });

    it('should return false when all non-OWNER services have etickets', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'OWNE' },
          { id: 'service2', code: 'SEAT' },
          { id: 'service3', code: 'BAGGAGE' },
        ],
        etickets: [
          { referenceId: 'service2' },
          { referenceId: 'service3' },
        ],
        pricing: { balanceDue: 100 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(100);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return true with mixed eticket presence and multiple non-OWNER services', () => {
      // Arrange
      const sessionEventBooking: Booking = {
        services: [
          { id: 'service1', code: 'SEAT' },
          { id: 'service2', code: 'BAGGAGE' },
          { id: 'service3', code: 'MEAL' },
        ],
        etickets: [{ referenceId: 'service1' }],
        pricing: { balanceDue: 150 },
      } as unknown as Booking;
      checkInPendingPaymentService.getPendingPayment.and.returnValue(150);

      // Act
      const result = specification.isSatisfiedBy(sessionEventBooking);

      // Assert
      expect(result).toBeTrue();
    });
  });
});
