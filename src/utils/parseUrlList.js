export function parseUrlList(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('http'))
    .map((href) => ({ href, title: href, addDate: null }));
}
