import { useEffect, useRef, useState } from "react";
import type { ChouseisanData } from "../lib/chouseisan";
import type { Person } from "./AnswerGroup";
import { CommentPopup } from "./CommentPopup";
import { DateAccordion } from "./DateAccordion";

interface Props {
	data: ChouseisanData;
	fetchedAt: string;
	fromCache: boolean;
}

export function ScheduleView({ data, fetchedAt, fromCache }: Props) {
	const [focusedPerson, setFocusedPerson] = useState<Person | null>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [sheetHeight, setSheetHeight] = useState(0);

	const participants: Person[] = data.participants.map((name, i) => ({
		name,
		comment: data.comments[i] ?? "",
	}));

	function handleChipClick(person: Person) {
		setFocusedPerson((prev) => (prev?.name === person.name ? null : person));
	}

	// Track sheet height to add equivalent padding-bottom so content isn't hidden.
	useEffect(() => {
		const el = sheetRef.current;
		if (!el || !focusedPerson) {
			setSheetHeight(0);
			return;
		}
		const ro = new ResizeObserver(() => setSheetHeight(el.offsetHeight));
		ro.observe(el);
		return () => ro.disconnect();
	}, [focusedPerson]);

	return (
		<div className="space-y-3">
			<div>
				<h2 className="text-xl font-bold">{data.eventName}</h2>
				<p className="text-xs text-gray-400 mt-0.5">
					{fromCache ? "キャッシュ表示 / " : ""}
					取得日時: {new Date(fetchedAt).toLocaleString()}
				</p>
			</div>

			<div className="space-y-2" style={{ paddingBottom: sheetHeight }}>
				{data.dateRows.map((row, i) => (
					<DateAccordion
						key={row.label}
						dateRow={row}
						participants={participants}
						activeName={focusedPerson?.name ?? null}
						focusedPerson={focusedPerson}
						onChipClick={handleChipClick}
						defaultOpen={i === 0}
					/>
				))}
			</div>

			{focusedPerson && (
				<CommentPopup
					ref={sheetRef}
					key={focusedPerson.name}
					name={focusedPerson.name}
					comment={focusedPerson.comment}
					onClose={() => setFocusedPerson(null)}
				/>
			)}
		</div>
	);
}
