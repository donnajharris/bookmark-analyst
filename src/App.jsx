import { parseBookmarkFile } from './utils/parseBookmarks';

function App() {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const bookmarks = parseBookmarkFile(event.target.result);
      console.log(`Parsed ${bookmarks.length} bookmarks`, bookmarks);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Bookmark Analyst</h1>
      <input type='file' accept='.html' onChange={handleFile} />
    </div>
  );
}

export default App;
