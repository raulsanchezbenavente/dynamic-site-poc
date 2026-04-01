import {
  CLEAN_BOOKING,
  CLEAN_SESSION_DATA,
  CLEAN_PROFILE_STATUS,
  SessionData,
  SessionDataVM,
} from './session.data';

describe('session.data', () => {
  it('should define CLEAN_BOOKING with expected structure', () => {
    expect(CLEAN_BOOKING).toBeDefined();
    expect(CLEAN_BOOKING.journeys).toEqual([]);
    expect(CLEAN_BOOKING.bookingInfo).toBeDefined();
    expect(CLEAN_BOOKING.pricing).toBeDefined();
    expect(CLEAN_BOOKING.contacts).toEqual([]);
    expect(CLEAN_BOOKING.bookingFees).toEqual([]);
    expect(CLEAN_BOOKING.pax).toEqual([]);
    expect(CLEAN_BOOKING.payments).toEqual([]);
    expect(CLEAN_BOOKING.services).toEqual([]);
  });

  it('should define CLEAN_SESSION_DATA with expected structure', () => {
    expect(CLEAN_SESSION_DATA).toBeDefined();
    expect(CLEAN_SESSION_DATA.session).toBeDefined();
    expect(CLEAN_SESSION_DATA.session.booking).toEqual(CLEAN_BOOKING);
    expect(CLEAN_SESSION_DATA.session.culture).toBeDefined();
    expect(CLEAN_SESSION_DATA.session.selectedPassengers).toEqual([]);
    expect(CLEAN_SESSION_DATA.session.originalBooking).toEqual(CLEAN_BOOKING);
  });

  it('should define CLEAN_PROFILE_STATUS with expected structure', () => {
    expect(CLEAN_PROFILE_STATUS).toBeDefined();
    expect(CLEAN_PROFILE_STATUS.accountPassengerSelected).toEqual([]);
    expect(CLEAN_PROFILE_STATUS.accountPassengerList).toEqual([]);
  });

  it('should create SessionData instance', () => {
    const data = new SessionData();
    expect(data).toBeInstanceOf(SessionData);
    expect(data.session).toBeUndefined();
    data.session = {
      booking: CLEAN_BOOKING,
      culture: 'en-US',
      originalBooking: CLEAN_BOOKING,
    };
    expect(data.session.booking).toEqual(CLEAN_BOOKING);
    expect(data.session.culture).toBe('en-US');
  });

  it('should allow setting userAgentResponse', () => {
  const data = new SessionData();
  data.userAgentResponse = {} as any;
  expect(data.userAgentResponse).toBeDefined();
  });
});
