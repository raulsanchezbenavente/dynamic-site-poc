import { PricingChargeType, PricingProductScopeType, ServiceDto } from '@dcx/ui/api-layer';

export const fakeServices: ServiceDto[] = [
  {
    id: '434142477E7E426167676167657E465245455E304D4A5E30',
    referenceId: 'FREE^0MJ^0',
    info: {
      code: 'CABG',
      type: 'Baggage',
      name: '',
      category: 'includedServices',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 0,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'CABG',
            amount: 0,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 0,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'CABG',
            amount: 0,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '474F4C467E474F4C462045515549504D454E547E4F76657273697A657E432E3044432E462E31335F5354315F535432',
    referenceId: 'C.0DC.F.13_ST1_ST2',
    info: {
      code: 'GOLF',
      type: 'Oversize',
      name: 'GOLF EQUIPMENT',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'GOLF',
            amount: 120,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'GOLF',
            amount: 135.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '534B49457E534B492045515549504D454E547E4F76657273697A657E432E3044442E462E31365F5354315F535432',
    referenceId: 'C.0DD.F.16_ST1_ST2',
    info: {
      code: 'SKIE',
      type: 'Oversize',
      name: 'SKI EQUIPMENT',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SKIE',
            amount: 120,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SKIE',
            amount: 135.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '42494B457E42494359434C457E4F76657273697A657E432E3045432E462E31395F5354315F535432',
    referenceId: 'C.0EC.F.19_ST1_ST2',
    info: {
      code: 'BIKE',
      type: 'Oversize',
      name: 'BICYCLE',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BIKE',
            amount: 135,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BIKE',
            amount: 152.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '534355427E53435542412045515549504D454E547E4F76657273697A657E432E3045452E462E32335F5354315F535432',
    referenceId: 'C.0EE.F.23_ST1_ST2',
    info: {
      code: 'SCUB',
      type: 'Oversize',
      name: 'SCUBA EQUIPMENT',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SCUB',
            amount: 120,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SCUB',
            amount: 135.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '535552467E53555246424F415244205550544F37304C422033324B477E4F76657273697A657E432E3047472E462E32395F5354315F535432',
    referenceId: 'C.0GG.F.29_ST1_ST2',
    info: {
      code: 'SURF',
      type: 'Oversize',
      name: 'SURFBOARD UPTO70LB 32KG',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SURF',
            amount: 120,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 10,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SURF',
            amount: 135.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '564950447E564950204C4F554E47452044415920504153537E427573696E6573734C6F756E67657E452E3041472E462E33385F535431',
    referenceId: 'E.0AG.F.38_ST1',
    info: {
      code: 'VIPD',
      type: 'BusinessLounge',
      name: 'VIP LOUNGE DAY PASS',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'VIPD',
            amount: 40.2,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '504252447E5052494F5249545920424F415244494E477E5072696F726974797E452E3047362E462E34355F5354315F535432',
    referenceId: 'E.0G6.F.45_ST1_ST2',
    info: {
      code: 'PBRD',
      type: 'Priority',
      name: 'PRIORITY BOARDING',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 9,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'PBRD',
            amount: 18,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 9,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'PBRD',
            amount: 20.3,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '424C4E447E424C494E442050415353454E47455220494E464F524D4154494F4E7E5370656369616C417373697374616E63657E424C4E442E36395F5354315F535432',
    referenceId: 'BLND.69_ST1_ST2',
    info: {
      code: 'BLND',
      type: 'SpecialAssistance',
      name: 'BLIND PASSENGER INFORMATION',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BLND',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BLND',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '444541467E444541462050415353454E47455220494E464F524D4154494F4E7E5370656369616C417373697374616E63657E444541462E37385F5354315F535432',
    referenceId: 'DEAF.78_ST1_ST2',
    info: {
      code: 'DEAF',
      type: 'SpecialAssistance',
      name: 'DEAF PASSENGER INFORMATION',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'DEAF',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'DEAF',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '44504E417E44495341424C45442050415353454E474552204E454544494E4720415353495354414E43457E5370656369616C417373697374616E63657E44504E412E39365F5354315F535432',
    referenceId: 'DPNA.96_ST1_ST2',
    info: {
      code: 'DPNA',
      type: 'SpecialAssistance',
      name: 'DISABLED PASSENGER NEEDING ASSISTANCE',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'DPNA',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'DPNA',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '5356414E7E50415353454E4745522057495448205345525649434520414E494D414C20494E20434142494E7E5370656369616C417373697374616E63657E5356414E2E3131375F5354315F535432',
    referenceId: 'SVAN.117_ST1_ST2',
    info: {
      code: 'SVAN',
      type: 'SpecialAssistance',
      name: 'PASSENGER WITH SERVICE ANIMAL IN CABIN',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SVAN',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'SVAN',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '574348437E574845454C434841495220544F205345415420524551554553547E5370656369616C417373697374616E63657E574348432E3132395F5354315F535432',
    referenceId: 'WCHC.129_ST1_ST2',
    info: {
      code: 'WCHC',
      type: 'SpecialAssistance',
      name: 'WHEELCHAIR TO SEAT REQUEST',
      category: 'weelchair',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCHC',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCHC',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '574348527E574845454C434841495220544F20414952435241465420444F4F5220524551554553547E5370656369616C417373697374616E63657E574348522E3133325F5354315F535432',
    referenceId: 'WCHR.132_ST1_ST2',
    info: {
      code: 'WCHR',
      type: 'SpecialAssistance',
      name: 'WHEELCHAIR TO AIRCRAFT DOOR REQUEST',
      category: 'weelchair',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCHR',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCHR',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '57434D507E574845454C4348414952204D414E55414C20504F574552454420524551554553547E5370656369616C417373697374616E63657E57434D502E3134315F5354315F535432',
    referenceId: 'WCMP.141_ST1_ST2',
    info: {
      code: 'WCMP',
      type: 'SpecialAssistance',
      name: 'WHEELCHAIR MANUAL POWERED REQUEST',
      category: 'weelchair',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey: '424F477E4D41447E3034367E41567E323032352D30362D30367E353335343331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCMP',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey: '4D41447E424F477E3034377E41567E323032352D30362D30397E353335343332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'WCMP',
            amount: 0,
            currency: '',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxSegment' as PricingProductScopeType,
  },
  {
    id: '415353547E54524156454C204153495354414E43457E4D65646963616C496E737572616E63657E452E3042592E462E34385F5354315F535432',
    referenceId: 'E.0BY.F.48_ST1_ST2',
    info: {
      code: 'ASST',
      type: 'MedicalInsurance',
      name: 'TRAVEL ASISTANCE',
      category: 'default',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 1,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'ASST',
            amount: 35,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
  {
    id: '424147477E324E4420434845434B4544204241472032334B4720313538204C434D7E426167676167657E432E3043442E462E315F5354315F535432',
    referenceId: 'C.0CD.F.1_ST1_ST2',
    info: {
      code: 'BAGG',
      type: 'Baggage',
      name: '2ND CHECKED BAG 23KG 158 LCM',
      category: 'baggage',
      ordinalNumber: 0,
    },
    availability: [
      {
        sellKey:
          '343234463437374534443431343437453330333433363745343135363745333233303332333532443330333632443330333637453335333333353334333333317E3331',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 6,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BBAG~2~424147477E324E4420434845434B4544204241472032334B4720313538204C434D7E426167676167657E432E3043442E462E315F5354315F535432~1~1',
            amount: 120,
            currency: 'USD',
          },
          {
            type: 'Service' as PricingChargeType,
            code: 'CBAG~6~434241477E33524420434845434B4544204241472032334B4720313538204C434D7E426167676167657E432E3043452E462E345F5354315F535432~1~4',
            amount: 155,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
      {
        sellKey:
          '344434313434374534323446343737453330333433373745343135363745333233303332333532443330333632443330333937453335333333353334333333327E3332',
        isInventoried: false,
        availableUnits: 999,
        limitPerPax: 6,
        paxId: '4574727277747E57747272777477777E313939342D30312D30317E353035343332',
        charges: [
          {
            type: 'Service' as PricingChargeType,
            code: 'BBAG~2~424147477E324E4420434845434B4544204241472032334B4720313538204C434D7E426167676167657E432E3043442E462E315F5354315F535432~1~1',
            amount: 130,
            currency: 'USD',
          },
          {
            type: 'Service' as PricingChargeType,
            code: 'CBAG~6~434241477E33524420434845434B4544204241472032334B4720313538204C434D7E426167676167657E432E3043452E462E345F5354315F535432~1~4',
            amount: 169.6,
            currency: 'USD',
          },
        ],
        expirationDate: new Date(),
      },
    ],
    sellType: 'PerPaxJourney' as PricingProductScopeType,
  },
];
