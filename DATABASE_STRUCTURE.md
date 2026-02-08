# DynamoDB Database Structure - Dharmadeshana Platform

## Overview
The platform uses AWS DynamoDB with 6 tables to manage authentication, events, danweem (announcements), and contact messages.

---

## 1. `otp_codes` Table
**Purpose:** Store OTP codes for phone-based authentication

| Attribute | Type | Description |
|-----------|------|-------------|
| **phoneNumber** (PK) | String | User's phone number (Primary Key) |
| otp | String | 6-digit OTP code |
| expiresAt | Number | Unix timestamp when OTP expires |
| createdAt | Number | Unix timestamp when created |

---

## 2. `users` Table
**Purpose:** Store registered user information

| Attribute | Type | Description |
|-----------|------|-------------|
| **phoneNumber** (PK) | String | User's phone number (Primary Key) |
| name | String | User's full name (optional) |
| email | String | User's email (optional) |
| role | String | User role: 'user' or 'admin' |
| createdAt | Number | Unix timestamp when registered |
| lastLogin | Number | Unix timestamp of last login |

---

## 3. `dharma_events` Table (events)
**Purpose:** Store dharma deshana (sermon) submissions

| Attribute | Type | Description |
|-----------|------|-------------|
| **eventId** (PK) | String | UUID (Primary Key) |
| theroName | String | Monk's name conducting the sermon |
| eventName | String | Name/title of the dharma deshana |
| date | String | Event date (YYYY-MM-DD) |
| time | String | Event time |
| venue | String | Location/venue of the event |
| imageUrl | String | URL of event poster/image |
| description | String | Detailed description |
| **sanwidanaya** | String | Event announcement/poster URL |
| **proofDocumentUrl** | String | Proof document URL (approval letter, etc.) |
| submitterPhone | String | Phone number of person who submitted |
| submitterName | String | Name of submitter |
| status | String | 'pending', 'approved', 'rejected' |
| createdAt | Number | Unix timestamp when created |
| updatedAt | Number | Unix timestamp when last updated |

**Indexes:** Status (for filtering)

---

## 4. `danweem` Table
**Purpose:** Store user-submitted danweem (dharma video/image announcements)

| Attribute | Type | Description |
|-----------|------|-------------|
| **danweemId** (PK) | String | UUID (Primary Key) |
| phoneNumber | String | Submitter's phone number |
| theroName | String | Monk's name featured in the content |
| title | String | Title of the danweem |
| description | String | Description (optional) |
| mediaType | String | 'video' or 'image' |
| mediaUrl | String | URL of video/image content |
| thumbnailUrl | String | Thumbnail URL (optional) |
| **proofDocumentUrl** | String | Proof document URL (authentication, permission) |
| status | String | 'pending', 'approved', 'rejected' |
| submittedAt | Number | Unix timestamp when submitted |
| updatedAt | Number | Unix timestamp when last updated |

**Indexes:** Status (for filtering)

---

## 5. `contact_messages` Table (Paniwida)
**Purpose:** Store contact form submissions from website visitors

| Attribute | Type | Description |
|-----------|------|-------------|
| **messageId** (PK) | String | UUID (Primary Key) |
| name | String | Sender's name |
| phoneNumber | String | Sender's phone number (optional) |
| email | String | Sender's email (optional) |
| subject | String | Message subject/topic (optional) |
| message | String | Full message text |
| status | String | 'pending', 'replied', 'resolved' |
| submittedAt | Number | Unix timestamp when submitted |
| updatedAt | Number | Unix timestamp when status changed |

**Indexes:** Status (for filtering)

---

## 6. `user_media` Table (Legacy - may be replaced)
**Purpose:** Store user-uploaded media (being replaced by danweem)

| Attribute | Type | Description |
|-----------|------|-------------|
| **mediaId** (PK) | String | UUID (Primary Key) |
| phoneNumber | String | Uploader's phone number |
| type | String | 'video' or 'image' |
| category | String | 'dharma_deshana' or 'idiri_deshana' |
| title | String | Media title |
| theroName | String | Monk's name (optional) |
| url | String | Media URL |
| description | String | Description (optional) |
| uploadedAt | Number | Unix timestamp when uploaded |

---

## API Endpoints

### Events (Deshana)
- `POST /api/events` - Submit new event (authenticated, requires proofDocumentUrl & sanwidanaya)
- `GET /api/events/approved` - Get approved events (public)
- `GET /api/events/user` - Get user's submitted events (authenticated)

### Danweem
- `POST /api/danweem` - Submit danweem (authenticated, requires proofDocumentUrl)
- `GET /api/danweem/approved` - Get approved danweem (public)
- `GET /api/danweem/my-danweem` - Get user's danweem (authenticated)
- `GET /api/danweem/admin/pending` - Get pending danweem (admin)
- `PATCH /api/danweem/:id/approve` - Approve danweem (admin)
- `PATCH /api/danweem/:id/reject` - Reject danweem (admin)
- `DELETE /api/danweem/:id` - Delete danweem (authenticated)

### Contact Messages (Paniwida)
- `POST /api/contact` - Submit contact message (public)
- `GET /api/contact/admin/all` - Get all messages (admin)
- `GET /api/contact/admin/pending` - Get pending messages (admin)
- `PATCH /api/contact/:id/status` - Update message status (admin)
- `DELETE /api/contact/:id` - Delete message (admin)

---

## Status Flow

### Events & Danweem:
1. User submits → status = 'pending'
2. Admin reviews in dashboard
3. Admin approves → status = 'approved' → displays on home page
4. Admin rejects → status = 'rejected' → hidden from public

### Contact Messages:
1. Visitor submits → status = 'pending'
2. Admin views in dashboard
3. Admin marks as 'replied' → after responding to user
4. Admin marks as 'resolved' → after issue is closed
5. Admin can delete old messages

---

## Admin Dashboard Tabs

1. **අනුමැතිය සඳහා** (Pending Events) - Approve/reject deshana submissions
2. **අනුමත කළ දේශනා** (Approved Events) - View/manage approved events
3. **දන්වීම්** (Danweem) - Approve/reject danweem submissions
4. **පණිවිඩ** (Contact Messages) - View/reply to contact form messages

---

## Security Notes

- All admin routes protected with JWT authentication
- Phone-based OTP authentication (6 digits, 5 min expiry)
- Proof documents required for verification before approval
- Status-based access control (only approved content visible publicly)
- DynamoDB tables use PAY_PER_REQUEST billing mode

---

## File Upload Recommendations

For proofDocumentUrl, sanwidanaya, imageUrl, mediaUrl fields:
- Use AWS S3 for file storage
- Or use third-party services: Cloudinary, Imgur, Google Drive (public links)
- Accept direct URLs from users (YouTube, Facebook for videos)
- Validate file types on frontend before upload
- Suggested file types:
  - Images: JPG, PNG, WebP
  - Videos: MP4, YouTube/Facebook embed URLs
  - Documents: PDF, JPG (for proof documents)
