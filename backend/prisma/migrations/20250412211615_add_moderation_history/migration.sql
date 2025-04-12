-- CreateTable
CREATE TABLE "ModerationHistory" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationHistory_targetUserId_idx" ON "ModerationHistory"("targetUserId");

-- CreateIndex
CREATE INDEX "ModerationHistory_moderatorId_idx" ON "ModerationHistory"("moderatorId");

-- AddForeignKey
ALTER TABLE "ModerationHistory" ADD CONSTRAINT "ModerationHistory_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationHistory" ADD CONSTRAINT "ModerationHistory_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
