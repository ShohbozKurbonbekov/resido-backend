export const validateNumberValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};
