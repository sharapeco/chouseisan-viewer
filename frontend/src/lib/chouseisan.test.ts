import { describe, it, expect } from "vitest";
import { parseChouseisan } from "./chouseisan";

// Synthetic data that mirrors the actual chouseisan CSV layout.
// Row 0 : event name
// Row 1 : multi-line description (quoted)
// Row 2 : 日程 header + participant names
// Rows 3+: candidate date rows
// Last  : コメント row

const DESCRIPTION = '"説明文\n\n複数行にわたる詳細テキスト"';

function buildCsv(lines: string[]): string {
  return lines.join("\n");
}

const BASIC = buildCsv([
  "テストイベント",
  DESCRIPTION,
  "日程,田中,鈴木,佐藤",
  "1/10（土）,◯,×,△",
  "1/17（土）,×,◯,◯",
  "コメント,よろしく,,都合次第",
]);

const NO_COMMENTS = buildCsv([
  "コメントなしイベント",
  DESCRIPTION,
  "日程,Aさん,Bさん",
  "2/1（土）,◯,×",
]);

const ANSWER_VARIANTS = buildCsv([
  "回答表記テスト",
  DESCRIPTION,
  "日程,P1,P2,P3,P4,P5,P6,P7",
  // ◯(大), ○(小), o(ascii), ×, x(ascii), △, 空
  "3/1,◯,○,o,×,x,△,",
  "コメント,,,,,,,",
]);

const CRLF_BASIC = BASIC.replace(/\n/g, "\r\n");

describe("parseChouseisan", () => {
  describe("eventName", () => {
    it("1行目の最初のセルをイベント名として返す", () => {
      expect(parseChouseisan(BASIC).eventName).toBe("テストイベント");
    });
  });

  describe("participants", () => {
    it("日程行のヘッダーから参加者名を返す", () => {
      expect(parseChouseisan(BASIC).participants).toEqual(["田中", "鈴木", "佐藤"]);
    });

    it("参加者数が正しい", () => {
      expect(parseChouseisan(BASIC).participants).toHaveLength(3);
    });
  });

  describe("dateRows", () => {
    it("日程行の数が正しい", () => {
      expect(parseChouseisan(BASIC).dateRows).toHaveLength(2);
    });

    it("日程ラベルを正しく返す", () => {
      const labels = parseChouseisan(BASIC).dateRows.map((r) => r.label);
      expect(labels).toEqual(["1/10（土）", "1/17（土）"]);
    });

    it("回答数が参加者数と一致する", () => {
      const { participants, dateRows } = parseChouseisan(BASIC);
      expect(dateRows[0].answers).toHaveLength(participants.length);
    });
  });

  describe("回答マッピング", () => {
    it("◯（大円）を 'o' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[0]).toBe("o");
    });

    it("○（小円）を 'o' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[1]).toBe("o");
    });

    it("o（ASCII）を 'o' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[2]).toBe("o");
    });

    it("× を 'x' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[3]).toBe("x");
    });

    it("x（ASCII）を 'x' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[4]).toBe("x");
    });

    it("△ を 'delta' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[5]).toBe("delta");
    });

    it("空セルを '' にマップする", () => {
      expect(parseChouseisan(ANSWER_VARIANTS).dateRows[0].answers[6]).toBe("");
    });
  });

  describe("comments", () => {
    it("コメント行の内容を参加者順に返す", () => {
      expect(parseChouseisan(BASIC).comments).toEqual(["よろしく", "", "都合次第"]);
    });

    it("コメント行がない場合は空文字の配列を返す", () => {
      const { participants, comments } = parseChouseisan(NO_COMMENTS);
      expect(comments).toEqual(Array(participants.length).fill(""));
    });
  });

  describe("CRLF", () => {
    it("CRLFでも同じ結果を返す", () => {
      expect(parseChouseisan(CRLF_BASIC)).toEqual(parseChouseisan(BASIC));
    });
  });

  describe("複数行説明文", () => {
    it("説明文が複数行クォートでも日程行を正しく検出する", () => {
      expect(parseChouseisan(BASIC).dateRows).toHaveLength(2);
    });
  });

  describe("エラー", () => {
    it("日程行がない場合は例外をスローする", () => {
      expect(() => parseChouseisan("イベント名\n説明文\n1/1,◯")).toThrow(
        "「日程」ヘッダー行が見つかりません"
      );
    });
  });
});
