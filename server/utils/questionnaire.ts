// Questionnaire Vote Buffers

// Map structure: questionId -> Map<optionIndex, count>
const voteBuffer = new Map<string, Map<number, number>>();
let lastVoteFlushTime = Date.now();

// Configuration
export const VOTE_FLUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Buffer a vote for a question option
 */
export function bufferVote(questionId: string, optionIndex: number) {
  if (!voteBuffer.has(questionId)) {
    voteBuffer.set(questionId, new Map<number, number>());
  }
  
  const questionVotes = voteBuffer.get(questionId)!;
  const currentCount = questionVotes.get(optionIndex) || 0;
  questionVotes.set(optionIndex, currentCount + 1);
}

/**
 * Get buffer statistics
 */
export function getQuestionnaireBufferStats() {
  let totalBufferedVotes = 0;
  for (const questionVotes of voteBuffer.values()) {
    for (const count of questionVotes.values()) {
      totalBufferedVotes += count;
    }
  }
  
  return {
    questions: voteBuffer.size,
    totalBuffered: totalBufferedVotes,
    lastFlush: lastVoteFlushTime,
    nextFlushEstimate: lastVoteFlushTime + VOTE_FLUSH_INTERVAL
  };
}

/**
 * Flush buffered votes to database
 */
export async function flushVotes(db: any) {
  if (voteBuffer.size === 0) return 0;
  
  lastVoteFlushTime = Date.now();
  
  const entries: Array<{ questionId: string; optionIndex: number; count: number }> = [];
  
  // Collect all buffered votes
  for (const [questionId, optionVotes] of voteBuffer.entries()) {
    for (const [optionIndex, count] of optionVotes.entries()) {
      entries.push({ questionId, optionIndex, count });
    }
  }
  
  // Clear buffer
  voteBuffer.clear();
  
  try {
    // Update question_results table
    const updateStmt = db.prepare(`
      INSERT INTO question_results (question_id, option1_count, option2_count, option3_count, option4_count, total_votes, last_updated)
      VALUES (?, 0, 0, 0, 0, 0, unixepoch())
      ON CONFLICT(question_id) DO UPDATE SET last_updated = unixepoch()
    `);
    
    // Get unique question IDs
    const questionIds = [...new Set(entries.map(e => e.questionId))];
    const updateBatch = questionIds.map(id => updateStmt.bind(id));
    await db.batch(updateBatch);
    
    // Update counts for each option
    for (const entry of entries) {
      const optionColumn = `option${entry.optionIndex}_count`;
      await db.prepare(`
        UPDATE question_results 
        SET ${optionColumn} = ${optionColumn} + ?, 
            total_votes = total_votes + ?,
            last_updated = unixepoch()
        WHERE question_id = ?
      `).bind(entry.count, entry.count, entry.questionId).run();
    }
    
    return entries.length;
  } catch (e) {
    // Restore buffer on failure
    for (const entry of entries) {
      if (!voteBuffer.has(entry.questionId)) {
        voteBuffer.set(entry.questionId, new Map<number, number>());
      }
      const questionVotes = voteBuffer.get(entry.questionId)!;
      const currentCount = questionVotes.get(entry.optionIndex) || 0;
      questionVotes.set(entry.optionIndex, currentCount + entry.count);
    }
    throw e;
  }
}

/**
 * Check if flush is needed and execute if so
 */
export async function checkAndFlushVotes(db: any, context: any) {
  const now = Date.now();
  
  // Count total buffered votes
  let totalBufferedVotes = 0;
  for (const questionVotes of voteBuffer.values()) {
    for (const count of questionVotes.values()) {
      totalBufferedVotes += count;
    }
  }
  
  // Flush if threshold reached or interval elapsed
  if (totalBufferedVotes > 0 && ((now - lastVoteFlushTime) >= VOTE_FLUSH_INTERVAL)) {
    const p = flushVotes(db);
    if (context?.waitUntil) {
      context.waitUntil(p);
    } else {
      p.catch(console.error);
    }
  }
}
