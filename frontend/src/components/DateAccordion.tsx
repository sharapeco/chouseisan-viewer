import { useState } from "react";
import type { DateRow } from "../lib/chouseisan";
import { AnswerGroup, type Person } from "./AnswerGroup";
import { CircleIcon, CrossIcon, TriangleIcon } from "./icons";

interface Props {
	dateRow: DateRow;
	participants: Person[];
	activeName: string | null;
	focusedPerson?: Person | null;
	onChipClick: (person: Person) => void;
	defaultOpen?: boolean;
}

const BADGE = {
	o: { Icon: CircleIcon, className: "text-green-600 bg-green-50 border-green-400" },
	delta: { Icon: TriangleIcon, className: "text-amber-600 bg-amber-50 border-amber-400" },
	x: { Icon: CrossIcon, className: "text-red-600 bg-red-50 border-red-200" },
} as const;

export function DateAccordion({
	dateRow,
	participants,
	activeName,
	focusedPerson,
	onChipClick,
	defaultOpen = false,
}: Props) {
	const [open, setOpen] = useState(defaultOpen);

	const groups: Record<"o" | "delta" | "x", Person[]> = {
		o: [],
		delta: [],
		x: [],
	};
	dateRow.answers.forEach((answer, i) => {
		if (answer === "o" || answer === "delta" || answer === "x") {
			groups[answer].push(participants[i]);
		}
	});

	const focusedIdx = focusedPerson
		? participants.findIndex((p) => p.name === focusedPerson.name)
		: -1;
	const focusedAnswer = focusedIdx >= 0 ? dateRow.answers[focusedIdx] : null;
	const badgeAnswer =
		focusedAnswer &&
		(focusedAnswer === "o" || focusedAnswer === "delta" || focusedAnswer === "x")
			? focusedAnswer
			: null;
	const BadgeIcon = badgeAnswer ? BADGE[badgeAnswer].Icon : null;
	const badgeCls = badgeAnswer ? BADGE[badgeAnswer].className : "";

	return (
		<div className="border border-gray-200 rounded-xl overflow-hidden">
			<button
				type="button"
				className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left cursor-pointer touch-manipulation"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
			>
				<span className="font-medium text-sm flex-1 min-w-0 truncate">
					{dateRow.label}
				</span>
				<div className="flex items-center gap-3 shrink-0">
					{BadgeIcon && (
						<span
							className={`inline-flex items-center px-1.5 py-0.5 rounded-md border ${badgeCls}`}
						>
							<BadgeIcon className="w-3 h-3" />
						</span>
					)}
					<div className="flex gap-2 text-xs font-medium tabular-nums">
						<span className="text-green-700 flex items-center gap-0.5">
							<CircleIcon className="w-[1em] h-[1em] shrink-0" />
							<span className="inline-block min-w-[2ch] text-right">{groups.o.length}</span>
						</span>
						<span className="text-amber-700 flex items-center gap-0.5">
							<TriangleIcon className="w-[1em] h-[1em] shrink-0" />
							<span className="inline-block min-w-[2ch] text-right">{groups.delta.length}</span>
						</span>
						<span className="text-red-700 flex items-center gap-0.5">
							<CrossIcon className="w-[1em] h-[1em] shrink-0" />
							<span className="inline-block min-w-[2ch] text-right">{groups.x.length}</span>
						</span>
					</div>
					<span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
				</div>
			</button>

			{open && (
				<div className="px-3 pb-3 pt-2 space-y-2 bg-gray-50 border-t border-gray-100">
					<AnswerGroup
						type="o"
						people={groups.o}
						activeName={activeName}
						onChipClick={onChipClick}
					/>
					<AnswerGroup
						type="delta"
						people={groups.delta}
						activeName={activeName}
						onChipClick={onChipClick}
					/>
					<AnswerGroup
						type="x"
						people={groups.x}
						activeName={activeName}
						onChipClick={onChipClick}
					/>
				</div>
			)}
		</div>
	);
}
