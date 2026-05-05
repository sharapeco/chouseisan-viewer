import { useEffect, useRef, useState } from "react";

export interface CacheEntry {
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

function buildSourceUrl(h: string) {
	return `https://chouseisan.com/s?h=${h}`;
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
	const entry: CacheEntry = {
		fetched_at: new Date().toISOString(),
		csv,
		source_url: sourceUrl,
	};
	localStorage.setItem(STORAGE_PREFIX + h, JSON.stringify(entry));
	return entry;
}

const initialH = new URLSearchParams(window.location.search).get("h");

function resolveInitialUrl(): string {
	if (initialH) return buildSourceUrl(initialH);
	return localStorage.getItem(LAST_URL_KEY) ?? "";
}

function resolveInitialEntry(): CacheEntry | null {
	if (initialH) return loadCache(initialH);
	const h = extractH(localStorage.getItem(LAST_URL_KEY) ?? "");
	return h ? loadCache(h) : null;
}

/**
 * 調整さんの CSV をプロキシ経由で取得し、localStorage にキャッシュして管理するフック。
 * URL 入力・フェッチ・キャッシュ読み書きをまとめて扱い、URLクエリ (?h=) があれば初回マウント時に自動取得する。
 * エントリが存在する場合はパーマリンクを history に反映する。
 */
export function useChouseisanFetch() {
	const [urlInput, setUrlInput] = useState(resolveInitialUrl);
	const [entry, setEntry] = useState<CacheEntry | null>(resolveInitialEntry);
	const [fromCache, setFromCache] = useState(
		() => resolveInitialEntry() !== null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const didInitialFetch = useRef(false);
	useEffect(() => {
		if (didInitialFetch.current) return;
		didInitialFetch.current = true;
		if (initialH && !loadCache(initialH)) {
			fetchCsv(initialH, buildSourceUrl(initialH), true);
		} else if (!initialH && entry) {
			const h = extractH(urlInput);
			if (h) history.replaceState(null, "", `/?h=${h}`);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	async function fetchCsv(h: string, src: string, clearUrlOnFail = false) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`${PROXY_BASE}/api/csv?h=${encodeURIComponent(h)}`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const csv = await res.text();
			const saved = saveCache(h, src, csv);
			setEntry(saved);
			setFromCache(false);
			history.pushState(null, "", `/?h=${h}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
			if (clearUrlOnFail) history.replaceState(null, "", "/");
		} finally {
			setLoading(false);
		}
	}

	function handleUrlChange(value: string) {
		setUrlInput(value);
		localStorage.setItem(LAST_URL_KEY, value);
	}

	function handleFetch() {
		const h = extractH(urlInput);
		if (!h) {
			setError("URLが正しくありません（h パラメータが見つかりません）");
			return;
		}
		setError(null);
		const cached = loadCache(h);
		if (cached) {
			setEntry(cached);
			setFromCache(true);
			history.pushState(null, "", `/?h=${h}`);
		} else {
			fetchCsv(h, urlInput.trim());
		}
	}

	function handleRefresh() {
		const h = extractH(urlInput);
		if (h) fetchCsv(h, urlInput.trim());
	}

	return {
		urlInput,
		handleUrlChange,
		entry,
		fromCache,
		loading,
		error,
		handleFetch,
		handleRefresh,
	};
}
