import { sortByInstrument } from "../utils/instrumentSort";
import { CircleIcon, CrossIcon, TriangleIcon } from "./icons";
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
		Icon: CircleIcon,
		textColor: "text-green-700",
		bgColor: "bg-green-50",
		borderColor: "border-green-100",
	},
	delta: {
		Icon: TriangleIcon,
		textColor: "text-amber-700",
		bgColor: "bg-amber-50",
		borderColor: "border-amber-100",
	},
	x: {
		Icon: CrossIcon,
		textColor: "text-red-700",
		bgColor: "bg-red-50",
		borderColor: "border-red-100",
	},
} as const;

export function AnswerGroup({ type, people, activeName, onChipClick }: Props) {
	if (people.length === 0) return null;
	const { Icon, textColor, bgColor, borderColor } = CONFIG[type];
	return (
		<div className={`${bgColor} border ${borderColor} rounded-xl p-3`}>
			<div className={`text-xs font-bold ${textColor} mb-2 flex items-center gap-1`}>
				<Icon className="w-[1em] h-[1em] shrink-0" />
				{people.length}人
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
