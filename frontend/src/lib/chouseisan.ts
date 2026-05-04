import { parseRows } from "./csv";

export type Answer = "o" | "x" | "delta" | "";

export interface DateRow {
  label: string;
  answers: Answer[];
}

export interface ChouseisanData {
  eventName: string;
  participants: string[];
  dateRows: DateRow[];
  comments: string[];
}

const ANSWER_MAP: Record<string, Answer> = {
  o: "o",
  "○": "o",
  "◯": "o",
  x: "x",
  "×": "x",
  "△": "delta",
};

function toAnswer(s: string): Answer {
  return ANSWER_MAP[s.trim()] ?? "";
}

/**
 * Parse the CSV export from chouseisan.com into structured data.
 *
 * Expected layout (rows):
 *   0        : event name (first cell)
 *   1        : description text (may be a multi-line quoted cell)
 *   headerRow: first cell === "日程", remaining cells are participant names
 *   ...      : one row per candidate date; first cell = label, rest = answers
 *   last     : first cell === "コメント", rest = per-participant comments
 */
export function parseChouseisan(raw: string): ChouseisanData {
  const rows = parseRows(raw);

  const eventName = rows[0]?.[0] ?? "";

  const headerIdx = rows.findIndex((r) => r[0] === "日程");
  if (headerIdx === -1) throw new Error("「日程」ヘッダー行が見つかりません");

  const participants = rows[headerIdx].slice(1);
  const n = participants.length;

  const commentIdx = rows.findIndex((r) => r[0] === "コメント");
  const comments =
    commentIdx !== -1
      ? rows[commentIdx].slice(1, n + 1).map((c) => c)
      : Array<string>(n).fill("");

  const endIdx = commentIdx !== -1 ? commentIdx : rows.length;
  const dateRows: DateRow[] = [];
  for (let i = headerIdx + 1; i < endIdx; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    dateRows.push({
      label: row[0],
      answers: Array.from({ length: n }, (_, j) => toAnswer(row[j + 1] ?? "")),
    });
  }

  return { eventName, participants, dateRows, comments };
}
