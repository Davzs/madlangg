interface ReviewInfo {
  lastReviewDate: Date;
  nextReviewDate: Date;
  interval: number;  // in days
  easeFactor: number;
  consecutiveCorrect: number;
}

export function calculateNextReview(
  reviewInfo: ReviewInfo,
  performance: number // 1-5 scale, matching confidence level
): ReviewInfo {
  const MIN_INTERVAL = 1; // minimum 1 day
  const MAX_INTERVAL = 365; // maximum 1 year
  const MIN_EASE_FACTOR = 1.3;
  
  let { interval, easeFactor, consecutiveCorrect } = reviewInfo;
  
  // Adjust ease factor based on performance
  const easeChange = (performance - 3) * 0.1;
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeChange);
  
  // Update consecutive correct count
  if (performance >= 4) {
    consecutiveCorrect++;
  } else {
    consecutiveCorrect = 0;
  }
  
  // Calculate new interval
  if (performance < 3) {
    // If performance is poor, reset interval
    interval = MIN_INTERVAL;
  } else {
    if (interval === 0) {
      interval = MIN_INTERVAL;
    } else {
      interval = Math.min(
        MAX_INTERVAL,
        Math.round(interval * easeFactor * (1 + (consecutiveCorrect * 0.1)))
      );
    }
  }
  
  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  
  return {
    lastReviewDate: now,
    nextReviewDate,
    interval,
    easeFactor,
    consecutiveCorrect,
  };
}

export function getReviewPriority(word: {
  confidenceLevel: number;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}): number {
  const now = new Date();
  
  // If never reviewed, highest priority
  if (!word.lastReviewDate) {
    return 1;
  }
  
  // If overdue, high priority
  if (word.nextReviewDate && word.nextReviewDate < now) {
    const daysOverdue = (now.getTime() - word.nextReviewDate.getTime()) / (24 * 60 * 60 * 1000);
    return Math.min(1, 0.8 + (daysOverdue * 0.1));
  }
  
  // Priority based on confidence level (lower confidence = higher priority)
  const confidencePriority = 1 - ((word.confidenceLevel - 1) / 4);
  
  // If due soon, medium priority
  if (word.nextReviewDate) {
    const daysUntilDue = (word.nextReviewDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    if (daysUntilDue < 2) {
      return Math.min(0.8, 0.5 + confidencePriority * 0.3);
    }
  }
  
  return confidencePriority * 0.4; // Lower priority for well-known words
}
