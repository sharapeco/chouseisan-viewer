import { describe, expect, it } from "vitest";
import { parseRows } from "./csv";

describe("parseRows", () => {
  describe("基本", () => {
    it("1行1セル", () => {
      expect(parseRows("hello")).toEqual([["hello"]]);
    });

    it("1行複数セル", () => {
      expect(parseRows("a,b,c")).toEqual([["a", "b", "c"]]);
    });

    it("複数行", () => {
      expect(parseRows("a,b\nc,d")).toEqual([["a", "b"], ["c", "d"]]);
    });

    it("末尾改行は余分な行を生まない", () => {
      expect(parseRows("a,b\n")).toEqual([["a", "b"]]);
    });

    it("空文字列は行なし", () => {
      expect(parseRows("")).toEqual([]);
    });
  });

  describe("CRLF", () => {
    it("CRLFをLFと同じに扱う", () => {
      expect(parseRows("a,b\r\nc,d")).toEqual([["a", "b"], ["c", "d"]]);
    });
  });

  describe("クォート", () => {
    it("クォートされたセルのカンマはデリミタにならない", () => {
      expect(parseRows('"a,b",c')).toEqual([["a,b", "c"]]);
    });

    it('""はクォート内のエスケープ', () => {
      expect(parseRows('"say ""hi"""')).toEqual([['say "hi"']]);
    });

    it("クォートされたセルは改行を含める（複数行フィールド）", () => {
      expect(parseRows('"line1\nline2",next')).toEqual([
        ["line1\nline2", "next"],
      ]);
    });

    it("複数行フィールドを跨いだ後も次の行を正しくパースする", () => {
      const input = '"desc\n\nlong",val\nrow2a,row2b';
      expect(parseRows(input)).toEqual([
        ["desc\n\nlong", "val"],
        ["row2a", "row2b"],
      ]);
    });
  });

  describe("空セル", () => {
    it("連続カンマは空文字セルになる", () => {
      expect(parseRows("a,,c")).toEqual([["a", "", "c"]]);
    });

    it("行頭カンマ", () => {
      expect(parseRows(",b")).toEqual([["", "b"]]);
    });
  });
});
