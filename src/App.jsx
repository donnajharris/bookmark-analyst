import { useState, useRef } from 'react';
import { checkLinks } from './utils/checkLinks';
import { parseBookmarkFile } from './utils/parseBookmarks';
import { parseUrlList } from './utils/parseUrlList';
import './App.css';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [inputMode, setInputMode] = useState('file'); // "file" | "text"
  const [urlText, setUrlText] = useState('');
  const [fileName, setFileName] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkFile(e.target.result);
      setBookmarks(parsed);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleTextSubmit = () => {
    const parsed = parseUrlList(urlText);
    setBookmarks(parsed);
    setFileName(null);
  };

  const [results, setResults] = useState([]);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    setResults([]);
    setChecking(true);
    setProgress(0);

    await checkLinks(bookmarks, (result) => {
      setResults((prev) => [...prev, result]);
      setProgress((prev) => prev + 1);
    });

    setChecking(false);
  };

  const ready = bookmarks.length > 0;

  return (
    <div className='app'>
      <header className='header'>
        <div className='header-inner'>
          <span className='logo-mark'>⬡</span>
          <span className='logo-text'>Bookmark Analyst</span>
        </div>
        <p className='tagline'>Drop your bookmarks. Get the truth.</p>
      </header>

      <main className='main'>
        <div className='mode-toggle'>
          <button
            className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => {
              setInputMode('file');
              setBookmarks([]);
              setFileName(null);
            }}
          >
            Bookmark file
          </button>
          <button
            className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => {
              setInputMode('text');
              setBookmarks([]);
              setFileName(null);
            }}
          >
            URL list
          </button>
        </div>

        {inputMode === 'file' ? (
          <div
            className={`drop-zone ${dragging ? 'dragging' : ''} ${ready ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.html'
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {ready ? (
              <>
                <span className='drop-icon'>✓</span>
                <span className='drop-primary'>{fileName}</span>
                <span className='drop-secondary'>
                  {bookmarks.length} links found
                </span>
              </>
            ) : (
              <>
                <span className='drop-icon'>↓</span>
                <span className='drop-primary'>
                  Drop your EXCITING bookmark export here
                </span>
                <span className='drop-secondary'>
                  or click to browse · .html files from Chrome, Firefox, Safari
                </span>
              </>
            )}
          </div>
        ) : (
          <div className='text-zone'>
            <textarea
              className='url-input'
              placeholder={
                'https://example.com\nhttps://another-site.org\nhttps://onemore.net'
              }
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              onBlur={handleTextSubmit}
              rows={8}
            />
            <p className='text-hint'>
              One URL per line. Paste and click away to load.
            </p>
          </div>
        )}

        {ready && !checking && (
          <button className='analyze-btn' onClick={handleAnalyze}>
            Check {bookmarks.length} links →
          </button>
        )}

        {checking && (
          <div className='progress'>
            <div
              className='progress-bar'
              style={{ width: `${(progress / bookmarks.length) * 100}%` }}
            />
            <span className='progress-label'>
              Checking {progress} of {bookmarks.length}…
            </span>
          </div>
        )}

        {/* temp testing */}
        {results.length > 0 && (
          <pre
            style={{
              color: 'lime',
              fontSize: '0.7rem',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(results.slice(0, 6), null, 2)}
          </pre>
        )}
      </main>

      <footer className='footer'>
        No accounts. No storage. Your bookmarks never leave this session.
      </footer>
    </div>
  );
}

export default App;
