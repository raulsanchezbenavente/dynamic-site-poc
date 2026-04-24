import { TestBed } from '@angular/core/testing';
import { SafeHtml } from '@angular/platform-browser';

import { RfFilterType } from './filter.enum';
import { RfOptionsFilter } from './filter.model';
import { RfListOption } from '../../components/rf-list/models/rf-list-option.model';
import { FilterService } from './filter.service';

describe('FilterService', () => {
  let svc: FilterService;

  const opt = (id: string, content: string, extra: Partial<RfListOption> = {}): RfListOption =>
    ({ id, value: id, content: content as unknown as SafeHtml, ...extra } as RfListOption);

  const NORMAL: RfOptionsFilter = { enabled: true, type: RfFilterType.NORMAL };
  const MARKED: RfOptionsFilter = { enabled: true, type: RfFilterType.MARKED };

  let options: RfListOption[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterService],
    });
    svc = TestBed.inject(FilterService);

    options = [
      opt('1', 'Test song'),
      opt('2', 'SONG number 2'),
      opt('3', 'Other thing'),
      opt('4', '<b>Song</b> with <i>HTML</i>'),
      opt('5', 'no match'),
    ];
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  describe('strategy and fallback', () => {
    it('uses NORMAL when filterType is undefined (fallback)', () => {
      const res = svc.filter(undefined as unknown as RfOptionsFilter, options, 'song');
      const ids = res.map(o => o.value);
      expect(ids).toEqual(['1', '2', '4']); // 4 contains "Song" inside the HTML
    });

    it('selects the strategy according to RfOptionsFilter.type', () => {
      const n = svc.filter(NORMAL, options, 'other');
      const m = svc.filter(MARKED, options, 'other');
      expect(n.map(o => o.value)).toEqual(['3']);
      expect(m.map(o => o.value)).toEqual(['3']);
    });
  });

  describe('NORMAL', () => {
    it('filters ignoring case and accents', () => {
      const res = svc.filter(NORMAL, options, '   song   ');
      expect(res.map(o => o.value)).toEqual(['1', '2', '4']);
    });

    it('empty query returns all options', () => {
      const res = svc.filter(NORMAL, options, '');
      expect(res.length).toBe(options.length);
    });
  });

  describe('MARKED', () => {
    it('filters using text without tags and highlights the match within the same chunk', () => {
      const res = svc.filter(MARKED, options, 'song');
      const byId = (id: string) => res.find(o => o.value === id)!;

      // 1: no HTML → highlights the whole word "Song"
      expect((byId('1').content as unknown as string))
        .toContain('<mark class="list-filter-marked">song</mark>');

      // 2: no HTML, uppercase → also highlights the full match
      expect((byId('2').content as unknown as string))
        .toContain('<mark class="list-filter-marked">SONG</mark> number 2');

      // 4: with HTML (<b>Song</b>) → the highlight wraps only the visible text, not tags
      const html4 = byId('4').content as unknown as string;
      expect(html4).toContain('<b><mark class="list-filter-marked">Song</mark></b> with <i>HTML</i>');
      expect(html4).not.toMatch(/<mark[^>]*><[^>]+>/); // does not wrap tags inside <mark>
    });

    it('when the match crosses tags, does not insert <mark> (intentional limitation)', () => {
      // Build an option where the match "program" is split by a tag
      const tricky: RfListOption = opt('X', 'pro<strong>gra</strong>m');
      const res = svc.filter(MARKED, [tricky], 'program');
      const html = res[0].content as unknown as string;

      // The strategy filters by text without tags (there is a match), but the highlight only marks
      // if the match fits in a chunk. Here it crosses tags, so it should not insert <mark>.
      expect(html).not.toContain('<mark');
      expect(html).toContain('<strong>gra</strong>');
    });

    it('empty query returns all options **without highlight**', () => {
      const res = svc.filter(MARKED, options, '   ');
      expect(res.length).toBe(options.length);
      // None should have <mark>
      expect(res.every(o => !(o.content as unknown as string).includes('<mark'))).toBeTrue();
    });

    it('preserves the rest of the RfListOption properties', () => {
      const extra: RfListOption = opt('Z', 'Song Z', { disabled: true, group: 'G1' } as any);
      const res = svc.filter(MARKED, [extra], 'song');
      expect(res[0].value).toBe('Z');
      expect((res[0] as any).disabled).toBeTrue();
      expect((res[0] as any).group).toBe('G1');
    });
  });
});