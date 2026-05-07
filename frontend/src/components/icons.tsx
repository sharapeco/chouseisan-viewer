import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round" as const,
};

// ○  — circle, r=9.6 → outer edge 3–21 (19.2px visual diameter)
export function CircleIcon(props: IconProps) {
	return (
		<svg {...baseProps} aria-hidden="true" {...props}>
			<circle cx="12" cy="12" r="9.6" />
		</svg>
	);
}

// △  — near-equilateral triangle (base≈20, height=18)
//      outer stroke reaches same ~2–22 range as the circle
export function TriangleIcon(props: IconProps) {
	return (
		<svg {...baseProps} strokeLinejoin="round" aria-hidden="true" {...props}>
			<polygon points="12,3 22,21 2,21" />
		</svg>
	);
}

// ×  — diagonal cross, corners at (4,4)↔(20,20) → visual bbox ≈ 2.6–21.4
export function CrossIcon(props: IconProps) {
	return (
		<svg {...baseProps} aria-hidden="true" {...props}>
			<line x1="4" y1="4" x2="20" y2="20" />
			<line x1="20" y1="4" x2="4" y2="20" />
		</svg>
	);
}
