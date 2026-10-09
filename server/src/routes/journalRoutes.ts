import { Router } from "express";

import {
  getJournalEntries,
  getJournalActivity,
  getFirstJournalActivity,
  deleteJournalEntry,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
} from "../controllers/journalController.js";

const router = Router();

router.get("/", getJournalEntries);
router.get("/activity", getJournalActivity);
router.get("/activity/first", getFirstJournalActivity);
router.get("/:id", getJournalEntry);
router.post("/", createJournalEntry);
router.put("/:id", updateJournalEntry);
router.delete("/:id", deleteJournalEntry);

export default router;