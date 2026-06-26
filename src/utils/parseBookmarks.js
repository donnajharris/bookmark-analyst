export function parseBookmarkFile(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const links = doc.querySelectorAll('a');

  const bookmarks = [];

  links.forEach((link) => {
    const href = link.getAttribute('href');
    const title = link.textContent.trim();
    const addDateRaw = link.getAttribute('add_date');

    if (!href) return;

    const addDate = addDateRaw
      ? new Date(parseInt(addDateRaw) * 1000).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null;

    bookmarks.push({ href, title, addDate });
  });

  return bookmarks;
}
