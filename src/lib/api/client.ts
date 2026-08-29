type ApiResponse<TData, TMeta = unknown> = {
  success: boolean;
  message: string;
  data: TData;
  meta?: TMeta;
  error?: {
    code?: string;
    details?: unknown;
  };
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000/api/v1";

export function getApiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiGet<TData, TMeta = unknown>(
  path: string,
  init?: RequestInit,
) {
  return apiRequest<TData, TMeta>(path, {
    ...init,
    method: "GET",
  });
}

export async function apiPost<TData, TBody = unknown, TMeta = unknown>(
  path: string,
  body: TBody,
  init?: RequestInit,
) {
  return apiRequest<TData, TMeta>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut<TData, TBody = unknown, TMeta = unknown>(
  path: string,
  body?: TBody,
  init?: RequestInit,
) {
  return apiRequest<TData, TMeta>(path, {
    ...init,
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPatch<TData, TBody = unknown, TMeta = unknown>(
  path: string,
  body: TBody,
  init?: RequestInit,
) {
  return apiRequest<TData, TMeta>(path, {
    ...init,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiDelete<TData, TMeta = unknown>(
  path: string,
  init?: RequestInit,
) {
  return apiRequest<TData, TMeta>(path, {
    ...init,
    method: "DELETE",
  });
}

async function apiRequest<TData, TMeta = unknown>(
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  // Not every response is JSON. The rate limiter answers with plain text, and
  // a proxy or gateway in front of the API can return HTML on a bad day.
  // Parsing unconditionally turned those into a SyntaxError thrown from inside
  // the client — which surfaced to the user as "Unexpected token 'T'" and took
  // the page down, instead of the request simply failing with a readable
  // reason.
  const raw = await response.text();
  let payload: ApiResponse<TData, TMeta> | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as ApiResponse<TData, TMeta>) : null;
  } catch {
    payload = null;
  }

  if (!payload) {
    throw new ApiClientError(
      response.status === 429
        ? "You're going a bit fast. Please wait a moment and try again."
        : "Something went wrong. Please try again.",
      response.status,
      response.status === 429 ? "RATE_LIMITED" : "UNEXPECTED_RESPONSE",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.message || "API request failed",
      response.status,
      payload.error?.code,
    );
  }

  return payload;
}
