import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  HelpCircle, MessageCircle, TrendingUp, TrendingDown, Award,
  Clock, Tag, Search, Plus, CheckCircle,
  ChevronDown, ChevronUp, X,
} from 'lucide-react'
import { qnaApi } from '../api/qna.js'
import { useAuth } from '../hooks/useAuth.js'
import type { QnaQuestion, QnaAnswer } from '../types/index.js'
import type { CreateQuestionPayload } from '../api/qna.js'

type QnaFilter = 'latest' | 'trending' | 'unanswered' | 'bounty'

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  INTERMEDIATE: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  ADVANCED: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
}

export default function QnaPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<QnaFilter>('latest')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['qna', filter, search],
    queryFn: () => qnaApi.list({ filter, search: search || undefined, limit: 20 }),
    staleTime: 30_000,
  })

  const voteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'UP' | 'DOWN' }) => qnaApi.vote(id, type),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['qna'] }),
  })

  const items = data?.items ?? []

  const filters: { key: QnaFilter; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'trending', label: 'Trending' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'bounty', label: 'Bounty' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Q&A Hub</h2>
          <p className="text-muted-foreground">Ask questions, share knowledge, earn karma</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full lg:w-auto justify-center"
        >
          <Plus className="h-5 w-5" /> Ask Question
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-card text-primary border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No questions yet</h3>
          <p className="text-muted-foreground">Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((q: QnaQuestion) => (
            <QuestionCard
              key={q.id}
              question={q}
              expanded={expandedId === q.id}
              onExpand={() => setExpandedId(expandedId === q.id ? null : q.id)}
              onVote={(type) => voteMutation.mutate({ id: q.id, type })}
            />
          ))}
        </div>
      )}

      {showModal && <AskModal onClose={() => setShowModal(false)} onCreated={() => {
        void qc.invalidateQueries({ queryKey: ['qna'] })
        setShowModal(false)
      }} />}
    </div>
  )
}

function QuestionCard({
  question, expanded, onExpand, onVote,
}: {
  question: QnaQuestion
  expanded: boolean
  onExpand: () => void
  onVote: (type: 'UP' | 'DOWN') => void
}) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [answerText, setAnswerText] = useState('')
  const [showAnswerForm, setShowAnswerForm] = useState(false)

  const { data: detail } = useQuery({
    queryKey: ['qna', question.id],
    queryFn: () => qnaApi.getById(question.id),
    enabled: expanded,
    staleTime: 30_000,
  })

  const answerMutation = useMutation({
    mutationFn: (content: string) => qnaApi.createAnswer(question.id, { content }),
    onSuccess: () => {
      setAnswerText('')
      setShowAnswerForm(false)
      void qc.invalidateQueries({ queryKey: ['qna', question.id] })
      void qc.invalidateQueries({ queryKey: ['qna'] })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: (answerId: string) => qnaApi.acceptAnswer(answerId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['qna', question.id] }),
  })

  const answers: QnaAnswer[] = detail?.answers ?? question.answers ?? []

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-border/80 transition-colors">
      <div className="p-5">
        {/* Vote + title row */}
        <div className="flex gap-4">
          {/* Votes */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onVote('UP')}
              className={`p-1.5 rounded-lg transition-colors ${
                question.userVote === 'UP' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-foreground">{question.voteCount}</span>
            <button
              onClick={() => onVote('DOWN')}
              className={`p-1.5 rounded-lg transition-colors ${
                question.userVote === 'DOWN' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <TrendingDown className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              {question.hasAcceptedAnswer && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <h3 className="text-base font-semibold text-foreground leading-snug">{question.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{question.content}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              {question.difficulty && (
                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${DIFFICULTY_COLORS[question.difficulty] ?? ''}`}>
                  {question.difficulty}
                </span>
              )}
              {question.bounty > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                  <Award className="h-3 w-3" /> +{question.bounty} bounty
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {question._count.answers} answers
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {new Date(question.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  <Tag className="h-3 w-3" />{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Author + expand */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {question.author.name[0]}
            </div>
            <span className="text-xs text-muted-foreground">{question.author.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Award className="h-3 w-3 text-blue-500" />{question.author.karma}
            </span>
          </div>
          <button
            onClick={onExpand}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {expanded ? <><ChevronUp className="h-4 w-4" /> Collapse</> : <><ChevronDown className="h-4 w-4" /> {question._count.answers} Answers</>}
          </button>
        </div>
      </div>

      {/* Answers (expanded) */}
      {expanded && (
        <div className="border-t bg-muted/20 p-5 space-y-4">
          {answers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No answers yet. Be the first!</p>
          ) : (
            answers.map((a: QnaAnswer) => (
              <div key={a.id} className={`p-4 rounded-lg border ${a.isAccepted ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'bg-card border-border'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{a.voteCount}</span>
                    {a.isAccepted && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{a.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {a.author.name[0]}
                        </div>
                        <span className="text-xs text-muted-foreground">{a.author.name}</span>
                      </div>
                      {user?.id === question.author.id && !question.isClosed && !a.isAccepted && (
                        <button
                          onClick={() => acceptMutation.mutate(a.id)}
                          className="text-xs text-green-600 hover:underline flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Accept
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Answer form */}
          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + Write an answer
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                placeholder="Write your answer..."
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowAnswerForm(false); setAnswerText('') }}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => answerMutation.mutate(answerText)}
                  disabled={!answerText.trim() || answerMutation.isPending}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {answerMutation.isPending ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateQuestionPayload>({ title: '', content: '' })
  const [tagsInput, setTagsInput] = useState('')

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuestionPayload) => qnaApi.create(payload),
    onSuccess: onCreated,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    createMutation.mutate({ ...form, tags })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card">
          <h3 className="text-lg font-semibold text-foreground">Ask a Question</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What's your question?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Details *</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Provide context and details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Difficulty</label>
              <select
                value={form.difficulty ?? ''}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value || undefined })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Bounty (karma)</label>
              <input
                type="number"
                min={0}
                value={form.bounty ?? ''}
                onChange={(e) => setForm({ ...form, bounty: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="algorithms, react, database"
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">Failed to post question. Please try again.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
