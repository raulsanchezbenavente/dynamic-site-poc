import { TestBed } from '@angular/core/testing';
import { IdService } from './id.service';

describe('IdService', () => {
  let svc: IdService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdService],
    });
    svc = TestBed.inject(IdService);
  });

  afterEach(() => {
    // Clean up any Math.random mocks
    (Math.random as any).and?.callThrough?.();
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('generates an 8-character lowercase id [a-z]', () => {
    const id = svc.generateRandomId();
    expect(id.length).toBe(8);
    expect(/^[a-z]{8}$/.test(id)).toBeTrue();
  });

  it('with all random=0 returns "aaaaaaaa"', () => {
    spyOn(Math, 'random').and.returnValue(0);
    const id = svc.generateRandomId();
    expect(id).toBe('aaaaaaaa');
  });

  it('with random ~0.99999 returns "zzzzzzzz" (upper limit)', () => {
    spyOn(Math, 'random').and.returnValue(0.99999);
    const id = svc.generateRandomId();
    expect(id).toBe('zzzzzzzz');
  });

  it('with sequence 0..7 returns "abcdefgh"', () => {
    // floor(i/26 * 26) = i  (for i=0..7)
    spyOn(Math, 'random').and.returnValues(
      0/26, 1/26, 2/26, 3/26, 4/26, 5/26, 6/26, 7/26
    );
    const id = svc.generateRandomId();
    expect(id).toBe('abcdefgh');
  });

  it('two calls with different sequences generate different ids', () => {
    // 1st call -> "aaaaaaaa"
    // 2nd call -> "baaaaaaa"
    spyOn(Math, 'random').and.returnValues(
      // call 1 (8 values)
      0, 0, 0, 0, 0, 0, 0, 0,
      // call 2 (8 values)
      1/26, 0, 0, 0, 0, 0, 0, 0
    );

    const id1 = svc.generateRandomId();
    const id2 = svc.generateRandomId();

    expect(id1).toBe('aaaaaaaa');
    expect(id2).toBe('baaaaaaa');
    expect(id1).not.toBe(id2);
  });

  it('format is always valid [a-z]{8} even if random', () => {
    const id = svc.generateRandomId();
    expect(id).toMatch(/^[a-z]{8}$/);
  });

  // Optional: basic uniqueness test (very low probability of collision)
  it('generates 100 probably unique ids (non-deterministic sanity check)', () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) {
      set.add(svc.generateRandomId());
    }
    expect(set.size).toBe(100);
  });
});