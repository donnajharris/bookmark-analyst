import { parseBookmarkFile } from './utils/parseBookmarks';
import { parseUrlList } from './utils/parseUrlList';

function App() {
  const handleBookmarkFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const bookmarks = parseBookmarkFile(event.target.result);
      console.log(`Parsed ${bookmarks.length} bookmarks`, bookmarks);
    };
    reader.readAsText(file);
  };

  const handleUrlFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const urls = parseUrlList(event.target.result);
      console.log(`Parsed ${urls.length} URLs`, urls);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Bookmark Analyst</h1>
      <p>
        Bookmark HTML file:{' '}
        <input type='file' accept='.html' onChange={handleBookmarkFile} />
      </p>
      <p>
        URL list file:{' '}
        <input type='file' accept='.txt' onChange={handleUrlFile} />
      </p>
    </div>
  );
}

export default App;
