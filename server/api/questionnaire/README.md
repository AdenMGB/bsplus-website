# Daily Questionnaire API Documentation

API endpoints for managing daily voting questions.

## Base URL
All endpoints are prefixed with `/api/questionnaire`

## Authentication
Most endpoints require authentication via OAuth cookie (`auth_token`). Admin endpoints require `is_admin === 1`.

## Endpoints

### GET `/api/questionnaire/current`
Get the currently active question.

**Authentication:** None (public)

**Response:**
```json
{
  "id": "uuid",
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "cover_image": "/api/images/key.jpg",
  "expires_at": 1704067200,
  "created_at": 1703980800
}
```

Returns `null` if no active question exists.

---

### POST `/api/questionnaire/vote`
Submit a vote for a question option.

**Authentication:** Required

**Request Body:**
```json
{
  "questionId": "uuid",
  "optionIndex": 1
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Codes:**
- `400` - Invalid request, question expired, or already voted
- `401` - Unauthorized
- `404` - Question not found

---

### GET `/api/questionnaire/has-voted`
Check if the current user has voted on a question.

**Authentication:** Required

**Query Parameters:**
- `questionId` (required) - UUID of the question

**Response:**
```json
{
  "hasVoted": true
}
```

---

### GET `/api/questionnaire/results`
Get voting results for a question (only available after voting).

**Authentication:** Required

**Query Parameters:**
- `questionId` (required) - UUID of the question

**Response:**
```json
{
  "questionId": "uuid",
  "totalVotes": 150,
  "options": [
    {
      "index": 1,
      "text": "Red",
      "count": 50,
      "percentage": 33
    },
    {
      "index": 2,
      "text": "Blue",
      "count": 75,
      "percentage": 50
    },
    {
      "index": 3,
      "text": "Green",
      "count": 25,
      "percentage": 17
    }
  ]
}
```

**Error Codes:**
- `403` - User has not voted on this question
- `404` - Question not found

---

### GET `/api/questionnaire`
Get all questions (admin only).

**Authentication:** Admin required

**Response:**
```json
[
  {
    "id": "uuid",
    "question": "What is your favorite color?",
    "options": ["Red", "Blue", "Green"],
    "cover_image": "/api/images/key.jpg",
    "expires_at": 1704067200,
    "expires_at_acst": "2024-01-01T14:30:00",
    "expires_at_formatted": "1 Jan 2024, 14:30 ACST",
    "timezone_label": "ACST",
    "is_expired": false,
    "created_at": 1703980800,
    "is_active": true,
    "total_votes": 150,
    "queue_order": 1,
    "auto_activate": true,
    "duration": 259200,
    "vote_counts": {
      "option1": 50,
      "option2": 75,
      "option3": 25,
      "option4": 0
    }
  }
]
```

---

### GET `/api/questionnaire/[id]`
Get a single question by ID (admin only).

**Authentication:** Admin required

**Response:** Same format as array item in GET `/api/questionnaire`

---

### POST `/api/questionnaire/create`
Create a new question (admin only).

**Authentication:** Admin required

**Request Body (Queue-based):**
```json
{
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "duration": 259200,
  "auto_activate": true,
  "queue_order": 1,
  "cover_image": "/api/images/key.jpg"
}
```

**Request Body (Manual - deprecated, use queue-based):**
```json
{
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "expiresAt": "2024-01-01T14:30:00",
  "cover_image": "/api/images/key.jpg"
}
```

**Notes:**
- Queue-based (recommended):
  - `duration` - Duration in seconds (e.g., 259200 for 3 days)
  - `auto_activate` - Set to `true` for queue-based questions
  - `queue_order` - Order in queue (auto-calculated if not provided)
  - Question will auto-activate when previous question expires
- Manual (deprecated):
  - `expiresAt` must be in ACST timezone format: `YYYY-MM-DDTHH:mm:ss`
  - Automatically deactivates previous active question
- `options` must be an array with 2-4 items
- `cover_image` is optional

**Response:** Created question object (same format as GET `/api/questionnaire/[id]`)

---

### PUT `/api/questionnaire/[id]`
Update a question (admin only).

**Authentication:** Admin required

**Request Body:**
```json
{
  "question": "Updated question text",
  "options": ["Option 1", "Option 2"],
  "expiresAt": "2024-01-01T14:30:00",
  "duration": 259200,
  "auto_activate": true,
  "queue_order": 1,
  "cover_image": "/api/images/new-key.jpg",
  "is_active": true
}
```

**Notes:**
- All fields are optional
- `expiresAt` must be in ACST timezone format if provided (for manual questions)
- `duration` - Duration in seconds (for queue-based questions)
- `auto_activate` - Set to `true` for queue-based questions
- `queue_order` - Order in queue
- Old cover image is automatically deleted if changed
- If activating a question, other active questions are automatically deactivated

**Response:** Updated question object

---

### DELETE `/api/questionnaire/[id]`
Delete a question and all associated votes (admin only).

**Authentication:** Admin required

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Also deletes cover image from R2 if exists
- Deletes all votes and results for this question

---

### POST `/api/questionnaire/sync-votes`
Manually flush buffered votes to database (admin only).

**Authentication:** Admin required

**Response:**
```json
{
  "success": true,
  "flushed": 42
}
```

**Notes:**
- Forces immediate flush of all buffered votes
- Useful for testing or ensuring votes are persisted immediately

---

### POST `/api/questionnaire/reorder`
Reorder queued questions (admin only).

**Authentication:** Admin required

**Request Body:**
```json
{
  "questionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Updates `queue_order` based on array position
- First item in array gets `queue_order = 1`, second gets `2`, etc.

---

### POST `/api/questionnaire/cleanup-images`
Clean up cover images older than 30 days (admin or cron trigger).

**Authentication:** Admin required (or cron trigger via `cf-cron` header)

**Response:**
```json
{
  "success": true,
  "deleted": 5,
  "errors": 0,
  "total": 5
}
```

**Notes:**
- Can be triggered manually by admin
- Automatically triggered daily via Cloudflare Cron Trigger at 2 AM UTC

## Timezone Handling

All expiration dates are stored in UTC Unix timestamps in the database. The API accepts and returns dates in Australian Central Standard Time (ACST/ACDT) format for admin convenience.

- **Input:** ACST datetime string (`YYYY-MM-DDTHH:mm:ss`)
- **Storage:** UTC Unix timestamp (seconds)
- **Output:** ACST formatted string and UTC timestamp

The timezone automatically handles daylight saving time transitions (ACST ↔ ACDT).

## Queue System

Questions can be created as queue-based or manual:

- **Queue-based (recommended):** Questions are queued and automatically activate when the previous question expires. Use `duration` (in seconds) and `auto_activate: true`.
- **Manual:** Questions activate immediately with a specific expiration time. Use `expiresAt` in ACST format.

Queue-based questions are ordered by `queue_order` and activate sequentially. The current active question is shown first, followed by the next queued question.

## Vote Caching

Votes are cached in server memory and flushed to the database every 5 minutes or when a threshold is reached. This improves performance and reduces database writes. Admins can manually sync votes using the `/api/questionnaire/sync-votes` endpoint.

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Detailed error message"
}
```
