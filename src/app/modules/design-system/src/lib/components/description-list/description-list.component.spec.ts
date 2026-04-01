import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionListComponent } from './description-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  SessionData,
  SessionStore,
} from '@dcx/ui/libs';
import { DescriptionListOptionType } from './enums/description-list-option-type.enum';
import { DescriptionListLayoutType } from './enums/description-list-layout-type.enum';
import { DescriptionList } from './models/description-list.config';

describe('DescriptionListComponent', () => {
  const sessionData: SessionData = {
    session: {
      booking: {
        bookingInfo: {
          recordLocator: '',
          createdDate: '',
          status: '',
          comments: [],
          queues: [],
          pointOfSale: {
            agent: {
              id: '',
            },
            organization: {
              id: '',
            },
          },
        },
        pax: [],
        journeys: [],
        payments: [],
        contacts: [],
        pricing: {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: '',
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxSegment: [],
            perSegment: [],
            perPaxJourney: [],
          },
        },
        services: [],
      },
      culture: 'en-US',
      originalBooking: {
        bookingInfo: {
          recordLocator: '',
          createdDate: '',
          status: '',
          comments: [],
          queues: [],
          pointOfSale: {
            agent: {
              id: '',
            },
            organization: {
              id: '',
            },
          },
        },
        pax: [],
        journeys: [],
        payments: [],
        contacts: [],
        pricing: {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: '',
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxSegment: [],
            perSegment: [],
            perPaxJourney: [],
          },
        },
        services: [],
      },
      accountProfileStatus: {
        accountPassengerList: [],
        accountPassengerSelected: [],
      },
    },
  };
  const mockdescriptionList = {
    accessibilityConfig: { id: 'xxx' },
    options: [
      {
        term: 'pago',
        type: DescriptionListOptionType.DATE,
        description: {
          date: {
            day: true,
            dayPattern: '03',
            week: true,
            weekPattern: '03',
            month: true,
            monthPattern: '03',
            year: true,
            yearPattern: '03',
          },
          dateValue: new Date(),
        },
      },
    ],
  };

  let component: DescriptionListComponent;
  let fixture: ComponentFixture<DescriptionListComponent>;
  let mockSessionStore: jasmine.SpyObj<SessionStore>;

  beforeEach(() => {
    mockSessionStore = jasmine.createSpyObj('mockSessionStore', [
      'getSession',
      'setSessionData',
      'loadInitSession',
      'sessionData$',
    ]);

    mockSessionStore.getSession.and.returnValue(sessionData);
    TestBed.configureTestingModule({
      imports: [DescriptionListComponent],
      providers: [
        { provide: SessionStore, useValue: mockSessionStore },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(DescriptionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shortDateFormat should be defined when descriptionListDetails has data', () => {
    component.config = mockdescriptionList;
    component.ngOnInit();

    expect(component.shortDateFormat).toBeDefined();
  });

  describe('setLayout method', () => {
    it('should set the default layout if no layout is present', () => {
      component.config = { layout: null } as unknown as DescriptionList;
      // @ts-expect-error: Unreachable code erro
      component.setLayout();

      expect(component.config.layout).toBe(DescriptionListLayoutType.DEFAULT);
    });

    it('should maintain the existing layout if already set', () => {
      const existingLayout = DescriptionListLayoutType.COLUMN;
      component.config = { layout: existingLayout } as DescriptionList;
      // @ts-expect-error: Unreachable code erro
      component.setLayout();

      expect(component.config.layout).toBe(existingLayout);
    });
  });
});
