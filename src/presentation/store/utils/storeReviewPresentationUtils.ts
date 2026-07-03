export const FormatStoreReviewDate = (value: string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
