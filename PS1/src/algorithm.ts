import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  if (!buckets || buckets.size === 0) {
    return [];
  }

  const maxBucketIndex = Math.max(...Array.from(buckets.keys()));

  return Array.from({ length: maxBucketIndex + 1 }, (_, index) => {
    const bucketCards = buckets.get(index);
    return bucketCards ? new Set(bucketCards) : new Set();
  });
}

/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 */
export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  // Use reducer to find min and max buckets with non-empty sets
  const validBuckets = buckets.reduce((acc, set, index) => {
    if (set && set.size > 0) {
      acc.push(index);
    }
    return acc;
  }, [] as number[]);

  // Return undefined if no non-empty buckets
  if (validBuckets.length === 0) {
    return undefined;
  }

  return {
    minBucket: Math.min(...validBuckets),
    maxBucket: Math.max(...validBuckets)
  };
}

/**
 * Selects cards to practice on a particular day.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  const practiceBuckets = new Set<Flashcard>();

  // Always include bucket 0
  if (buckets[0]) {
    buckets[0].forEach(card => practiceBuckets.add(card));
  }

  // Iterate through other buckets based on divisibility
  buckets.forEach((bucket, index) => {
    if (index > 0 && bucket && bucket.size > 0 && day % index === 0) {
      bucket.forEach(card => practiceBuckets.add(card));
    }
  });

  return practiceBuckets;
}

/**
 * Updates a card's bucket number after a practice trial.
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  // Create a deep copy of the buckets map
  const updatedBuckets = new Map(
    Array.from(buckets.entries()).map(
      ([bucket, cards]) => [bucket, new Set(cards)]
    )
  );

  // Find and remove the card from its current bucket
  let currentBucket: number | null = null;
  for (const [bucket, cards] of updatedBuckets.entries()) {
    if (cards.has(card)) {
      currentBucket = bucket;
      cards.delete(card);
      break;
    }
  }

  // If card not found, start at bucket 0
  if (currentBucket === null) {
    currentBucket = 0;
  }

  // Determine new bucket based on difficulty
  let newBucket: number;
  switch (difficulty) {
    case AnswerDifficulty.Wrong:
      newBucket = 0;
      break;
    case AnswerDifficulty.Hard:
      newBucket = currentBucket;
      break;
    case AnswerDifficulty.Easy:
      newBucket = currentBucket + 1;
      break;
    default:
      newBucket = currentBucket;
  }

  // Ensure the new bucket exists
  if (!updatedBuckets.has(newBucket)) {
    updatedBuckets.set(newBucket, new Set<Flashcard>());
  }

  // Add card to the new bucket
  updatedBuckets.get(newBucket)!.add(card);

  return updatedBuckets;
}

/**
 * Generates a hint for a flashcard.
 */
export function getHint(card: Flashcard): string {
  // If explicit hint exists, return it
  if (card.hint && card.hint.trim() !== "") {
    return card.hint;
  }

  // If no answer, return empty string
  if (!card.back) {
    return "";
  }

  // Split answer into words, handling various separators
  const words = card.back.split(/\s+/);
  
  // Generate hint by taking first letter and adding underscores
  const hintWords = words.map(word => {
    if (word.length === 0) return "";
    
    // Remove non-alphabetic characters from start to get first letter
    const firstLetter = word.replace(/^[^a-zA-Z]*/, '')[0] || '';
    
    return firstLetter + 
      (firstLetter ? '_'.repeat(Math.max(0, word.length - 1)) : '');
  });

  return hintWords.join(" ");
}

/**
 * Computes statistics about the user's learning progress.
 */
export function computeProgress(
  buckets: BucketMap,
  history: Array<{
    card: Flashcard;
    timestamp: number;
    difficulty: AnswerDifficulty;
  }>
): {
  totalCards: number;
  cardsPerBucket: Map<number, number>;
  averageBucket: number;
  masteredCards: number;
  successRate: number;
} {
  // Count cards in each bucket
  const cardsPerBucket = new Map<number, number>();
  let totalCards = 0;
  let bucketSum = 0;

  for (const [bucket, cards] of buckets.entries()) {
    const count = cards.size;
    cardsPerBucket.set(bucket, count);
    totalCards += count;
    bucketSum += bucket * count;
  }

  // Calculate average bucket
  const averageBucket = totalCards > 0 ? bucketSum / totalCards : 0;

  // Count mastered cards (bucket 3 and above)
  const masteredCards = Array.from(cardsPerBucket.entries())
    .reduce((sum, [bucket, count]) => 
      bucket >= 3 ? sum + count : sum, 0);

  // Calculate success rate
  const successCount = history.filter(
    entry => entry.difficulty !== AnswerDifficulty.Wrong
  ).length;
  
  const successRate = history.length > 0 
    ? (successCount / history.length) * 100 
    : 0;

  return {
    totalCards,
    cardsPerBucket,
    averageBucket,
    masteredCards,
    successRate,
  };
}