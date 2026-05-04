import { useEffect, useState } from "react";
import type { ChouseisanData } from "../lib/chouseisan";
import { DateAccordion } from "./DateAccordion";
import { CommentPopup } from "./CommentPopup";
import type { Person } from "./AnswerGroup";

interface Props {
  data: ChouseisanData;
  fetchedAt: string;
  fromCache: boolean;
}

export function ScheduleView({ data, fetchedAt, fromCache }: Props) {
  const [activePopup, setActivePopup] = useState<Person | null>(null);

  const participants: Person[] = data.participants.map((name, i) => ({
    name,
    comment: data.comments[i] ?? "",
  }));

  function handleChipClick(person: Person) {
    setActivePopup((prev) => (prev?.name === person.name ? null : person));
  }

  // Close popup on outside click.
  // Chips handle their own toggle so we skip them here.
  // Clicks inside the popup itself are also ignored.
  useEffect(() => {
    if (!activePopup) return;
    function handler(e: PointerEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("[data-chip]")) return;
      if (t.closest("[data-popup]")) return;
      setActivePopup(null);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [activePopup]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold">{data.eventName}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {fromCache ? "キャッシュ表示 / " : ""}
          取得日時: {new Date(fetchedAt).toLocaleString()}
        </p>
      </div>

      <div className="space-y-2">
        {data.dateRows.map((row, i) => (
          <DateAccordion
            key={row.label}
            dateRow={row}
            participants={participants}
            activeName={activePopup?.name ?? null}
            onChipClick={handleChipClick}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {activePopup && (
        <CommentPopup
          name={activePopup.name}
          comment={activePopup.comment}
          onClose={() => setActivePopup(null)}
        />
      )}
    </div>
  );
}
