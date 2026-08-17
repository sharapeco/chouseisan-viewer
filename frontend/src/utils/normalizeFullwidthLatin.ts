const FULLWIDTH_LATIN = /[Ａ-Ｚａ-ｚ]/g;

/**
 * 全角のラテン文字（Ａ-Ｚ, ａ-ｚ）を半角に変換する。
 */
export function normalizeFullwidthLatin(text: string): string {
	return text.replace(FULLWIDTH_LATIN, (char) =>
		String.fromCharCode(char.charCodeAt(0) - 0xfee0),
	);
}
