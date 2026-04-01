import { DictionaryType } from '@dcx/ui/libs';

import { COMMON_TRANSLATIONS } from './common-translations.fake';

export const FILTERS_TRANSLATIONS: DictionaryType = {
  ...COMMON_TRANSLATIONS,
    'Filters.Filter_Label': 'Mejor precio',
    'Filters.FilterBy_Label': 'Ordenar por:',
    'Filters.ClearFilter_Label': 'Limpiar filtros',
    'Filters.FiltersType.Sort.Option_Country': 'País',
    'FiltersType': '', // folder
    'Filters.NoMatchesFound_Message': '<strong>No se encontraron coincidencias exactas</strong>\nIntente cambiar o eliminar algunos de sus filtros o ajustar su búsqueda.',
    'Filters.Apply_Label': 'Aplicar',
    'Filters.OrderBy_Label': 'Ordenar por:',
    'Filters.FiltersType.Label_Categories': 'Todas las zonas geográficas',
    'Filters.FiltersType.Label_Regions': 'Todas las zonas geográficas',
    'Filters.FiltersType.Sort': '', // folder
    'Filters.FiltersType.Categories': '',
    'Filters.FiltersType.Price': '', // folder
    'Filters.FiltersType.Search': '', // folder
    'Filters.FiltersType.Label_Sort': 'Ordenar',
    'Filters.FiltersType.Search_MinimumCharacters': 'Por favor, introduce mínimo 3 caracteres',
    'Filters.FiltersType.Search_Placeholder': 'Busca ciudades, países y otros destinos',
    'Filters.FiltersType.Price.UpToPrice_Text': 'Hasta {0}',
    'Filters.FiltersType.CategoryCodes': '',
    'Filters.FiltersType.Price.RangePrice_Text': 'Desde {0} hasta {1}',
    'Filters.FiltersType.Sort.Option_LowestPrice': 'Menor precio',
    'Filters.FiltersType.Label_Price': 'Precio',
    'Filters.FiltersType.CategoryCode_COD05': 'Destinos nacionales - Tarifas ida y vuelta',
    'Filters.FiltersType.CategoryCode_COD07': 'Europa',
    'Filters.FiltersType.CategoryCode_COD01': 'Destinos nacionales',
    'Filters.FiltersType.CategoryCode_COD03': 'Oferta tarifa classic -10%',
    'Filters.FiltersType.CategoryCode_COD06': 'Américas',
    'Filters.FiltersType.CategoryCode_COD10': 'Guatemala',
    'Filters.FiltersType.CategoryCode_COD04': 'Destinos nacionales - Tarifas por trayecto',
    'Filters.FiltersType.CategoryCode_COD08': 'Colombia',
    'Filters.FiltersType.CategoryCode_COD02': 'Destinos internacionales ',
    'Filters.FiltersType.CategoryCode_COD09': 'Ecuador'
};
