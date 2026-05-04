import { useState } from "react";
import { AnswerGroup, type Person } from "./AnswerGroup";
import type { DateRow } from "../lib/chouseisan";

interface Props {
  dateRow: DateRow;
  participants: Person[];
  activeName: string | null;
  onChipClick: (person: Person) => void;
  defaultOpen?: boolean;
}

export function DateAccordion({
  dateRow,
  participants,
  activeName,
  onChipClick,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const groups: Record<"o" | "delta" | "x", Person[]> = { o: [], delta: [], x: [] };
  dateRow.answers.forEach((answer, i) => {
    if (answer === "o" || answer === "delta" || answer === "x") {
      groups[answer].push(participants[i]);
    }
  });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-sm flex-1 min-w-0 truncate">
          {dateRow.label}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-2 text-xs font-medium">
            <span className="text-green-700">◯{groups.o.length}</span>
            <span className="text-amber-700">△{groups.delta.length}</span>
            <span className="text-red-700">×{groups.x.length}</span>
          </div>
          <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-2 space-y-2 bg-gray-50 border-t border-gray-100">
          <AnswerGroup type="o"     people={groups.o}     activeName={activeName} onChipClick={onChipClick} />
          <AnswerGroup type="delta" people={groups.delta} activeName={activeName} onChipClick={onChipClick} />
          <AnswerGroup type="x"     people={groups.x}     activeName={activeName} onChipClick={onChipClick} />
        </div>
      )}
    </div>
  );
}
