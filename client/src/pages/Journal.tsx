import { useEffect, useState } from "react";

import DailyEntry from "../components/DailyEntry";
import {
  getJournalDates,
  getJournalEntry,
} from "../services/journalService";
import { getTodayDate } from "../utils/date";

function Journal() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function loadDates() {
      const dates = await getJournalDates();
      setEntryDates(dates);
    }

    loadDates();
  }, []);

  useEffect(() => {
    async function loadEntry() {
      const entry = await getJournalEntry(selectedDate);
      setContent(entry?.content ?? "");
    }

    loadEntry();
  }, [selectedDate]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl text-[#292824]">
        Journal
      </h1>

      <p className="mt-2 text-sm text-[#716D63]">
        Your thoughts, one day at a time.
      </p>

      {/* JournalHeatmap will go here */}

      <div className="mt-10">
        <DailyEntry
          date={selectedDate}
          content={content}
          onSave={(newContent) => {
            setContent(newContent);
          }}
        />
      </div>
    </div>
  );
}

export default Journal;