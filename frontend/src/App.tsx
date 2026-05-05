import { useEffect, useMemo } from "react";
import { ScheduleView } from "./components/ScheduleView";
import { SERVICE_NAME } from "./config";
import { useChouseisanFetch } from "./hooks/useChouseisanFetch";
import { parseChouseisan } from "./lib/chouseisan";

export default function App() {
	const {
		urlInput,
		handleUrlChange,
		entry,
		fromCache,
		loading,
		error,
		handleFetch,
		handleRefresh,
	} = useChouseisanFetch();

	const parsed = useMemo(() => {
		if (!entry) return null;
		try {
			return { ok: true as const, data: parseChouseisan(entry.csv) };
		} catch (e) {
			return {
				ok: false as const,
				error: e instanceof Error ? e.message : String(e),
			};
		}
	}, [entry]);

	useEffect(() => {
		document.title = parsed?.ok
			? `${parsed.data.eventName} - ${SERVICE_NAME}`
			: SERVICE_NAME;
	}, [parsed]);

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-4">
			<header className="flex gap-5 items-end">
				<h1 className="text-lg font-bold">{SERVICE_NAME}</h1>
				<p className="py-1 text-sm text-gray-500">
					調整さんのスケジュールを見やすく表示
				</p>
			</header>

			<input
				className="w-full border rounded-lg px-3 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
				type="text"
				inputMode="url"
				placeholder="調整さんのURL（例：https://chouseisan.com/s?h=XXXX）"
				value={urlInput}
				onChange={(e) => handleUrlChange(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleFetch()}
			/>

			<div className="flex gap-2">
				<button
					type="button"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 cursor-pointer touch-manipulation"
					onClick={handleFetch}
					disabled={loading}
				>
					取得
				</button>
				{entry && (
					<button
						type="button"
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 cursor-pointer touch-manipulation"
						onClick={handleRefresh}
						disabled={loading}
					>
						更新
					</button>
				)}
			</div>

			{error && <p className="text-sm text-red-600">エラー：{error}</p>}
			{loading && <p className="text-sm text-gray-500">取得中…</p>}

			{parsed &&
				!loading &&
				(parsed.ok ? (
					<ScheduleView
						data={parsed.data}
						// biome-ignore lint/style/noNonNullAssertion: parsed.ok のとき entry は必ず存在する
						fetchedAt={entry!.fetched_at}
						fromCache={fromCache}
					/>
				) : (
					<p className="text-sm text-red-600">解析エラー：{parsed.error}</p>
				))}
		</div>
	);
}
