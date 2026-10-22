import type { SupabaseClient } from "@supabase/supabase-js"

export interface RecordedCall {
  table: string
  action: "select" | "insert" | "update" | "delete" | "rpc" | "list" | "remove" | "signOut" | "upload"
  payload?: unknown
  options?: unknown
  filters: { op: "eq" | "gte" | "lte" | "in"; column: string; value: unknown }[]
  order?: { column: string; ascending: boolean }
  limit?: number
}

export interface Reply {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}

interface Options {
  user?: { id: string } | null
  reply?: (call: RecordedCall) => Reply
}

export function fakeSupabase({ user = { id: "user-1" }, reply = () => ({}) }: Options = {}) {
  const calls: RecordedCall[] = []

  function from(table: string) {
    const call: RecordedCall = { table, action: "select", filters: [] }
    const run = () => {
      calls.push(call)
      const { data = null, error = null, count = null } = reply(call)
      return { data, error, count }
    }
    const query = {
      select(columns?: string, options?: unknown) {
        if (call.action === "select") {
          call.payload = columns
          call.options = options
        }
        return query
      },
      insert(payload: unknown) {
        call.action = "insert"
        call.payload = payload
        return query
      },
      update(payload: unknown) {
        call.action = "update"
        call.payload = payload
        return query
      },
      delete() {
        call.action = "delete"
        return query
      },
      eq(column: string, value: unknown) {
        call.filters.push({ op: "eq", column, value })
        return query
      },
      gte(column: string, value: unknown) {
        call.filters.push({ op: "gte", column, value })
        return query
      },
      lte(column: string, value: unknown) {
        call.filters.push({ op: "lte", column, value })
        return query
      },
      in(column: string, value: unknown) {
        call.filters.push({ op: "in", column, value })
        return query
      },
      order(column: string, options?: { ascending?: boolean }) {
        call.order = { column, ascending: options?.ascending ?? true }
        return query
      },
      limit(count: number) {
        call.limit = count
        return query
      },
      single: async () => run(),
      maybeSingle: async () => run(),
      then(resolve: (value: ReturnType<typeof run>) => unknown, reject?: (reason: unknown) => unknown) {
        return Promise.resolve(run()).then(resolve, reject)
      },
    }
    return query
  }

  function direct(table: string, action: RecordedCall["action"], payload?: unknown) {
    const call: RecordedCall = { table, action, payload, filters: [] }
    calls.push(call)
    const { data = null, error = null } = reply(call)
    return { data, error }
  }

  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      signOut: async (options?: unknown) => direct("auth", "signOut", options),
    },
    from,
    rpc: async (name: string, args?: unknown) => direct(name, "rpc", args),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: unknown) => direct(bucket, "upload", { path, file }),
        list: async (prefix?: string) => direct(bucket, "list", prefix),
        remove: async (paths: string[]) => direct(bucket, "remove", paths),
      }),
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

export function steps(calls: RecordedCall[]) {
  return calls.map((c) => `${c.action} ${c.table}`)
}
