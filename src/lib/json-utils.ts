export function isValidJson(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  try {
    JSON.parse(text.trim());
    return true;
  } catch {
    return false;
  }
}

export function prettyPrintJson(text: string): string {
  const obj = JSON.parse(text.trim());
  return JSON.stringify(obj, null, 2);
}
