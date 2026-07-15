-- CreateIndex
CREATE INDEX "likes_commentId_createdAt_idx" ON "likes"("commentId", "createdAt" DESC);
