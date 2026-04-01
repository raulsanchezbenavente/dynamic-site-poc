import { TestBed } from '@angular/core/testing';
import { RedirectionService } from '../redirection.service';
import { IbeEventRedirectType } from '../../models/ibe-event-redirect-type';

describe('RedirectionService', () => {
  let service: RedirectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedirectionService],
    });

    service = TestBed.inject(RedirectionService);
  });

  it('should redirect with internalRedirect type and target using window.open', () => {
    const openSpy = spyOn(window, 'open');

    const expectedUrl =
      window.location.protocol + '//' + window.location.host + '/test';

    service.redirect(IbeEventRedirectType.internalRedirect, '/test', '_blank');

    expect(openSpy).toHaveBeenCalledWith(expectedUrl, '_blank', 'noreferrer');
  });

  it('should redirect with non-internal type and target using window.open', () => {
    const openSpy = spyOn(window, 'open');
    const url = 'https://example.com/path';
    service.redirect(IbeEventRedirectType.externalRedirect, url, '_self');

    expect(openSpy).toHaveBeenCalledWith(url, '_self', 'noreferrer');
  });
});
