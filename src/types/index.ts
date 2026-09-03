// TODO:
// Define TypeScript types and interfaces used by the frontend.
//
// Include:
//
// User
// - id
// - name
// - email
// - image
// - createdAt
//
// Project
// - id
// - name
// - description
// - userId
// - createdAt
// - updatedAt
//
// DocumentStatus
// - PENDING
// - PROCESSING
// - READY
// - FAILED
//
// Document
// - id
// - projectId
// - userId
// - fileName
// - fileSize
// - mimeType
// - status
// - error
// - chunkCount
// - createdAt
//
// Chat
// - id
// - projectId
// - userId
// - title
// - createdAt
// - updatedAt
//
// MessageRole
// - USER
// - ASSISTANT
//
// Message
// - id
// - chatId
// - role
// - content
// - sources
// - createdAt
//
// Requirements:
// - Keep types frontend-friendly.
// - Do not import Prisma types.
// - Keep this independent from the backend implementation.