import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '../../../test/utils.js'
import { PostCard } from '../PostCard.js'
import type { Post } from '../../../types/index.js'

// ── Mock heavy dependencies ───────────────────────────────────────────────────

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: {
      id: 'viewer-001',
      name: 'Viewer User',
      email: 'viewer@geu.ac.in',
      role: 'STUDENT',
    },
  }),
}))

vi.mock('../../../hooks/useReactions.js', () => ({
  useTogglePostReaction: () => ({ mutate: vi.fn() }),
}))

vi.mock('../../../hooks/usePosts.js', () => ({
  useDeletePost: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../../../features/posts/CommentThread.js', () => ({
  CommentThread: () => <div data-testid="comment-thread">Comments</div>,
}))

// ── Test fixture ──────────────────────────────────────────────────────────────

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id:        'post-001',
  title:     'Test Discussion Post',
  content:   'This is the body content of the test post.',
  type:      'DISCUSSION',
  viewCount: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  author: {
    id:        'author-001',
    name:      'Author User',
    avatarUrl: null,
    role:      'STUDENT',
    college:   'Graphic Era University (GEU)',
  },
  tags:   [],
  media:  [],
  _count: { reactions: 5, comments: 3 },
  ...overrides,
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PostCard', () => {
  it('renders the post title and content', () => {
    render(<PostCard post={makePost()} />)

    expect(screen.getByText('Test Discussion Post')).toBeInTheDocument()
    expect(screen.getByText('This is the body content of the test post.')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    render(<PostCard post={makePost()} />)
    expect(screen.getByText('Author User')).toBeInTheDocument()
  })

  it('renders the correct post type badge', () => {
    render(<PostCard post={makePost({ type: 'QUESTION' })} />)
    expect(screen.getByText('Question')).toBeInTheDocument()
  })

  it('renders reaction count', () => {
    render(<PostCard post={makePost({ _count: { reactions: 7, comments: 2 } })} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders comment count', () => {
    render(<PostCard post={makePost({ _count: { reactions: 0, comments: 4 } })} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows author avatar fallback initial when no avatarUrl', () => {
    render(<PostCard post={makePost({ author: { id: 'a1', name: 'Rajat Kumar', avatarUrl: null, role: 'STUDENT', college: null } })} />)
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('does NOT show delete button for non-owner', () => {
    // viewer-001 is the logged-in user, author is author-001
    render(<PostCard post={makePost()} />)
    expect(screen.queryByLabelText('Delete post')).not.toBeInTheDocument()
  })

  it('shows delete button when the logged-in user is the author', () => {
    const ownPost = makePost({
      author: { id: 'viewer-001', name: 'Viewer User', avatarUrl: null, role: 'STUDENT', college: null },
    })
    render(<PostCard post={ownPost} />)
    expect(screen.getByLabelText('Delete post')).toBeInTheDocument()
  })

  it('toggles the comment thread on clicking the comment button', () => {
    render(<PostCard post={makePost()} />)

    expect(screen.queryByTestId('comment-thread')).not.toBeInTheDocument()

    // Click the comment button (contains the comment count)
    const commentBtn = screen.getByRole('button', { name: /3/i })
    fireEvent.click(commentBtn)

    expect(screen.getByTestId('comment-thread')).toBeInTheDocument()
  })

  it('renders a View → link pointing to /post/:id', () => {
    render(<PostCard post={makePost({ id: 'abc-123' })} />)
    const link = screen.getByText('View →')
    expect(link.closest('a')).toHaveAttribute('href', '/post/abc-123')
  })

  it('shows college info in the author meta line', () => {
    render(<PostCard post={makePost()} />)
    expect(screen.getByText(/Graphic Era University/)).toBeInTheDocument()
  })

  it('truncates long content with an ellipsis', () => {
    const longContent = 'A'.repeat(400)
    render(<PostCard post={makePost({ content: longContent })} />)
    const text = screen.getByText(/A{1,300}…/)
    expect(text).toBeInTheDocument()
  })
})
