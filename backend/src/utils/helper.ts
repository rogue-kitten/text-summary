export function splitBySentences({
  size,
  text,
}: {
  text: string;
  size: number;
}): string[] {
  const abbreviations = [
    'Mr',
    'Mrs',
    'Ms',
    'Dr',
    'Jr',
    'Sr',
    'St',
    'vs',
    'etc',
    'Prof',
    'Inc',
    'Ltd',
    'Mt',
    'Capt',
    'Sgt',
    'Col',
    'Gen',
    'Rep',
    'Sen',
  ];

  // Escape periods in abbreviations for regex
  const escapedAbbreviations = abbreviations
    .map((abbrev) => abbrev.replace('.', '\\.'))
    .join('|');

  // Regular expression to split sentences:
  // - Negative lookbehind to ensure the punctuation is not part of an abbreviation
  // - Positive lookahead to ensure the next sentence starts with a capital letter
  const sentenceEndRegex = new RegExp(
    `(?<!\\b(?:${escapedAbbreviations})\\.)[.!?]+\\s+(?=[A-Z])`,
    'g',
  );

  // Split the text into sentences
  const sentences = text
    .split(sentenceEndRegex)
    .filter((sentence) => sentence.trim().length > 0);

  // Group sentences into chunks of the specified size
  const groups = [];
  for (let i = 0; i < sentences.length; i += size) {
    const group = sentences.slice(i, i + size).join(' ');
    groups.push(group);
  }

  return groups;
}
