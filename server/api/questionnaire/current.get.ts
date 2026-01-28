import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  let db;
  try {
    db = getDB(event);
  } catch (e: any) {
    // If database binding not available (e.g., client-side fetch), return null gracefully
    console.warn('[Questionnaire] Database binding not available:', e.message);
    return null;
  }
  
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Get active question that hasn't expired
    const question = await db.prepare(`
      SELECT * FROM daily_questions 
      WHERE is_active = 1 AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(now).first();
    
    if (!question) {
      // Check for queued questions to auto-activate
      const queuedQuestion = await db.prepare(`
        SELECT * FROM daily_questions 
        WHERE auto_activate = 1 AND is_active = 0 AND duration IS NOT NULL
        ORDER BY queue_order ASC, created_at ASC
        LIMIT 1
      `).first();
      
      if (queuedQuestion) {
        // Calculate expiration based on duration
        const expiresAt = now + queuedQuestion.duration;
        await db.prepare(`
          UPDATE daily_questions 
          SET is_active = 1, expires_at = ?
          WHERE id = ?
        `).bind(expiresAt, queuedQuestion.id).run();
        
        // Return the newly activated question
        const activated = await db.prepare(`
          SELECT * FROM daily_questions WHERE id = ?
        `).bind(queuedQuestion.id).first();
        
        const options = [
          activated.option1,
          activated.option2,
          activated.option3,
          activated.option4
        ].filter(Boolean);
        
        return {
          id: activated.id,
          question: activated.question,
          options,
          cover_image: activated.cover_image,
          expires_at: activated.expires_at,
          created_at: activated.created_at
        };
      }
      
      return null;
    }
    
    // Double-check expiration
    if (question.expires_at <= now) {
      await db.prepare('UPDATE daily_questions SET is_active = 0 WHERE id = ?')
        .bind(question.id).run();
      
      // Try to activate next queued question
      const queuedQuestion = await db.prepare(`
        SELECT * FROM daily_questions 
        WHERE auto_activate = 1 AND is_active = 0 AND duration IS NOT NULL
        ORDER BY queue_order ASC, created_at ASC
        LIMIT 1
      `).first();
      
      if (queuedQuestion) {
        const expiresAt = now + queuedQuestion.duration;
        await db.prepare(`
          UPDATE daily_questions 
          SET is_active = 1, expires_at = ?
          WHERE id = ?
        `).bind(expiresAt, queuedQuestion.id).run();
        
        const activated = await db.prepare(`
          SELECT * FROM daily_questions WHERE id = ?
        `).bind(queuedQuestion.id).first();
        
        const options = [
          activated.option1,
          activated.option2,
          activated.option3,
          activated.option4
        ].filter(Boolean);
        
        return {
          id: activated.id,
          question: activated.question,
          options,
          cover_image: activated.cover_image,
          expires_at: activated.expires_at,
          created_at: activated.created_at
        };
      }
      
      return null;
    }
    
    // Build options array (only include non-null options)
    const options = [
      question.option1,
      question.option2,
      question.option3,
      question.option4
    ].filter(Boolean);
    
    return {
      id: question.id,
      question: question.question,
      options,
      cover_image: question.cover_image,
      expires_at: question.expires_at,
      created_at: question.created_at
    };
  } catch (e: any) {
    throw createError({ statusCode: 500, message: 'Failed to get current question', cause: e });
  }
});
