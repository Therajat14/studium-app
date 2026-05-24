import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase, Calendar, MapPin, ExternalLink, Clock,
  Search, Plus, Building, GraduationCap, Code, Trophy,
  X, Trash2,
} from 'lucide-react'
import { opportunitiesApi } from '../api/opportunities.js'
import { useAuth } from '../hooks/useAuth.js'
import type { Opportunity, OpportunityType } from '../types/index.js'
import type { CreateOpportunityPayload } from '../api/opportunities.js'

const TYPE_CONFIG: Record<OpportunityType, { label: string; icon: React.ElementType; color: string }> = {
  JOB:         { label: 'Job', icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  INTERNSHIP:  { label: 'Internship', icon: GraduationCap, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' },
  HACKATHON:   { label: 'Hackathon', icon: Code, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
  EVENT:       { label: 'Event', icon: Calendar, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  SCHOLARSHIP: { label: 'Scholarship', icon: Trophy, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' },
  PROJECT:     { label: 'Project', icon: Code, color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
}

export default function OpportunitiesPage() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', typeFilter, search],
    queryFn: () => opportunitiesApi.list({ type: typeFilter || undefined, search: search || undefined, limit: 30 }),
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => opportunitiesApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })

  const items = data?.items ?? []

  const typeButtons: Array<{ key: string; label: string }> = [
    { key: '', label: 'All' },
    ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Opportunities</h2>
          <p className="text-muted-foreground">Jobs, internships, hackathons, events & more</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full lg:w-auto justify-center"
        >
          <Plus className="h-5 w-5" /> Post Opportunity
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-card border rounded-xl p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {typeButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                typeFilter === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No opportunities found</h3>
          <p className="text-muted-foreground">Be the first to post one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((opp: Opportunity) => {
            const cfg = TYPE_CONFIG[opp.type]
            const Icon = cfg.icon
            const isOwn = user?.id === opp.postedBy.id

            return (
              <div key={opp.id} className="bg-card border rounded-xl p-5 hover:border-border/80 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{opp.title}</h3>
                        {opp.company && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <Building className="h-3.5 w-3.5" /> {opp.company}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {isOwn && (
                          <button
                            onClick={() => deleteMutation.mutate(opp.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{opp.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {opp.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opp.location}</span>
                      )}
                      {opp.salary && (
                        <span className="text-green-600 font-medium">{opp.salary}</span>
                      )}
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {opp.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />{new Date(opp.eventDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {opp.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {opp.requirements.slice(0, 5).map((r: string) => (
                          <span key={r} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{r}</span>
                        ))}
                        {opp.requirements.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{opp.requirements.length - 5} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {opp.postedBy.name[0]}
                        </div>
                        <span>{opp.postedBy.name} • {opp.postedBy.role}</span>
                        <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                      </div>
                      {opp.url && (
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                        >
                          Apply <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <PostModal onClose={() => setShowModal(false)} onCreated={() => {
        void qc.invalidateQueries({ queryKey: ['opportunities'] })
        setShowModal(false)
      }} />}
    </div>
  )
}

function PostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateOpportunityPayload>({ title: '', description: '', type: 'JOB' })
  const [reqInput, setReqInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const createMutation = useMutation({
    mutationFn: (payload: CreateOpportunityPayload) => opportunitiesApi.create(payload),
    onSuccess: onCreated,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      requirements: reqInput.split(',').map((r) => r.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    }
    createMutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card">
          <h3 className="text-lg font-semibold text-foreground">Post Opportunity</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title *</label>
              <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Software Engineering Intern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Company</label>
              <input type="text" value={form.company ?? ''} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Company name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the opportunity..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Location</label>
              <input type="text" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Remote / City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Salary / Stipend</label>
              <input type="text" value={form.salary ?? ''} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. $5000/month"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Deadline</label>
              <input type="date" value={form.deadline ? form.deadline.substring(0, 10) : ''} onChange={(e) => setForm({ ...form, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Apply URL</label>
              <input type="url" value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Requirements (comma-separated)</label>
            <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Python, React, SQL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="internship, remote, web-dev"
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">Failed to post. Please try again.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
            <button type="submit" disabled={createMutation.isPending}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
