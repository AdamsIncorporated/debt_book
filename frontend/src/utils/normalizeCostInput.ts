// utils/normalizeCostInput.ts
const MAX_LEN = 100;

export const normalizeCostInput = (value: string) => {
  let v = value.replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
  return v.slice(0, MAX_LEN);
};
