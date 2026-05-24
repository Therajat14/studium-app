// ─── User ──────────────────────────────────────────────────────────────────

export type Role = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN'

export interface UserLinks {
  github?: string | null
  linkedin?: string | null
  portfolio?: string | null
  twitter?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  college: string | null
  branch: string | null
  year: number | null
  bio: string | null
  avatarUrl: string | null
  skills: string[]
  karma: number
  rollNumber: string | null
  createdAt: string
}

// Richer profile returned by GET /users/:id (includes social counts + links)
export interface UserProfile extends User {
  links: UserLinks | null
  _count: {
    followers: number
    following: number
  }
}

// ─── Post ──────────────────────────────────────────────────────────────────

export type PostType = 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT' | 'RESOURCE'
export type ReactionType = 'LIKE' | 'UPVOTE'
export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF' | 'DOCUMENT'

export interface PostAuthor {
  id: string
  name: string
  avatarUrl: string | null
  role: Role
  college: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Media {
  id: string
  url: string
  resourceType: MediaType
  bytes: number
  originalName: string
}

export interface Post {
  id: string
  title: string | null
  content: string
  type: PostType
  viewCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: PostAuthor
  tags: Array<{ tag: Tag }>
  media: Media[]
  _count: { reactions: number; comments: number }
}

// ─── Comment ───────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: PostAuthor
  _count: { reactions: number; replies: number }
  replies?: Comment[]
}

// ─── Feed ──────────────────────────────────────────────────────────────────

export type FeedSort = 'latest' | 'trending' | 'following'

export interface FeedResponse {
  items: Post[]
  nextCursor: string | null
  hasMore: boolean
  sort: string
}

// ─── Reaction ──────────────────────────────────────────────────────────────

export interface ReactionResult {
  reacted: boolean
  type: ReactionType
  counts: Record<ReactionType, number>
}

// ─── Notifications ─────────────────────────────────────────────────────────

export type NotificationType =
  | 'COMMENT'
  | 'REPLY'
  | 'FOLLOW'
  | 'POST_REACTION'
  | 'COMMENT_REACTION'

export interface NotificationActor {
  id:       string
  name:     string
  avatarUrl: string | null
}

export interface Notification {
  id:         string
  type:       NotificationType
  entityId:   string
  entityType: string
  readAt:     string | null
  createdAt:  string
  actor:      NotificationActor
}

export interface NotificationsResponse {
  items:      Notification[]
  nextCursor: string | null
  unread:     number
}

// ─── Messaging ─────────────────────────────────────────────────────────────

export interface MessageSender {
  id:       string
  name:     string
  avatarUrl: string | null
}

export interface Message {
  id:        string
  content:   string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  sender:    MessageSender
}

export interface ConversationParticipant {
  id:         string
  userId:     string
  joinedAt:   string
  lastReadAt: string | null
  user:       MessageSender & { role: Role }
}

export interface Conversation {
  id:           string
  isGroup:      boolean
  name:         string | null
  createdAt:    string
  updatedAt:    string
  participants: ConversationParticipant[]
  messages:     Message[] // last message only
}

export interface MessagesResponse {
  items:      Message[]
  nextCursor: string | undefined
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ─── API response envelope ─────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: { message: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string
  user: User
}

// ─── Knowledge ─────────────────────────────────────────────────────────────

export type ResourceType = 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'DOCUMENT' | 'OTHER'

export interface ResourceAuthor {
  id: string
  name: string
  avatarUrl: string | null
}

export interface Resource {
  id: string
  title: string
  description: string | null
  type: ResourceType
  url: string
  subject: string | null
  course: string | null
  tags: string[]
  downloads: number
  avgRating: number | null
  isBookmarked: boolean
  uploadedBy: ResourceAuthor
  createdAt: string
  updatedAt: string
}

export interface ResourceListResponse {
  items: Resource[]
  total: number
  page: number
}

// ─── Q&A ───────────────────────────────────────────────────────────────────

export type QuestionDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface QnaAuthor {
  id: string
  name: string
  avatarUrl: string | null
  karma: number
}

export interface QnaAnswer {
  id: string
  content: string
  isAccepted: boolean
  voteCount: number
  userVote: 'UP' | 'DOWN' | null
  author: QnaAuthor
  createdAt: string
}

export interface QnaQuestion {
  id: string
  title: string
  content: string
  tags: string[]
  difficulty: QuestionDifficulty
  voteCount: number
  userVote: 'UP' | 'DOWN' | null
  bounty: number
  views: number
  isBookmarked: boolean
  isClosed: boolean
  author: QnaAuthor
  answers: QnaAnswer[]
  _count: { answers: number }
  createdAt: string
}

export interface QnaListResponse {
  items: QnaQuestion[]
  total: number
  page: number
}

// ─── Opportunities ─────────────────────────────────────────────────────────

export type OpportunityType = 'JOB' | 'INTERNSHIP' | 'HACKATHON' | 'EVENT' | 'SCHOLARSHIP' | 'PROJECT'

export interface OpportunityPoster {
  id: string
  name: string
  avatarUrl: string | null
  role: Role
}

export interface Opportunity {
  id: string
  title: string
  description: string
  type: OpportunityType
  company: string | null
  location: string | null
  salary: string | null
  requirements: string[]
  tags: string[]
  deadline: string | null
  eventDate: string | null
  url: string | null
  maxAttendees: number | null
  postedBy: OpportunityPoster
  createdAt: string
}

export interface OpportunityListResponse {
  items: Opportunity[]
  total: number
  page: number
}

// ─── Campus ────────────────────────────────────────────────────────────────

export type ReviewCategory = 'FACULTY' | 'COURSE' | 'FACILITY' | 'FOOD' | 'TRANSPORT' | 'OTHER'

export interface ReviewAuthor {
  id: string
  name: string
  avatarUrl: string | null
  branch: string | null
  year: number | null
}

export interface CampusReview {
  id: string
  category: ReviewCategory
  title: string
  content: string
  rating: number
  helpful: number
  notHelpful: number
  userVote: boolean | null
  author: ReviewAuthor
  createdAt: string
}

export interface CampusListResponse {
  items: CampusReview[]
  total: number
  page: number
}

// ─── Lost & Found ──────────────────────────────────────────────────────────

export type LostFoundType     = 'LOST' | 'FOUND'
export type LostFoundCategory = 'ELECTRONICS' | 'DOCUMENTS' | 'CLOTHING' | 'ACCESSORIES' | 'BOOKS' | 'KEYS' | 'BAGS' | 'OTHER'
export type LostFoundStatus   = 'OPEN' | 'RESOLVED'

export interface LostFoundAuthor {
  id: string
  name: string
  avatarUrl: string | null
  branch: string | null
  year: number | null
}

export interface LostFoundClaim {
  id: string
  message: string
  user: LostFoundAuthor
  createdAt: string
}

export interface LostFoundItem {
  id: string
  type: LostFoundType
  category: LostFoundCategory
  title: string
  description: string
  location: string | null
  imageUrl: string | null
  contactInfo: string | null
  status: LostFoundStatus
  author: LostFoundAuthor
  claims?: LostFoundClaim[]
  _count: { claims: number }
  createdAt: string
  updatedAt: string
}

export interface LostFoundListResponse {
  items: LostFoundItem[]
  total: number
  page: number
}
