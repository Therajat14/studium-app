import { useState } from 'react'
import { useParams } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Camera, Mail, School, BookOpen, Calendar, Edit3, Save, X,
  Award, Users, TrendingUp, Github, Linkedin, Globe, Hash,
} from 'lucide-react'
import { usersApi } from '../api/users.js'
import { useAuth } from '../hooks/useAuth.js'
import type { UpdateProfilePayload } from '../api/users.js'

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const { user: me } = useAuth()
  const qc = useQueryClient()

  const targetId = id ?? me?.id ?? ''
  const isOwnProfile = !id || id === me?.id

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', targetId],
    queryFn: () => usersApi.getById(targetId),
    enabled: !!targetId,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<UpdateProfilePayload>({})

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateMe(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user', targetId] })
      setIsEditing(false)
    },
  })

  const startEdit = () => {
    if (!profile) return
    setForm({
      name: profile.name,
      college: profile.college,
      branch: profile.branch,
      year: profile.year,
      bio: profile.bio,
      links: profile.links ?? {},
    })
    setIsEditing(true)
  }

  const save = () => updateMutation.mutate(form)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <div className="p-6 text-muted-foreground">User not found.</div>
  }

  const p = isEditing ? { ...profile, ...form } : profile

  const stats = [
    { label: 'Karma', value: profile.karma?.toLocaleString() ?? '0', icon: Award, color: 'text-blue-500' },
    { label: 'Connections', value: profile._count?.followers?.toString() ?? '0', icon: Users, color: 'text-teal-500' },
    { label: 'Following', value: profile._count?.following?.toString() ?? '0', icon: TrendingUp, color: 'text-green-500' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header card */}
      <div className="bg-card border rounded-xl p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-background" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background">
                <span className="text-3xl font-bold text-primary">{profile.name[0]}</span>
              </div>
            )}
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 bg-card text-primary p-2 rounded-full border hover:bg-accent transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={(form.name as string) ?? ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="text-2xl font-bold bg-background border rounded-lg px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{profile.name}</h1>
                )}
                <p className="text-muted-foreground text-lg mt-1">
                  {p.branch ?? '—'} {p.year ? `• Year ${p.year}` : ''}
                </p>
                <p className="text-muted-foreground">{p.college ?? '—'}</p>
                {profile.rollNumber && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4 mr-1" />
                    <span>Roll: {profile.rollNumber}</span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div>
                  {!isEditing ? (
                    <button onClick={startEdit} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      <Edit3 className="h-4 w-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={save} disabled={updateMutation.isPending} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <Save className="h-4 w-4" /> Save
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-5 text-center hover:border-primary/50 transition-colors">
            <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Profile Information</h2>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={(form.bio as string) ?? ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-muted-foreground">{profile.bio ?? 'No bio yet.'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
              <Mail className="h-4 w-4 mr-2" /> Email
            </label>
            <p className="text-foreground">{profile.email}</p>
          </div>

          {/* Academic */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                <School className="h-4 w-4 mr-2" /> University
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={(form.college as string) ?? ''}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-foreground">{profile.college ?? '—'}</p>
              )}
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                <BookOpen className="h-4 w-4 mr-2" /> Branch
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={(form.branch as string) ?? ''}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-foreground">{profile.branch ?? '—'}</p>
              )}
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-2" /> Year
              </label>
              {isEditing ? (
                <select
                  value={form.year ?? ''}
                  onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select year</option>
                  {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              ) : (
                <p className="text-foreground">{profile.year ? `Year ${profile.year}` : '—'}</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { key: 'github', icon: Github, label: 'GitHub' },
              { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
              { key: 'portfolio', icon: Globe, label: 'Portfolio' },
            ].map(({ key, icon: Icon, label }) => {
              const val = (profile.links as Record<string, string | null> | null)?.[key]
              const editVal = (form.links as Record<string, string> | undefined)?.[key] ?? ''
              return (
                <div key={key}>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Icon className="h-4 w-4 mr-2" /> {label}
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editVal}
                      onChange={(e) => setForm({ ...form, links: { ...(form.links ?? {}), [key]: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : val ? (
                    <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                      {val}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Skills */}
          {(profile as any).skills?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {((profile as any).skills as string[]).map((skill: string) => (
                  <span key={skill} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Role</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 font-medium">
            {profile.role}
          </span>
          <p className="text-muted-foreground text-sm mt-4">
            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
