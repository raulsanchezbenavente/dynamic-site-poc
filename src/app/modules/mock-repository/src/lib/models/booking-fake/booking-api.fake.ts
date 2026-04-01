/* eslint-disable */
import { Booking as ApiBooking } from '@dcx/ui/api-layer';

// Fully static ApiBooking mock identical in values to BOOKING_FAKE but shaped as API-layer DTOs.





export const OTHER_API_BOOKING: ApiBooking = {
    "id": "4345514D38377E323032352D30392D3034",
    "journeys": [
        {
            "origin": "BOG",
            "originTerminal": "1",
            "originCountry": "CO",
            "destination": "CTG",
            "destinationCountry": "CO",
            "std": "2025-09-05T17:46:00",
            "stdutc": "2025-09-05T22:46:00",
            "sta": "2025-09-05T19:13:00",
            "stautc": "2025-09-06T00:13:00",
            "duration": "01:27:00",
            "referenceId": "1DA3A1C727872363F9B97B92C56D2E5ECBE21DD11757187281",
            "segments": [
                {
                    "id": "424F477E4354477E393535327E41567E323032352D30392D3035",
                    "referenceId": "AV-9552-20250905",
                    "segmentStatus": 1,
                    "origin": "BOG",
                    "originTerminal": "1",
                    "originCountry": "CO",
                    "destination": "CTG",
                    "destinationCountry": "CO",
                    "std": "2025-09-05T17:46:00",
                    "stdutc": "2025-09-05T22:46:00",
                    "sta": "2025-09-05T19:13:00",
                    "stautc": "2025-09-06T00:13:00",
                    "etd": "0001-01-01T00:00:00",
                    "eta": "0001-01-01T00:00:00",
                    "etdutc": "0001-01-01T00:00:00",
                    "etautc": "0001-01-01T00:00:00",
                    "duration": "01:27:00",
                    "legs": [
                        {
                            "origin": "BOG",
                            "destination": "CTG",
                            "originTerminal": "1",
                            "destinationTerminal": "",
                            "originCountry": "CO",
                            "destinationCountry": "CO",
                            "std": "2025-09-05T17:46:00",
                            "stdutc": "2025-09-05T22:46:00",
                            "sta": "2025-09-05T19:13:00",
                            "stautc": "2025-09-06T00:13:00",
                            "duration": "01:27:00",
                            "legInfo": {
                                "isSubjectedToGovernmentApproval": false
                            }
                        }
                    ],
                    "transport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A319",
                        "number": "9552",
                        "aircraftConfigurationVersion": ""
                    },
                    "status": "NotAllowed",
                    "operatingTransport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A319",
                        "number": "9552",
                        "aircraftConfigurationVersion": ""
                    }
                }
            ],
            "fares": [],
            "status": "Confirmed",
            "hasDisruptions": false,
            "disruptionItems": [],
            "openingCheckInDate": "2025-09-03T22:46:00",
            "closingCheckInDate": "2025-09-05T22:01:00",
            "id": "34323446343737453433353434373745333933353335333237453431353637453332333033323335324433303339324433303335"
        },
        {
            "origin": "CTG",
            "originCountry": "CO",
            "destination": "BOG",
            "destinationTerminal": "1",
            "destinationCountry": "CO",
            "std": "2025-09-06T06:55:00",
            "stdutc": "2025-09-06T11:55:00",
            "sta": "2025-09-06T09:52:00",
            "stautc": "2025-09-06T14:52:00",
            "duration": "02:57:00",
            "referenceId": "8B1BACBBC9634401671BD21D1549255D658DC1271757187281",
            "segments": [
                {
                    "id": "4354477E4D44457E393337337E41567E323032352D30392D3036",
                    "referenceId": "AV-9373-20250906",
                    "segmentStatus": 1,
                    "origin": "CTG",
                    "originCountry": "CO",
                    "destination": "MDE",
                    "destinationCountry": "CO",
                    "std": "2025-09-06T06:55:00",
                    "stdutc": "2025-09-06T11:55:00",
                    "sta": "2025-09-06T08:08:00",
                    "stautc": "2025-09-06T13:08:00",
                    "etd": "0001-01-01T00:00:00",
                    "eta": "0001-01-01T00:00:00",
                    "etdutc": "0001-01-01T00:00:00",
                    "etautc": "0001-01-01T00:00:00",
                    "duration": "01:13:00",
                    "legs": [
                        {
                            "origin": "CTG",
                            "destination": "MDE",
                            "originTerminal": "",
                            "destinationTerminal": "",
                            "originCountry": "CO",
                            "destinationCountry": "CO",
                            "std": "2025-09-06T06:55:00",
                            "stdutc": "2025-09-06T11:55:00",
                            "sta": "2025-09-06T08:08:00",
                            "stautc": "2025-09-06T13:08:00",
                            "duration": "01:13:00",
                            "legInfo": {
                                "isSubjectedToGovernmentApproval": false
                            }
                        }
                    ],
                    "transport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A320",
                        "number": "9373",
                        "aircraftConfigurationVersion": ""
                    },
                    "status": "NotAllowed",
                    "operatingTransport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A320",
                        "number": "9373",
                        "aircraftConfigurationVersion": ""
                    }
                },
                {
                    "id": "4D44457E424F477E393330337E41567E323032352D30392D3036",
                    "referenceId": "AV-9303-20250906",
                    "segmentStatus": 1,
                    "origin": "MDE",
                    "originCountry": "CO",
                    "destination": "BOG",
                    "destinationTerminal": "1",
                    "destinationCountry": "CO",
                    "std": "2025-09-06T08:53:00",
                    "stdutc": "2025-09-06T13:53:00",
                    "sta": "2025-09-06T09:52:00",
                    "stautc": "2025-09-06T14:52:00",
                    "etd": "0001-01-01T00:00:00",
                    "eta": "0001-01-01T00:00:00",
                    "etdutc": "0001-01-01T00:00:00",
                    "etautc": "0001-01-01T00:00:00",
                    "duration": "00:59:00",
                    "legs": [
                        {
                            "origin": "MDE",
                            "destination": "BOG",
                            "originTerminal": "",
                            "destinationTerminal": "1",
                            "originCountry": "CO",
                            "destinationCountry": "CO",
                            "std": "2025-09-06T08:53:00",
                            "stdutc": "2025-09-06T13:53:00",
                            "sta": "2025-09-06T09:52:00",
                            "stautc": "2025-09-06T14:52:00",
                            "duration": "00:59:00",
                            "legInfo": {
                                "isSubjectedToGovernmentApproval": false
                            }
                        }
                    ],
                    "transport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A320",
                        "number": "9303",
                        "aircraftConfigurationVersion": ""
                    },
                    "status": "NotAllowed",
                    "operatingTransport": {
                        "carrier": {
                            "code": "AV",
                            "name": "AVIANCA",
                            "operatingAirlineCode": "AV"
                        },
                        "type": "Plane",
                        "model": "AIRBUS A320",
                        "number": "9303",
                        "aircraftConfigurationVersion": ""
                    }
                }
            ],
            "fares": [],
            "status": "Confirmed",
            "hasDisruptions": false,
            "disruptionItems": [],
            "openingCheckInDate": "2025-09-04T11:55:00",
            "closingCheckInDate": "2025-09-06T11:10:00",
            "id": "343335343437374534443434343537453339333333373333374534313536374533323330333233353244333033393244333033367E34443434343537453432344634373745333933333330333337453431353637453332333033323335324433303339324433303336"
        }
    ],
    "pax": [
        {
            "type": {
                "category": "Teenager",
                "code": "TNG"
            },
            "loyaltyNumbers": [],
            "segmentsInfo": [
                {
                    "segmentId": "424F477E4354477E393535327E41567E323032352D30392D3035",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4354477E4D44457E393337337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4D44457E424F477E393330337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                }
            ],
            "referenceId": "510EE54400053B20",
            "isBookingOwner": false,
            "status": "Confirmed",
            "differentialId": "1",
            "id": "44414E49454C417E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233307E31",
            "name": {
                "title": "Default",
                "first": "DANIELA",
                "last": "CARDONA"
            },
            "documents": [],
            "personInfo": {
                "gender": "Female",
                "weight": "Unknown",
                "dateOfBirth": "2011-06-27"
            },
            "channels": []
        },
        {
            "type": {
                "category": "Adult",
                "code": "ADT"
            },
            "loyaltyNumbers": [],
            "segmentsInfo": [
                {
                    "segmentId": "424F477E4354477E393535327E41567E323032352D30392D3035",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4354477E4D44457E393337337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4D44457E424F477E393330337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                }
            ],
            "referenceId": "510EE54400053B21",
            "isBookingOwner": false,
            "status": "Confirmed",
            "differentialId": "2",
            "id": "4249524D414E7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233317E32",
            "name": {
                "title": "Default",
                "first": "BIRMAN",
                "last": "CARDONA"
            },
            "documents": [],
            "personInfo": {
                "gender": "Male",
                "weight": "Unknown",
                "dateOfBirth": "1989-09-21"
            },
            "channels": []
        },
        {
            "type": {
                "category": "Child",
                "code": "CHD"
            },
            "loyaltyNumbers": [],
            "segmentsInfo": [
                {
                    "segmentId": "424F477E4354477E393535327E41567E323032352D30392D3035",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4354477E4D44457E393337337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                },
                {
                    "segmentId": "4D44457E424F477E393330337E41567E323032352D30392D3036",
                    "status": "NotCheckedIn",
                    "seat": "",
                    "boardingSequence": "",
                    "extraSeats": [],
                    "boardingZone": "",
                    "reasonsStatus": [
                        "ticketProblem"
                    ]
                }
            ],
            "referenceId": "510EE54400053B22",
            "isBookingOwner": false,
            "status": "Confirmed",
            "differentialId": "3",
            "id": "414C454A414E44524F7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233327E33",
            "name": {
                "title": "Default",
                "first": "ALEJANDRO",
                "last": "CARDONA"
            },
            "documents": [],
            "personInfo": {
                "gender": "Female",
                "weight": "Unknown",
                "dateOfBirth": "2015-09-14"
            },
            "channels": []
        }
    ],
    "contacts": [
        {
            "type": "Booking",
            "mktOption": false,
            "id": "7E7E426F6F6B696E677E4249524D414E2E434152444F4E4140464C59524C4142532E434F4D",
            "refuseContact": false,
            "name": {
                "title": "Default",
                "first": "",
                "middle": "",
                "last": ""
            },
            "documents": [],
            "channels": [
                {
                    "type": "Email",
                    "scope": 3,
                    "info": "BIRMAN.CARDONA@FLYRLABS.COM",
                    "prefix": "",
                    "cultureCode": "",
                    "additionalData": "notification"
                },
                {
                    "type": "Phone",
                    "scope": 1,
                    "info": "3112136589",
                    "prefix": "+358",
                    "cultureCode": "",
                    "additionalData": "standard"
                }
            ]
        }
    ],
    "payments": [],
    "services": [
        {
            "id": "434142477E426167676167657E33343332333434363334333733373435333433333335333433343337333734353333333933333335333333353333333233373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333357E343434313445343934353443343137453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333330374533317E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "34323446343737453433353434373745333933353335333237453431353637453332333033323335324433303339324433303335",
            "paxId": "44414E49454C417E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233307E31",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        },
        {
            "id": "434142477E426167676167657E33343332333434363334333733373435333433333335333433343337333734353333333933333335333333353333333233373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333357E34323439353234443431344537453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333331374533327E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "34323446343737453433353434373745333933353335333237453431353637453332333033323335324433303339324433303335",
            "paxId": "4249524D414E7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233317E32",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        },
        {
            "id": "434142477E426167676167657E33343332333434363334333733373435333433333335333433343337333734353333333933333335333333353333333233373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333357E34313443343534413431344534343532344637453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333332374533337E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "34323446343737453433353434373745333933353335333237453431353637453332333033323335324433303339324433303335",
            "paxId": "414C454A414E44524F7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233327E33",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        },
        {
            "id": "434142477E426167676167657E3334333333353334333433373337343533343434333433343334333533373435333333393333333333333337333333333337343533343331333533363337343533333332333333303333333233333335333234343333333033333339333234343333333033333336374533343434333433343334333533373435333433323334343633343337333734353333333933333333333333303333333333373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333367E343434313445343934353443343137453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333330374533317E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "343335343437374534443434343537453339333333373333374534313536374533323330333233353244333033393244333033367E34443434343537453432344634373745333933333330333337453431353637453332333033323335324433303339324433303336",
            "paxId": "44414E49454C417E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233307E31",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        },
        {
            "id": "434142477E426167676167657E3334333333353334333433373337343533343434333433343334333533373435333333393333333333333337333333333337343533343331333533363337343533333332333333303333333233333335333234343333333033333339333234343333333033333336374533343434333433343334333533373435333433323334343633343337333734353333333933333333333333303333333333373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333367E34323439353234443431344537453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333331374533327E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "343335343437374534443434343537453339333333373333374534313536374533323330333233353244333033393244333033367E34443434343537453432344634373745333933333330333337453431353637453332333033323335324433303339324433303336",
            "paxId": "4249524D414E7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233317E32",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        },
        {
            "id": "434142477E426167676167657E3334333333353334333433373337343533343434333433343334333533373435333333393333333333333337333333333337343533343331333533363337343533333332333333303333333233333335333234343333333033333339333234343333333033333336374533343434333433343334333533373435333433323334343633343337333734353333333933333333333333303333333333373435333433313335333633373435333333323333333033333332333333353332343433333330333333393332343433333330333333367E34313443343534413431344534343532344637453433343135323434344634453431374533333335333333313333333033343335333433353333333533333334333333343333333033333330333333303333333533333333333433323333333233333332374533337E434142477E",
            "referenceId": "CABG",
            "code": "CABG",
            "sellKey": "343335343437374534443434343537453339333333373333374534313536374533323330333233353244333033393244333033367E34443434343537453432344634373745333933333330333337453431353637453332333033323335324433303339324433303336",
            "paxId": "414C454A414E44524F7E434152444F4E417E33353331333034353435333533343334333033303330333533333432333233327E33",
            "status": "Confirmed",
            "changeStrategy": "Fixed",
            "type": "Baggage",
            "scope": "PerPaxJourney",
            "note": null,
            "category": "CABG",
            "source": "FR",
            "isChecked": false,
            "differentialId": null,
            "expirationDate": "0001-01-01T00:00:00",
            "included": null,
            "restrictions": null
        }
    ],
    "bookingInfo": {
        "referenceId": "",
        "recordLocator": "CEQM87",
        "comments": [],
        "queues": [],
        "status": "Confirmed",
        "createdDate": "2025-09-04T19:34:41.8259238+00:00",
        "pointOfSale": {
            "agent": {
                "id": "NYCAV08CH"
            },
            "organization": {
                "id": ""
            },
            "channelType": 0,
            "posCode": "CO"
        },
        "tripType": "RT"
    },
    "pricing": {
        "totalAmount": 0.0,
        "balanceDue": 0.0,
        "isBalanced": true,
        "currency": "EUR",
        "breakdown": {}
    },
    "bundles": [],
    "etickets": [],
    "hasDisruptions": false
} as any;




export const BOOKING_API_FAKE: ApiBooking = OTHER_API_BOOKING;
