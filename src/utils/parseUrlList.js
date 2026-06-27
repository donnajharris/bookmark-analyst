import { isEphemeralUrl } from './parseBookmarks.js';

export function parseUrlList(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('http'))
    .map((href) => ({
      href,
      title: href,
      addDate: null,
      status: isEphemeralUrl(href) ? 'ephemeral' : null,
    }));
}
