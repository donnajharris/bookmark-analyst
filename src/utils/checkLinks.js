export async function checkLinks(bookmarks, onResult) {
  const urlsToCheck = bookmarks.filter((b) => !b.status);
  const preClassified = bookmarks.filter((b) => b.status);

  // send preClassified results immediately
  preClassified.forEach(onResult);

  const response = await fetch('/api/check-links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: bookmarks }),
    body: JSON.stringify({ urls: urlsToCheck }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const result = JSON.parse(line);
          onResult(result);
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
