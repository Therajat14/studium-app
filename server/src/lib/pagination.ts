export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const parsePagination = (
  query: Record<string, unknown>,
  defaults: { limit?: number; maxLimit?: number } = {},
): PaginationParams => {
  const limit = Math.min(
    Math.max(1, Number(query.limit) || defaults.limit || 20),
    defaults.maxLimit ?? 100,
  )
  const page = Math.max(1, Number(query.page) || 1)
  return { page, limit }
}

export const toPaginatedResult = <T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams,
): PaginatedResult<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
})

export const toSkipTake = ({ page, limit }: PaginationParams) => ({
  skip: (page - 1) * limit,
  take: limit,
})
