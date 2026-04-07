import { QueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: readonly unknown[] }): Promise<T> => {
    const url = Array.isArray(queryKey)
      ? queryKey.filter((k) => k !== null && k !== undefined).join("/")
      : String(queryKey[0]);
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const res = await fetch(fullUrl);
    if (on401 === "returnNull" && res.status === 401) return null as T;
    await throwIfResNotOk(res);
    return res.json() as Promise<T>;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});
