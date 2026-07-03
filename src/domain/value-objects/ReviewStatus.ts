export const REVIEW_STATUS = {
  Pending: 'pending',
  Published: 'published',
  Rejected: 'rejected',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export function isReviewStatus(value: string): value is ReviewStatus {
  return Object.values(REVIEW_STATUS).includes(value as ReviewStatus);
}

export function isPublishedReviewStatus(status: ReviewStatus): boolean {
  return status === REVIEW_STATUS.Published;
}
