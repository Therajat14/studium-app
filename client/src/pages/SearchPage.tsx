import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  Search as SearchIcon, Filter, MessageCircle, UserPlus, Award, Users,
} from 'lucide-react'
import { usersApi } from '../api/users.js'
import type { UserProfile } from '../types/index.js'

export default function SearchPage() {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Simple debounce on input
  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => setDebouncedSearch(val), 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['users', debouncedSearch, yearFilter],
    queryFn: () => usersApi.list({ search: debouncedSearch || undefined, limit: 30 }),
    staleTime: 30_000,
  })

  const users = (data?.items ?? []).filter((u: UserProfile) => {
    if (!yearFilter) return true
    return u.year === Number(yearFilter)
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Search & Discover</h2>
        <p className="text-muted-foreground">Find students in your university</p>
      </div>

      {/* Search + filters */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, branch, or bio..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="border rounded-lg px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Years</option>
              {[1,2,3,4,5,6].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
          <p className="text-muted-foreground">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((student: UserProfile) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentCard({ student }: { student: UserProfile }) {
  const skills: string[] = (student as any).skills ?? []

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      {/* Top bar */}
      <div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-blue-500" />
          <span>{(student as any).karma ?? 0} karma</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-teal-500" />
          <span>{student._count?.followers ?? 0} followers</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4">
          {student.avatarUrl ? (
            <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">{student.name[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{student.name}</h3>
            <p className="text-sm text-muted-foreground">
              {student.branch ?? '—'} {student.year ? `• Year ${student.year}` : ''}
            </p>
            <p className="text-xs text-muted-foreground truncate">{student.college ?? '—'}</p>
          </div>
        </div>

        {student.bio && (
          <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{student.bio}</p>
        )}

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill: string) => (
              <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground">+{skills.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t">
          <div className="flex gap-2">
            <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Message">
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="p-2 text-teal-600 hover:bg-teal-500/10 rounded-lg transition-colors" title="Connect">
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
          <Link
            to={`/profile/${student.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
