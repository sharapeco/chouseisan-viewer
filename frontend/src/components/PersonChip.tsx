interface Props {
	name: string;
	hasComment: boolean;
	isActive: boolean;
	onClick: () => void;
}

export function PersonChip({ name, hasComment, isActive, onClick }: Props) {
	return (
		<button
			type="button"
			data-chip=""
			onClick={onClick}
			className={[
				"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border cursor-pointer transition-colors touch-manipulation",
				isActive
					? "bg-blue-100 border-blue-400 text-blue-800"
					: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
			].join(" ")}
		>
			{name}
			{hasComment && (
				<span
					className={[
						"w-1.5 h-1.5 rounded-full shrink-0",
						isActive ? "bg-blue-400" : "bg-gray-400",
					].join(" ")}
				/>
			)}
		</button>
	);
}
