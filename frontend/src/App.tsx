import { useState } from "react";

interface CacheEntry {
  fetched_at: string;
  csv: string;
  source_url: string;
}

const STORAGE_PREFIX = "chouseisan:";
const PROXY_BASE = import.meta.env.VITE_PROXY_URL ?? "";

function extractH(raw: string): string | null {
  try {
    return new URL(raw.trim()).searchParams.get("h");
  } catch {
    return null;
  }
}

function loadCache(h: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + h);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function saveCache(h: string, sourceUrl: string, csv: string): CacheEntry {
  const entry: CacheEntry = { fetched_at: new Date().toISOString(), csv, source_url: sourceUrl };
  localStorage.setItem(STORAGE_PREFIX + h, JSON.stringify(entry));
  return entry;
}

export default function App() {
  const [urlInput, setUrlInput] = useState("");
  const [entry, setEntry] = useState<CacheEntry | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetch_csv(h: string, sourceUrl: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PROXY_BASE}/api/csv?h=${encodeURIComponent(h)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const saved = saveCache(h, sourceUrl, csv);
      setEntry(saved);
      setFromCache(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleFetch() {
    const h = extractH(urlInput);
    if (!h) { setError("URLが正しくありません（h パラメータが見つかりません）"); return; }
    setError(null);
    const cached = loadCache(h);
    if (cached) {
      setEntry(cached);
      setFromCache(true);
    } else {
      fetch_csv(h, urlInput.trim());
    }
  }

  function handleRefresh() {
    const h = extractH(urlInput);
    if (h) fetch_csv(h, urlInput.trim());
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">調整さんビューア</h1>

      <input
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder="https://chouseisan.com/s?h=XXXX"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleFetch()}
      />

      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          onClick={handleFetch}
          disabled={loading}
        >
          取得
        </button>
        {entry && (
          <button
            className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            onClick={handleRefresh}
            disabled={loading}
          >
            更新
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && <p className="text-sm text-gray-500">取得中…</p>}

      {entry && !loading && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            {fromCache ? "キャッシュ表示 — 最新を取得するには「更新」を押してください / " : ""}
            取得日時: {new Date(entry.fetched_at).toLocaleString()}
          </p>
          <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {entry.csv}
          </pre>
        </div>
      )}
    </div>
  );
}
