import { sortByInstrument } from "../utils/instrumentSort";
import { PersonChip } from "./PersonChip";

export interface Person {
	name: string;
	comment: string;
}

interface Props {
	type: "o" | "delta" | "x";
	people: Person[];
	activeName: string | null;
	onChipClick: (person: Person) => void;
}

const CONFIG = {
	o: {
		label: "◯",
		textColor: "text-green-700",
		bgColor: "bg-green-50",
		borderColor: "border-green-100",
	},
	delta: {
		label: "△",
		textColor: "text-amber-700",
		bgColor: "bg-amber-50",
		borderColor: "border-amber-100",
	},
	x: {
		label: "×",
		textColor: "text-red-700",
		bgColor: "bg-red-50",
		borderColor: "border-red-100",
	},
} as const;

export function AnswerGroup({ type, people, activeName, onChipClick }: Props) {
	if (people.length === 0) return null;
	const { label, textColor, bgColor, borderColor } = CONFIG[type];
	return (
		<div className={`${bgColor} border ${borderColor} rounded-xl p-3`}>
			<div className={`text-xs font-bold ${textColor} mb-2`}>
				{label} {people.length}人
			</div>
			<div className="flex flex-wrap gap-1.5">
				{sortByInstrument(people).map((p) => (
					<PersonChip
						key={p.name}
						name={p.name}
						hasComment={p.comment.trim() !== ""}
						isActive={activeName === p.name}
						onClick={() => onChipClick(p)}
					/>
				))}
			</div>
		</div>
	);
}
