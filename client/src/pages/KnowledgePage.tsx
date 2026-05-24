import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Download, Star, FileText, Filter, Search, Calendar,
  Tag, Eye, Plus, Bookmark, Share2, Edit3, File, Image, Video, Archive, X,
} from 'lucide-react'
import { knowledgeApi } from '../api/knowledge.js'
import type { Resource, ResourceType } from '../types/index.js'
import type { CreateResourcePayload } from '../api/knowledge.js'

const FILE_ICONS: Record<string, React.ReactNode> = {
  PDF:      <FileText className="h-6 w-6 text-red-500" />,
  VIDEO:    <Video className="h-6 w-6 text-orange-500" />,
  IMAGE:    <Image className="h-6 w-6 text-green-500" />,
  DOCUMENT: <Edit3 className="h-6 w-6 text-blue-500" />,
  OTHER:    <Archive className="h-6 w-6 text-purple-500" />,
  LINK:     <File className="h-6 w-6 text-gray-500" />,
}

type Tab = 'resources' | 'bookmarked'

export default function KnowledgePage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('resources')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', tab, search, typeFilter],
    queryFn: () => knowledgeApi.list({
      search: search || undefined,
      type: typeFilter || undefined,
      limit: 30,
    }),
    staleTime: 60_000,
  })

  const items = (data?.items ?? []).filter((r: Resource) => tab === 'bookmarked' ? r.isBookmarked : true)

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.toggleBookmark(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['knowledge'] }),
  })

  const downloadMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.download(id),
  })

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Knowledge Hub</h2>
          <p className="text-muted-foreground">Collaborative learning and resource sharing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full lg:w-auto justify-center"
        >
          <Plus className="h-5 w-5" /> Add Resource
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
        {(['resources', 'bookmarked'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              tab === t
                ? 'bg-card text-primary border shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'resources' ? (
              <><FileText className="h-4 w-4 inline mr-2" />All Resources</>
            ) : (
              <><Bookmark className="h-4 w-4 inline mr-2" />My Library</>
            )}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-card border rounded-xl p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject, or tags..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-lg px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              {(['PDF','VIDEO','IMAGE','DOCUMENT','LINK','OTHER'] as ResourceType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search or upload a new resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {items.map((resource: Resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onBookmark={() => bookmarkMutation.mutate(resource.id)}
              onDownload={() => {
                downloadMutation.mutate(resource.id)
                if (resource.url) window.open(resource.url, '_blank')
              }}
            />
          ))}
        </div>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} onCreated={() => {
        void qc.invalidateQueries({ queryKey: ['knowledge'] })
        setShowModal(false)
      }} />}
    </div>
  )
}

function ResourceCard({
  resource, onBookmark, onDownload,
}: {
  resource: Resource
  onBookmark: () => void
  onDownload: () => void
}) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-border/80 transition-colors">
      {/* Thumbnail placeholder */}
      <div className="h-36 bg-muted relative flex items-center justify-center">
        <div className="bg-card rounded-lg p-3 border">
          {FILE_ICONS[resource.type] ?? FILE_ICONS.OTHER}
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded">{resource.type}</span>
        </div>
        <button
          onClick={onBookmark}
          className={`absolute bottom-3 right-3 p-2 rounded-lg border transition-colors ${
            resource.isBookmarked
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:bg-accent'
          }`}
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-2">{resource.title}</h3>

        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
        )}

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                <Tag className="h-3 w-3" />{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{resource.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="space-y-1 text-xs text-muted-foreground mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {resource.uploadedBy.name[0]}
              </div>
              <span>{resource.uploadedBy.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{resource.downloads} downloads</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
            </div>
            {resource.avgRating != null && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span>{resource.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">{resource.course ?? resource.subject ?? ''}</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-muted-foreground hover:bg-accent rounded-lg transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateResourcePayload>({ title: '', type: 'LINK', url: '' })
  const [tagsInput, setTagsInput] = useState('')

  const createMutation = useMutation({
    mutationFn: (payload: CreateResourcePayload) => knowledgeApi.create(payload),
    onSuccess: onCreated,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) }
    createMutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">Add Resource</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
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
              placeholder="Resource title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">URL *</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {['PDF','VIDEO','IMAGE','DOCUMENT','LINK','OTHER'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Course</label>
              <input
                type="text"
                value={form.course ?? ''}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. CS 201"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the resource..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="algorithms, notes, exam-prep"
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">Failed to add resource. Please try again.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
