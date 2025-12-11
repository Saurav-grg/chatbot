export function generateChatTitle(text: string): string {
  if (!text || text.trim() === '') {
    return 'New Conversation';
  }

  const truncatedMessage =
    text.length > 100 ? text.substring(0, 100) + '...' : text;

  let title = '';
  const firstSentence = truncatedMessage.split(/[.!?]/)[0].trim();

  if (firstSentence.length <= 50 && firstSentence.length >= 10) {
    title = firstSentence;
  } else {
    const words = truncatedMessage.split(/\s+/);
    const keyWords = words.slice(0, Math.min(6, words.length));
    title = keyWords.join(' ');

    if (words.length > 6) {
      title += '...';
    }
  }

  title = title.replace(
    /^(hey|hi|hello|um|so|basically|just|i was|i am|i'm)\s+/i,
    ''
  );

  title = title.charAt(0).toUpperCase() + title.slice(1);

  if (title.length > 60) {
    title = title.substring(0, 60) + '...';
  }

  return title;
}
