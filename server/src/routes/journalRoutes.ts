import { Router } from "express";

import {
  getJournalDates,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
} from "../controllers/journalController.js";

const router = Router();

router.get("/", getJournalDates);
router.get("/:date", getJournalEntry);
router.post("/", createJournalEntry);
router.put("/:date", updateJournalEntry);

export default router;