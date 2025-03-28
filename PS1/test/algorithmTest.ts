import * as assert from 'assert';
import { 
  AnswerDifficulty, 
  Flashcard, 
  BucketMap 
} from '../src/flashcards';
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress
} from '../src/algorithm';

describe('Flashcard Learning Algorithm Tests', () => {
  // Helper function to create test flashcards with more flexibility
  function createFlashcard(
    id: number, 
    question?: string, 
    answer?: string, 
    hint?: string, 
    tags?: string[]
  ): Flashcard {
    return new Flashcard(
      question || `Question ${id}`,
      answer || `Answer ${id}`,
      hint || `Hint ${id}`,
      tags || [`tag${id}`, 'common']
    );
  }

  describe('toBucketSets()', () => {
    it('handles an empty map', () => {
      const emptyMap = new Map<number, Set<Flashcard>>();
      const result = toBucketSets(emptyMap);
      assert.strictEqual(result.length, 0);
    });

    it('converts map with consecutive buckets', () => {
      const bucketMap = new Map<number, Set<Flashcard>>();
      const card1 = createFlashcard(1);
      const card2 = createFlashcard(2);
      
      bucketMap.set(0, new Set([card1]));
      bucketMap.set(1, new Set([card2]));
      
      const result = toBucketSets(bucketMap);
      
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0]?.size, 1);
      assert.strictEqual(result[1]?.size, 1);
      assert.ok(result[0]?.has(card1));
      assert.ok(result[1]?.has(card2));
    });

    it('handles map with non-consecutive buckets', () => {
      const bucketMap = new Map<number, Set<Flashcard>>();
      const card1 = createFlashcard(1);
      const card2 = createFlashcard(2);
      
      bucketMap.set(0, new Set([card1]));
      bucketMap.set(3, new Set([card2]));
      
      const result = toBucketSets(bucketMap);
      
      assert.strictEqual(result.length, 4);
      assert.strictEqual(result[0]?.size, 1);
      assert.strictEqual(result[1]?.size, 0);
      assert.strictEqual(result[2]?.size, 0);
      assert.strictEqual(result[3]?.size, 1);
    });
  });

  describe('getBucketRange()', () => {
    it('returns undefined for empty array', () => {
      const buckets: Array<Set<Flashcard>> = [];
      const result = getBucketRange(buckets);
      assert.strictEqual(result, undefined);
    });

    it('returns undefined when all buckets are empty', () => {
      const buckets: Array<Set<Flashcard>> = [
        new Set(), new Set(), new Set()
      ];
      const result = getBucketRange(buckets);
      assert.strictEqual(result, undefined);
    });

    it('handles single non-empty bucket', () => {
      const card = createFlashcard(1);
      const buckets: Array<Set<Flashcard>> = [
        new Set([card]), new Set(), new Set()
      ];
      const result = getBucketRange(buckets);
      assert.deepStrictEqual(result, { minBucket: 0, maxBucket: 0 });
    });
  });

  describe('practice()', () => {
    it('returns empty set for empty buckets', () => {
      const buckets: Array<Set<Flashcard>> = [new Set(), new Set(), new Set()];
      const result = practice(buckets, 0);
      assert.strictEqual(result.size, 0);
    });

    it('includes all cards from bucket 0 on any day', () => {
      const card1 = createFlashcard(1);
      const card2 = createFlashcard(2);
      const buckets: Array<Set<Flashcard>> = [
        new Set([card1, card2]), new Set(), new Set()
      ];
      
      for (let day = 0; day < 5; day++) {
        const result = practice(buckets, day);
        assert.strictEqual(result.size, 2);
        assert.ok(result.has(card1));
        assert.ok(result.has(card2));
      }
    });
  });

  describe('update()', () => {
    it('moves card to bucket 0 when answer is Wrong', () => {
      const card = createFlashcard(1);
      const buckets = new Map<number, Set<Flashcard>>();
      buckets.set(0, new Set());
      buckets.set(2, new Set([card]));
      
      const result = update(buckets, card, AnswerDifficulty.Wrong);
      
      assert.ok(result.get(0)?.has(card));
      assert.ok(!result.get(2)?.has(card));
    });

    it('keeps card in same bucket when answer is Hard', () => {
      const card = createFlashcard(1);
      const buckets = new Map<number, Set<Flashcard>>();
      buckets.set(0, new Set());
      buckets.set(2, new Set([card]));
      
      const result = update(buckets, card, AnswerDifficulty.Hard);
      
      assert.ok(!result.get(0)?.has(card));
      assert.ok(result.get(2)?.has(card));
    });
  });

  describe('getHint()', () => {
    it('returns the card\'s hint property if available', () => {
      const card = new Flashcard("Question", "Answer", "This is a custom hint", ["tag"]);
      const hint = getHint(card);
      assert.strictEqual(hint, "This is a custom hint");
    });

    it('generates a hint for a single word answer', () => {
      const card = new Flashcard("Question", "Answer", "", ["tag"]);
      const hint = getHint(card);
      assert.strictEqual(hint, "A_____");
    });
  });

  describe('computeProgress()', () => {
    it('handles empty buckets and history', () => {
      const buckets = new Map<number, Set<Flashcard>>();
      const history: Array<{
        card: Flashcard;
        timestamp: number;
        difficulty: AnswerDifficulty;
      }> = [];
      
      const progress = computeProgress(buckets, history);
      
      assert.strictEqual(progress.totalCards, 0);
      assert.strictEqual(progress.cardsPerBucket.size, 0);
      assert.strictEqual(progress.averageBucket, 0);
      assert.strictEqual(progress.masteredCards, 0);
      assert.strictEqual(progress.successRate, 0);
    });

    it('calculates correct statistics for cards in low buckets', () => {
      const card1 = createFlashcard(1);
      const card2 = createFlashcard(2);
      
      const buckets = new Map<number, Set<Flashcard>>();
      buckets.set(0, new Set([card1]));
      buckets.set(1, new Set([card2]));
      
      const history = [
        { card: card1, timestamp: 1, difficulty: AnswerDifficulty.Hard },
        { card: card2, timestamp: 2, difficulty: AnswerDifficulty.Easy }
      ];
      
      const progress = computeProgress(buckets, history);
      
      assert.strictEqual(progress.totalCards, 2);
      assert.strictEqual(progress.averageBucket, 0.5);
      assert.strictEqual(progress.masteredCards, 0);
      assert.strictEqual(progress.successRate, 100);
    });
  });
});