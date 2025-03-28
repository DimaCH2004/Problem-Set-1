"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const flashcards_1 = require("../src/flashcards");
const algorithm_1 = require("../src/algorithm");
describe('Flashcard Learning Algorithm Tests', () => {
    // Helper function to create test flashcards with more flexibility
    function createFlashcard(id, question, answer, hint, tags) {
        return new flashcards_1.Flashcard(question || `Question ${id}`, answer || `Answer ${id}`, hint || `Hint ${id}`, tags || [`tag${id}`, 'common']);
    }
    describe('toBucketSets()', () => {
        it('handles an empty map', () => {
            const emptyMap = new Map();
            const result = (0, algorithm_1.toBucketSets)(emptyMap);
            assert.strictEqual(result.length, 0);
        });
        it('converts map with consecutive buckets', () => {
            const bucketMap = new Map();
            const card1 = createFlashcard(1);
            const card2 = createFlashcard(2);
            bucketMap.set(0, new Set([card1]));
            bucketMap.set(1, new Set([card2]));
            const result = (0, algorithm_1.toBucketSets)(bucketMap);
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0]?.size, 1);
            assert.strictEqual(result[1]?.size, 1);
            assert.ok(result[0]?.has(card1));
            assert.ok(result[1]?.has(card2));
        });
        it('handles map with non-consecutive buckets', () => {
            const bucketMap = new Map();
            const card1 = createFlashcard(1);
            const card2 = createFlashcard(2);
            bucketMap.set(0, new Set([card1]));
            bucketMap.set(3, new Set([card2]));
            const result = (0, algorithm_1.toBucketSets)(bucketMap);
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0]?.size, 1);
            assert.strictEqual(result[1]?.size, 0);
            assert.strictEqual(result[2]?.size, 0);
            assert.strictEqual(result[3]?.size, 1);
        });
    });
    describe('getBucketRange()', () => {
        it('returns undefined for empty array', () => {
            const buckets = [];
            const result = (0, algorithm_1.getBucketRange)(buckets);
            assert.strictEqual(result, undefined);
        });
        it('returns undefined when all buckets are empty', () => {
            const buckets = [
                new Set(), new Set(), new Set()
            ];
            const result = (0, algorithm_1.getBucketRange)(buckets);
            assert.strictEqual(result, undefined);
        });
        it('handles single non-empty bucket', () => {
            const card = createFlashcard(1);
            const buckets = [
                new Set([card]), new Set(), new Set()
            ];
            const result = (0, algorithm_1.getBucketRange)(buckets);
            assert.deepStrictEqual(result, { minBucket: 0, maxBucket: 0 });
        });
    });
    describe('practice()', () => {
        it('returns empty set for empty buckets', () => {
            const buckets = [new Set(), new Set(), new Set()];
            const result = (0, algorithm_1.practice)(buckets, 0);
            assert.strictEqual(result.size, 0);
        });
        it('includes all cards from bucket 0 on any day', () => {
            const card1 = createFlashcard(1);
            const card2 = createFlashcard(2);
            const buckets = [
                new Set([card1, card2]), new Set(), new Set()
            ];
            for (let day = 0; day < 5; day++) {
                const result = (0, algorithm_1.practice)(buckets, day);
                assert.strictEqual(result.size, 2);
                assert.ok(result.has(card1));
                assert.ok(result.has(card2));
            }
        });
    });
    describe('update()', () => {
        it('moves card to bucket 0 when answer is Wrong', () => {
            const card = createFlashcard(1);
            const buckets = new Map();
            buckets.set(0, new Set());
            buckets.set(2, new Set([card]));
            const result = (0, algorithm_1.update)(buckets, card, flashcards_1.AnswerDifficulty.Wrong);
            assert.ok(result.get(0)?.has(card));
            assert.ok(!result.get(2)?.has(card));
        });
        it('keeps card in same bucket when answer is Hard', () => {
            const card = createFlashcard(1);
            const buckets = new Map();
            buckets.set(0, new Set());
            buckets.set(2, new Set([card]));
            const result = (0, algorithm_1.update)(buckets, card, flashcards_1.AnswerDifficulty.Hard);
            assert.ok(!result.get(0)?.has(card));
            assert.ok(result.get(2)?.has(card));
        });
    });
    describe('getHint()', () => {
        it('returns the card\'s hint property if available', () => {
            const card = new flashcards_1.Flashcard("Question", "Answer", "This is a custom hint", ["tag"]);
            const hint = (0, algorithm_1.getHint)(card);
            assert.strictEqual(hint, "This is a custom hint");
        });
        it('generates a hint for a single word answer', () => {
            const card = new flashcards_1.Flashcard("Question", "Answer", "", ["tag"]);
            const hint = (0, algorithm_1.getHint)(card);
            assert.strictEqual(hint, "A_____");
        });
    });
    describe('computeProgress()', () => {
        it('handles empty buckets and history', () => {
            const buckets = new Map();
            const history = [];
            const progress = (0, algorithm_1.computeProgress)(buckets, history);
            assert.strictEqual(progress.totalCards, 0);
            assert.strictEqual(progress.cardsPerBucket.size, 0);
            assert.strictEqual(progress.averageBucket, 0);
            assert.strictEqual(progress.masteredCards, 0);
            assert.strictEqual(progress.successRate, 0);
        });
        it('calculates correct statistics for cards in low buckets', () => {
            const card1 = createFlashcard(1);
            const card2 = createFlashcard(2);
            const buckets = new Map();
            buckets.set(0, new Set([card1]));
            buckets.set(1, new Set([card2]));
            const history = [
                { card: card1, timestamp: 1, difficulty: flashcards_1.AnswerDifficulty.Hard },
                { card: card2, timestamp: 2, difficulty: flashcards_1.AnswerDifficulty.Easy }
            ];
            const progress = (0, algorithm_1.computeProgress)(buckets, history);
            assert.strictEqual(progress.totalCards, 2);
            assert.strictEqual(progress.averageBucket, 0.5);
            assert.strictEqual(progress.masteredCards, 0);
            assert.strictEqual(progress.successRate, 100);
        });
    });
});
