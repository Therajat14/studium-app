import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, MapPin, Clock, CheckCircle, Trash2, X,
  Package, FileText, Shirt, Watch, BookOpen, Key, ShoppingBag, HelpCircle,
  Smartphone, MessageCircle, Upload, ImageIcon,
} from 'lucide-react'
import { lostFoundApi } from '../api/lostfound.js'
import { uploadApi } from '../api/upload.js'
import { useAuth } from '../hooks/useAuth.js'
import type { LostFoundItem, LostFoundType, LostFoundCategory } from '../types/index.js'
import type { CreateItemPayload } from '../api/lostfound.js'

// ─── Config ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<LostFoundCategory, { label: string; icon: React.ElementType }> = {
  ELECTRONICS:  { label: 'Electronics',  icon: Smartphone },
  DOCUMENTS:    { label: 'Documents',    icon: FileText },
  CLOTHING:     { label: 'Clothing',     icon: Shirt },
  ACCESSORIES:  { label: 'Accessories',  icon: Watch },
  BOOKS:        { label: 'Books',        icon: BookOpen },
  KEYS:         { label: 'Keys',         icon: Key },
  BAGS:         { label: 'Bags',         icon: ShoppingBag },
  OTHER:        { label: 'Other',        icon: Package },
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LostFoundPage() {
  const qc = useQueryClient()
  const { user } = useAuth()

  const [typeFilter, setTypeFilter]   = useState<string>('')
  const [catFilter,  setCatFilter]    = useState<string>('')
  const [showResolved, setShowResolved] = useState(false)
  const [search,     setSearch]       = useState('')
  const [showModal,  setShowModal]    = useState(false)
  const [claimItem,  setClaimItem]    = useState<LostFoundItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['lostfound', typeFilter, catFilter, showResolved, search],
    queryFn: () => lostFoundApi.list({
      type:     typeFilter || undefined,
      category: catFilter  || undefined,
      status:   showResolved ? undefined : 'OPEN',
      search:   search || undefined,
      limit: 40,
    }),
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lostFoundApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['lostfound'] }),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => lostFoundApi.resolve(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['lostfound'] }),
  })

  const items = data?.items ?? []

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Lost & Found</h2>
          <p className="text-muted-foreground">Help your campus community find lost belongings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full lg:w-auto justify-center"
        >
          <Plus className="h-5 w-5" /> Report Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by title, description, or location..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Type + category pills */}
        <div className="flex flex-wrap gap-2">
          {/* LOST / FOUND toggle */}
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              typeFilter === '' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
            }`}
          >All</button>
          <button
            onClick={() => setTypeFilter(typeFilter === 'LOST' ? '' : 'LOST')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              typeFilter === 'LOST' ? 'bg-red-500 text-white border-red-500' : 'bg-background text-muted-foreground border-border hover:border-red-400 hover:text-red-500'
            }`}
          >Lost</button>
          <button
            onClick={() => setTypeFilter(typeFilter === 'FOUND' ? '' : 'FOUND')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              typeFilter === 'FOUND' ? 'bg-green-500 text-white border-green-500' : 'bg-background text-muted-foreground border-border hover:border-green-500 hover:text-green-500'
            }`}
          >Found</button>

          <div className="w-px bg-border self-stretch mx-1" />

          {/* Category pills */}
          {(Object.entries(CATEGORY_CONFIG) as [LostFoundCategory, { label: string; icon: React.ElementType }][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setCatFilter(catFilter === key ? '' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                catFilter === key ? 'bg-primary/10 text-primary border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              <cfg.icon className="h-3.5 w-3.5" />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Show resolved toggle */}
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved items
        </label>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nothing here yet</h3>
          <p className="text-muted-foreground">Lost something? Found something? Report it!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwn={user?.id === item.author.id}
              onDelete={() => deleteMutation.mutate(item.id)}
              onResolve={() => resolveMutation.mutate(item.id)}
              onClaim={() => setClaimItem(item)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            void qc.invalidateQueries({ queryKey: ['lostfound'] })
            setShowModal(false)
          }}
        />
      )}

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onClaimed={() => {
            void qc.invalidateQueries({ queryKey: ['lostfound'] })
            setClaimItem(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Item Card ─────────────────────────────────────────────────────────────

function ItemCard({
  item, isOwn, onDelete, onResolve, onClaim,
}: {
  item: LostFoundItem
  isOwn: boolean
  onDelete: () => void
  onResolve: () => void
  onClaim: () => void
}) {
  const cfg = CATEGORY_CONFIG[item.category]
  const Icon = cfg.icon
  const isLost = item.type === 'LOST'
  const isResolved = item.status === 'RESOLVED'

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-colors ${isResolved ? 'opacity-60' : 'hover:border-border/80'}`}>
      {/* Color band */}
      <div className={`h-1.5 w-full ${isLost ? 'bg-red-500' : 'bg-green-500'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isLost ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {isLost ? '● LOST' : '● FOUND'}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground border rounded-full px-2 py-0.5">
              <Icon className="h-3 w-3" /> {cfg.label}
            </span>
            {isResolved && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Resolved
              </span>
            )}
          </div>
          {isOwn && !isResolved && (
            <div className="flex items-center gap-1">
              <button
                onClick={onResolve}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Mark resolved"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" />
        )}

        {/* Title + description */}
        <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

        {/* Location + time */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          {item.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {item._count.claims > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />{item._count.claims} {item._count.claims === 1 ? 'claim' : 'claims'}
            </span>
          )}
        </div>

        {/* Author + action */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {item.author.name[0]}
            </div>
            <span className="text-xs text-muted-foreground">{item.author.name}</span>
          </div>

          {!isOwn && !isResolved && (
            <button
              onClick={onClaim}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isLost
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLost ? 'I Found This!' : 'This Is Mine!'}
            </button>
          )}

          {item.contactInfo && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{item.contactInfo}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Report Modal ──────────────────────────────────────────────────────────

function ReportModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateItemPayload>({
    type: 'LOST', category: 'OTHER', title: '', description: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (payload: CreateItemPayload) => lostFoundApi.create(payload),
    onSuccess: onCreated,
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview immediately
    setImagePreview(URL.createObjectURL(file))
    setUploadError(null)
    setUploading(true)
    try {
      const media = await uploadApi.upload(file)
      setForm((f) => ({ ...f, imageUrl: media.url }))
    } catch {
      setUploadError('Image upload failed. Please try again.')
      setImagePreview(null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setForm((f) => ({ ...f, imageUrl: undefined }))
    setUploadError(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploading) return
    createMutation.mutate(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card">
          <h3 className="text-lg font-semibold text-foreground">Report an Item</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Lost / Found toggle */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">I am reporting a…</label>
            <div className="grid grid-cols-2 gap-2">
              {(['LOST', 'FOUND'] as LostFoundType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    form.type === t
                      ? t === 'LOST'
                        ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20'
                        : 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  }`}
                >
                  {t === 'LOST' ? '● Lost Item' : '● Found Item'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(Object.entries(CATEGORY_CONFIG) as [LostFoundCategory, { label: string }][]).map(([k, v]) => (
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
              placeholder={form.type === 'LOST' ? 'e.g. Black iPhone 14 Pro' : 'e.g. Found a set of keys'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description *</label>
            <textarea
              required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the item — color, brand, distinguishing features..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              {form.type === 'LOST' ? 'Last seen location' : 'Found at location'}
            </label>
            <input
              type="text" value={form.location ?? ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Library 2nd floor, Canteen, Block B entrance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Contact info (optional)</label>
            <input
              type="text" value={form.contactInfo ?? ''}
              onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Phone, email, or Instagram handle"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Photo (optional)
            </label>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="p-2 bg-muted rounded-full">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload a photo</p>
                    <p className="text-xs">JPG, PNG, WEBP up to 10 MB</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Upload className="h-3.5 w-3.5" /> Browse files
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}

            {uploadError && (
              <p className="text-xs text-destructive mt-1">{uploadError}</p>
            )}
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">Failed to report item. Please try again.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={createMutation.isPending || uploading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : createMutation.isPending ? 'Reporting…' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Claim Modal ───────────────────────────────────────────────────────────

function ClaimModal({ item, onClose, onClaimed }: { item: LostFoundItem; onClose: () => void; onClaimed: () => void }) {
  const [message, setMessage] = useState('')
  const isLost = item.type === 'LOST'

  const claimMutation = useMutation({
    mutationFn: () => lostFoundApi.claim(item.id, message),
    onSuccess: onClaimed,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border rounded-xl max-w-sm w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-base font-semibold text-foreground">
            {isLost ? 'I Found This Item' : 'This Belongs to Me'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.title}</span>
            {' — '}
            {isLost
              ? 'Describe where you found it and how the owner can verify ownership.'
              : 'Prove this is yours — describe a distinguishing feature or provide context.'}
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={isLost
              ? 'I found this near the library entrance...'
              : 'I can describe the item exactly — it has a sticker on the back...'}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {claimMutation.isError && (
            <p className="text-sm text-destructive">
              {(claimMutation.error as any)?.response?.data?.error?.message ?? 'Failed to send. Please try again.'}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              onClick={() => claimMutation.mutate()}
              disabled={!message.trim() || claimMutation.isPending}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${
                isLost ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {claimMutation.isPending ? 'Sending...' : 'Send Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
