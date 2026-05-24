// Strip HTML tags and trim whitespace from user-supplied strings.
// Used before storing bio/name fields to prevent stored XSS.
export const stripHtml = (input: string): string =>
  input.replace(/<[^>]*>/g, '').trim()

export const sanitizeUserInput = (input: string): string => stripHtml(input)
