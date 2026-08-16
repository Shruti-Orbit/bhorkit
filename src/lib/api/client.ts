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

  const payload = (await response.json()) as ApiResponse<TData, TMeta>;

  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.message || "API request failed",
      response.status,
      payload.error?.code,
    );
  }

  return payload;
}
