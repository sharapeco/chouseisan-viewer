interface InstrumentGroup {
	patterns: RegExp[];
	rank: number;
}

const INSTRUMENT_GROUPS: InstrumentGroup[] = [
	{ patterns: [/vn/, /violin/], rank: 0 },
	{ patterns: [/\bvla\b/, /\bva\b/, /viola/], rank: 1 },
	{ patterns: [/\bvc\b/, /cello/], rank: 2 },
	{ patterns: [/\bcb\b/, /\bbass\b/], rank: 3 },
	{ patterns: [/\bfl\b/, /flute/], rank: 4 },
	{ patterns: [/\bob\b/, /oboe/], rank: 5 },
	{ patterns: [/\bcl\b/, /clarinet/], rank: 6 },
	{ patterns: [/\bfg\b/, /fagott/, /bassoon/], rank: 7 },
	{ patterns: [/\bhr\b/, /horn/], rank: 8 },
	{ patterns: [/\btp\b/, /\btrp\b/, /trumpet/], rank: 9 },
	{ patterns: [/\btrb\b/, /\btb\b/, /trombone/], rank: 10 },
	{ patterns: [/チューバ/, /tuba/], rank: 11 },
	{ patterns: [/\bperc\b/, /percussion/, /打楽器/, /たいこ/], rank: 12 },
	{ patterns: [/\bpf\b/, /piano/], rank: 13 },
];

const UNKNOWN_RANK = 14;

/**
 * 楽器名を含む文字列から楽器ランクを取得する。
 *
 * @param name
 * @returns
 */
function getInstrumentRank(name: string): number {
	// "bass trb" は bass でなく trb として扱う
	const normalized = name
		.toLowerCase()
		.replace(/bass\s*trb/g, "trb")
		.replace(/bass\s*trombone/g, "trombone");

	let minRank = UNKNOWN_RANK;
	for (const { patterns, rank } of INSTRUMENT_GROUPS) {
		if (rank >= minRank) continue;
		if (patterns.some((p) => p.test(normalized))) {
			minRank = rank;
		}
	}
	return minRank;
}

export function sortByInstrument<T extends { name: string }>(people: T[]): T[] {
	return [...people].sort((a, b) => {
		const diff = getInstrumentRank(a.name) - getInstrumentRank(b.name);
		if (diff !== 0) return diff;
		return a.name.localeCompare(b.name, "ja");
	});
}
