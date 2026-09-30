-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_date_key" ON "JournalEntry"("date");
