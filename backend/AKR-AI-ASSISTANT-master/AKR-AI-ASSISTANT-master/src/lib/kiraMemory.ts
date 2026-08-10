import kiraMemoryData from '@/data/kiraMemory.json';

export interface KiraMemory {
  [key: string]: string;
}

// Load memory from JSON
const memory: KiraMemory = kiraMemoryData;

// Normalize text for better matching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?.!,]/g, '')
    .replace(/\s+/g, ' ');
};

// Find response using pattern matching
export const findResponse = (userInput: string): string => {
  const normalizedInput = normalizeText(userInput);
  
  // Direct match
  if (memory[normalizedInput]) {
    return memory[normalizedInput];
  }

  // Partial match - check if any key is contained in the input
  for (const [key, value] of Object.entries(memory)) {
    const normalizedKey = normalizeText(key);
    if (normalizedInput.includes(normalizedKey) || normalizedKey.includes(normalizedInput)) {
      return value;
    }
  }

  // Check for keywords
  const keywords = Object.keys(memory).map(normalizeText);
  const inputWords = normalizedInput.split(' ');
  
  for (const word of inputWords) {
    for (const [key, value] of Object.entries(memory)) {
      const normalizedKey = normalizeText(key);
      if (normalizedKey.split(' ').includes(word) && word.length > 3) {
        return value;
      }
    }
  }

  // Default response
  return memory['default'] || "I'm still learning about that. Could you ask me something else?";
};

// Get all available responses
export const getAllResponses = (): KiraMemory => {
  return { ...memory };
};

// Add new response (for future expansion)
export const addResponse = (key: string, value: string): void => {
  const normalizedKey = normalizeText(key);
  memory[normalizedKey] = value;
};
