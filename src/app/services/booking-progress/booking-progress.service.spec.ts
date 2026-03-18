import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { BookingProgressService } from './booking-progress.service';

describe('BookingProgressService', () => {
  let service: BookingProgressService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(BookingProgressService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should allow home initially and block results until home is completed', () => {
    expect(service.canAccess('home')).toBeTrue();
    expect(service.canAccess('results')).toBeFalse();

    service.completeStep('home');

    expect(service.canAccess('results')).toBeTrue();
  });

  it('should persist and reset progress', () => {
    service.completeStep('home');
    service.completeStep('results');

    service.resetProgress();

    expect(service.canAccess('results')).toBeFalse();
    const persisted = localStorage.getItem('BOOKING_PROCESS') ?? '';
    expect(persisted).toContain('"home":false');
    expect(persisted).toContain('"results":false');
  });

  it('initToken should return stored token when present', async () => {
    localStorage.setItem('BOOKING_PROCESS', 'stored-token');
    const fetchSpy = spyOn(globalThis, 'fetch');

    const token = await service.initToken();

    expect(token).toBe('stored-token');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('initToken should request token and store it when missing', async () => {
    const fetchSpy = spyOn(globalThis, 'fetch').and.resolveTo({
      ok: true,
      json: async () => ({ token: 'new-token' }),
    } as Response);

    const token = await service.initToken();

    expect(token).toBe('new-token');
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/start', { method: 'POST' });
    expect(localStorage.getItem('BOOKING_PROCESS')).toBe('new-token');
  });

  it('markBookingProcessAsCompleted should navigate when goTo is provided', async () => {
    localStorage.setItem('BOOKING_PROCESS', 'abc-token');
    const fetchSpy = spyOn(globalThis, 'fetch').and.resolveTo({ ok: true } as Response);

    service.markBookingProcessAsCompleted('results', '/seatmap');
    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/completeStep/results', {
      method: 'POST',
      headers: { Authorization: 'abc-token' },
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/seatmap']);
  });

  it('finishBookingProcess should remove token and navigate home', async () => {
    localStorage.setItem('purchaseToken', 'purchase-1');
    spyOn(globalThis, 'fetch').and.resolveTo({
      json: async () => ({}),
    } as Response);

    service.finishBookingProcess();
    await Promise.resolve();
    await Promise.resolve();

    expect(localStorage.getItem('purchaseToken')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
