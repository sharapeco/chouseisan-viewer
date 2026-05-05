interface Props {
	name: string;
	comment: string;
	onClose: () => void;
}

export function CommentPopup({ name, comment, onClose }: Props) {
	return (
		<div
			data-popup=""
			className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4"
		>
			<div className="flex items-start justify-between gap-3 mb-2">
				<span className="font-semibold text-sm leading-snug">{name}</span>
				<button
					onClick={onClose}
					aria-label="閉じる"
					className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors text-base leading-none"
				>
					×
				</button>
			</div>
			<p className="text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
				{comment.trim() || "（コメントなし）"}
			</p>
		</div>
	);
}
