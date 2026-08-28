import { z } from "zod"

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
})

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
})

export type PaginationQuery = z.infer<typeof paginationSchema>

export function validate<TInput, TOutput = TInput>(schema: z.ZodSchema<TOutput, z.ZodTypeDef, TInput>, data: unknown): TOutput {
  const result = schema.safeParse(data)
  if (!result.success) {
    const formatted: Record<string, string[]> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".")
      if (!formatted[path]) formatted[path] = []
      formatted[path].push(issue.message)
    })
    const error = new Error("Validation failed") as Error & { statusCode: number; errors: Record<string, string[]> }
    error.statusCode = 422
    error.errors = formatted
    throw error
  }
  return result.data
}
