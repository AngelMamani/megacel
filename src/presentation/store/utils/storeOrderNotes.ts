export const BuildOrderNotes = (reference: string) => {
  const trimmedReference = reference.trim();
  if (!trimmedReference) return undefined;
  return `Referencia de entrega: ${trimmedReference}`;
};
