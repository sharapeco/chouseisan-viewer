import { describe, expect, it } from "vitest";
import { normalizeFullwidthLatin } from "./normalizeFullwidthLatin";

describe("normalizeFullwidthLatin", () => {
	it("全角のラテン文字を半角に変換する", () => {
		expect(normalizeFullwidthLatin("Ｖｎ")).toBe("Vn");
	});

	it("全角と半角が混在していても半角に統一する", () => {
		expect(normalizeFullwidthLatin("Ｖc はなこ")).toBe("Vc はなこ");
	});

	it("ラテン文字以外（日本語）はそのまま", () => {
		expect(normalizeFullwidthLatin("たなか")).toBe("たなか");
	});

	it("半角のみの文字列はそのまま", () => {
		expect(normalizeFullwidthLatin("Vn Taro")).toBe("Vn Taro");
	});
});
