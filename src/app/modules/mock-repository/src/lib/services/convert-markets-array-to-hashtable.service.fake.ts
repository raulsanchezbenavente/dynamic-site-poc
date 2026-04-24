import { DictionaryType, Market } from '@dcx/ui/libs';

export class ConvertMarketsArrayToHashTableServiceFake {
  createHashTable(markets: Market[], keyFnOrigin: (item: Market) => string): DictionaryType<string[]> {
    const hashTable: DictionaryType<string[]> = {};
    if (markets && markets.length > 0) {
      const arrayLength = markets.length;

      for (let i = 0; i < arrayLength; i++) {
        const key = keyFnOrigin(markets[i]);
        if (hashTable[key]) {
          hashTable[key].push(markets[i].destination);
        } else {
          hashTable[key] = [markets[i].destination];
        }
      }
    }

    return hashTable;
  }
}
