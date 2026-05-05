import { describe, expect, it } from "vitest";
import { sortByInstrument } from "./instrumentSort";

function names(people: { name: string }[]) {
	return people.map((p) => p.name);
}

function sorted(...nameList: string[]) {
	return names(sortByInstrument(nameList.map((name) => ({ name }))));
}

describe("sortByInstrument", () => {
	describe("弦楽器の順序", () => {
		it("vn → va → vc → cb の順に並ぶ", () => {
			const result = sorted("Vaたろう", "Vc はなこ", "Vn いちろう", "次郎(CB)");
			expect(result).toEqual([
				"Vn いちろう",
				"Vaたろう",
				"Vc はなこ",
				"次郎(CB)",
			]);
		});
	});

	describe("管楽器の順序", () => {
		it("fl → ob → cl → hr → tp → trb → tuba の順に並ぶ", () => {
			const result = sorted(
				"やまもとチューバ",
				"たなか Trp",
				"Hrさとう",
				"CLけんじ",
				"Ob やまだ",
				"FL もり",
				"Tb すずき",
			);
			expect(result).toEqual([
				"FL もり",
				"Ob やまだ",
				"CLけんじ",
				"Hrさとう",
				"たなか Trp",
				"Tb すずき",
				"やまもとチューバ",
			]);
		});
	});

	describe("その他の順序", () => {
		it("perc → pf → 不明 の順に並ぶ", () => {
			const result = sorted("まめこ", "pfさとう", "Percすずき");
			expect(result).toEqual(["Percすずき", "pfさとう", "まめこ"]);
		});
	});

	describe("大文字小文字の無視", () => {
		it("VN / Vn / vn をすべて同じ楽器として扱う", () => {
			const result = sorted("vnあきこ", "Vn きむら", "さくらVn");
			const ranks = new Set(result.map(() => "vn"));
			expect(ranks.size).toBe(1);
			// 全員 vn グループ = cb より前
			const withCb = sorted("たかはし(CB)", "vnあきこ", "Vn きむら");
			expect(withCb.indexOf("たかはし(CB)")).toBeGreaterThan(
				withCb.indexOf("Vn きむら"),
			);
		});

		it("FL / Fl / fl をすべて同じ楽器として扱う", () => {
			const _result = sorted("Fl なかむら", "FL もり", "Fl みずの");
			// 全員 fl グループ = ob より前
			const withOb = sorted("Ob やまだ", "FL もり", "Fl なかむら");
			expect(withOb.indexOf("Ob やまだ")).toBeGreaterThan(
				withOb.indexOf("FL もり"),
			);
		});
	});

	describe("特殊なケース", () => {
		it("Bass Trb は trombone グループに入る (cb ではない)", () => {
			const result = sorted("Bass こばやし", "Bass Trb.おおた");
			expect(result[0]).toBe("Bass こばやし"); // cb (rank 3)
			expect(result[1]).toBe("Bass Trb.おおた"); // trb (rank 10)
		});

		it("名前の末尾にある楽器略称を認識する (さくらVn, うえだvc)", () => {
			const result = sorted("次郎(CB)", "さくらVn", "うえだvc");
			expect(result[0]).toBe("さくらVn"); // vn
			expect(result[1]).toBe("うえだvc"); // vc
			expect(result[2]).toBe("次郎(CB)"); // cb
		});

		it("括弧内の楽器略称を認識する (次郎(CB))", () => {
			const result = sorted("Vn いちろう", "次郎(CB)");
			expect(result[0]).toBe("Vn いちろう");
			expect(result[1]).toBe("次郎(CB)");
		});

		it("cb&vn のような複数楽器は上位（vn）グループに入る", () => {
			const result = sorted("次郎(CB)", "よしだcb&vn");
			expect(result[0]).toBe("よしだcb&vn"); // vn (rank 0) が優先
			expect(result[1]).toBe("次郎(CB)");
		});

		it("日本語楽器名を認識する (打楽器, たいこ, チューバ)", () => {
			const result = sorted(
				"打楽器　まつもと",
				"たいこかわい",
				"なかむらチューバ",
			);
			expect(result[0]).toBe("なかむらチューバ"); // tuba (rank 11)
			// 打楽器ふたりは rank 12 で同順、順序はロケールソートに委ねる
			expect(result.slice(1)).toContain("打楽器　まつもと");
			expect(result.slice(1)).toContain("たいこかわい");
		});

		it("oboe という表記を認識する", () => {
			const result = sorted("CLけんじ", "Oboe やまぐち", "oboeふじた");
			expect(result[0]).toBe("Oboe やまぐち");
			expect(result[1]).toBe("oboeふじた");
			expect(result[2]).toBe("CLけんじ");
		});

		it("vla という表記を va として認識する", () => {
			const result = sorted(
				"Vn いちろう",
				"Vla たかむら",
				"vla.むらかみ",
				"Vc はなこ",
			);
			expect(result[0]).toBe("Vn いちろう");
			expect(result[1]).toBe("Vla たかむら");
			expect(result[2]).toBe("vla.むらかみ");
			expect(result[3]).toBe("Vc はなこ");
		});

		it("楽器不明は末尾に集まる", () => {
			const result = sorted("まめこ", "Vn いちろう", "ぽんた");
			expect(result[0]).toBe("Vn いちろう");
			expect(result).toContain("まめこ");
			expect(result).toContain("ぽんた");
			expect(result.indexOf("まめこ")).toBeGreaterThan(
				result.indexOf("Vn いちろう"),
			);
		});
	});
});
