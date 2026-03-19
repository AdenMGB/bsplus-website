//#region server/utils/questionnaire.ts
var voteBuffer = /* @__PURE__ */ new Map();
var lastVoteFlushTime = Date.now();
var VOTE_FLUSH_INTERVAL = 300 * 1e3;
/**
* Get buffer statistics
*/
function getQuestionnaireBufferStats() {
	let totalBufferedVotes = 0;
	for (const questionVotes of voteBuffer.values()) for (const count of questionVotes.values()) totalBufferedVotes += count;
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
async function flushVotes(db) {
	if (voteBuffer.size === 0) return 0;
	lastVoteFlushTime = Date.now();
	const entries = [];
	for (const [questionId, optionVotes] of voteBuffer.entries()) for (const [optionIndex, count] of optionVotes.entries()) entries.push({
		questionId,
		optionIndex,
		count
	});
	voteBuffer.clear();
	try {
		const updateStmt = db.prepare(`
      INSERT INTO question_results (question_id, option1_count, option2_count, option3_count, option4_count, total_votes, last_updated)
      VALUES (?, 0, 0, 0, 0, 0, unixepoch())
      ON CONFLICT(question_id) DO UPDATE SET last_updated = unixepoch()
    `);
		const updateBatch = [...new Set(entries.map((e) => e.questionId))].map((id) => updateStmt.bind(id));
		await db.batch(updateBatch);
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
		for (const entry of entries) {
			if (!voteBuffer.has(entry.questionId)) voteBuffer.set(entry.questionId, /* @__PURE__ */ new Map());
			const questionVotes = voteBuffer.get(entry.questionId);
			const currentCount = questionVotes.get(entry.optionIndex) || 0;
			questionVotes.set(entry.optionIndex, currentCount + entry.count);
		}
		throw e;
	}
}
//#endregion
export { getQuestionnaireBufferStats as n, flushVotes as t };
