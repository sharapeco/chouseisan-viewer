import { forwardRef, useEffect, useState } from "react";

interface Props {
	name: string;
	comment: string;
	onClose: () => void;
}

export const CommentPopup = forwardRef<HTMLDivElement, Props>(
	function CommentPopup({ name, comment, onClose }, ref) {
		const [entered, setEntered] = useState(false);
		useEffect(() => {
			const id = requestAnimationFrame(() => setEntered(true));
			return () => cancelAnimationFrame(id);
		}, []);

		return (
			<div
				ref={ref}
				data-popup=""
				className={[
					"fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col transition-transform duration-200",
					entered ? "translate-y-0" : "translate-y-full",
				].join(" ")}
			>
				<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
					<span className="font-semibold text-sm">{name}</span>
					<button
						type="button"
						onClick={onClose}
						aria-label="閉じる"
						className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors text-base leading-none"
					>
						×
					</button>
				</div>
				<div className="overflow-y-auto px-4 py-3 min-h-[5rem]">
					<p className="text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
						{comment.trim() || "（コメントなし）"}
					</p>
				</div>
			</div>
		);
	},
);
