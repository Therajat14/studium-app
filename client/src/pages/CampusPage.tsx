import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star, Search, Filter, Plus, ThumbsUp, ThumbsDown, X,
  Coffee, Book, Home, Utensils, Car, MapPin,
} from 'lucide-react'
import { campusApi } from '../api/campus.js'
import type { CampusReview, ReviewCategory } from '../types/index.js'
import type { CreateReviewPayload } from '../api/campus.js'

const CATEGORY_CONFIG: Record<ReviewCategory, { label: string; icon: React.ElementType; color: string }> = {
  FACULTY:   { label: 'Faculty', icon: Book, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  COURSE:    { label: 'Course', icon: Book, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
  FACILITY:  { label: 'Facility', icon: Home, color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
  FOOD:      { label: 'Food', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  TRANSPORT: { label: 'Transport', icon: Car, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' },
  OTHER:     { label: 'Other', icon: MapPin, color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' },
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(n)}
          className={`h-5 w-5 transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'} ${n <= value ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
        >
          <Star className="h-full w-full fill-current" />
        </button>
      ))}
    </div>
  )
}

export default function CampusPage() {
  const qc = useQueryClient()
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['campus', category, search],
    queryFn: () => campusApi.list({ category: category || undefined, search: search || undefined, limit: 30 }),
    staleTime: 60_000,
  })

  const voteMutation = useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) => campusApi.vote(id, helpful),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['campus'] }),
  })

  const items = data?.items ?? []

  const categories: Array<{ key: string; label: string }> = [
    { key: '', label: 'All' },
    ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Campus Life</h2>
          <p className="text-muted-foreground">Reviews and tips about campus experiences</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full lg:w-auto justify-center"
        >
          <Plus className="h-5 w-5" /> Write Review
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">Share your campus experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((review: CampusReview) => {
            const cfg = CATEGORY_CONFIG[review.category]
            const Icon = cfg.icon
            return (
              <div key={review.id} className="bg-card border rounded-xl p-5 hover:border-border/80 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{review.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <StarRating value={review.rating} />
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">{review.content}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {review.author.name[0]}
                        </div>
                        <span>{review.author.name}</span>
                        {review.author.branch && (
                          <span>• {review.author.branch} {review.author.year ? `Year ${review.author.year}` : ''}</span>
                        )}
                        <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Helpful?</span>
                        <button
                          onClick={() => voteMutation.mutate({ id: review.id, helpful: true })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                            review.userVote === true
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-300 dark:border-green-700'
                              : 'hover:bg-accent border-border text-muted-foreground'
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> {review.helpful}
                        </button>
                        <button
                          onClick={() => voteMutation.mutate({ id: review.id, helpful: false })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                            review.userVote === false
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-300 dark:border-red-700'
                              : 'hover:bg-accent border-border text-muted-foreground'
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> {review.notHelpful}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <ReviewModal onClose={() => setShowModal(false)} onCreated={() => {
        void qc.invalidateQueries({ queryKey: ['campus'] })
        setShowModal(false)
      }} />}
    </div>
  )
}

function ReviewModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateReviewPayload>({
    category: 'FACULTY', title: '', content: '', rating: 0,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateReviewPayload) => campusApi.create(payload),
    onSuccess: onCreated,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating === 0) return
    createMutation.mutate(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">Write a Review</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title *</label>
            <input
              required type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Prof. Smith - Machine Learning"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Rating *</label>
            <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            {form.rating === 0 && <p className="text-xs text-muted-foreground mt-1">Click a star to rate</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Review *</label>
            <textarea
              required value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Share your experience..."
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">Failed to submit review. Please try again.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={createMutation.isPending || form.rating === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
