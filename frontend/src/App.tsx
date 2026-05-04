import { useMemo, useState } from "react";
import { parseChouseisan } from "./lib/chouseisan";
import { ScheduleView } from "./components/ScheduleView";

interface CacheEntry {
  fetched_at: string;
  csv: string;
  source_url: string;
}

const STORAGE_PREFIX = "chouseisan:";
const LAST_URL_KEY = "chouseisan:lastUrl";
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
  const [urlInput, setUrlInput] = useState(
    () => localStorage.getItem(LAST_URL_KEY) ?? ""
  );
  const [entry, setEntry] = useState<CacheEntry | null>(() => {
    const h = extractH(localStorage.getItem(LAST_URL_KEY) ?? "");
    return h ? loadCache(h) : null;
  });
  const [fromCache, setFromCache] = useState(() => {
    const h = extractH(localStorage.getItem(LAST_URL_KEY) ?? "");
    return h ? loadCache(h) !== null : false;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!entry) return null;
    try {
      return { ok: true as const, data: parseChouseisan(entry.csv) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  }, [entry]);

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
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">調整さんビューア</h1>

      <input
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        inputMode="url"
        placeholder="調整さんのURL（例：https://chouseisan.com/s?h=XXXX）"
        value={urlInput}
        onChange={(e) => {
          setUrlInput(e.target.value);
          localStorage.setItem(LAST_URL_KEY, e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleFetch()}
      />

      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 touch-manipulation"
          onClick={handleFetch}
          disabled={loading}
        >
          取得
        </button>
        {entry && (
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 touch-manipulation"
            onClick={handleRefresh}
            disabled={loading}
          >
            更新
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">取得中…</p>}

      {parsed && !loading && (
        parsed.ok
          ? <ScheduleView data={parsed.data} fetchedAt={entry!.fetched_at} fromCache={fromCache} />
          : <p className="text-sm text-red-600">解析エラー: {parsed.error}</p>
      )}
    </div>
  );
}
