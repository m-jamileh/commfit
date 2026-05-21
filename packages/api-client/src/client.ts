export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class CommfitApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor({ status, code, message, details }: ApiError) {
    super(message);
    this.name = "CommfitApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// POSTs on these paths get an Idempotency-Key header on each call
const IDEMPOTENT_POST_PATTERNS = [
  /^\/v1\/jobs$/,
  /^\/v1\/jobs\/[^/]+\/parts$/,
  /^\/v1\/jobs\/[^/]+\/complete$/,
  /^\/v1\/invoices\/[^/]+\/record-payment$/,
];

function needsIdempotencyKey(method: string, path: string): boolean {
  return method === "POST" && IDEMPOTENT_POST_PATTERNS.some((re) => re.test(path));
}

export interface CommfitClientOptions {
  baseUrl?: string;
  getAuthHeaders: () => Record<string, string>;
}

// Open body type — DTOs are placeholders until backend fills the OpenAPI spec
type Body = Record<string, unknown>;

async function doRequest<T = unknown>(
  base: string,
  getAuthHeaders: () => Record<string, string>,
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(extraHeaders ?? {}),
  };

  if (needsIdempotencyKey(method, path)) {
    headers["Idempotency-Key"] = crypto.randomUUID();
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let payload: Partial<ApiError> = {};
    try {
      payload = (await res.json()) as Partial<ApiError>;
    } catch {
      // non-JSON error body
    }
    throw new CommfitApiError({
      status: res.status,
      code: payload.code ?? "UNKNOWN",
      message: payload.message ?? res.statusText,
      details: payload.details,
    });
  }

  // 204 or empty body — return undefined
  const contentLength = res.headers.get("content-length");
  if (res.status === 204 || contentLength === "0") return undefined as T;

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

function qs(params?: Record<string, string>): string {
  if (!params) return "";
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : "";
}

export function createCommfitClient({ baseUrl, getAuthHeaders }: CommfitClientOptions) {
  // Read NEXT_PUBLIC_API_BASE_URL from the build-time env injected by Next.js/webpack
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_BASE_URL as string | undefined;
  const base = baseUrl ?? envBase ?? "http://localhost:3000";

  const r = <T = unknown>(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    doRequest<T>(base, getAuthHeaders, method, path, body, extraHeaders);

  return {
    jobs: {
      list: (q?: Record<string, string>) => r("GET", `/v1/jobs${qs(q)}`),
      get: (id: string) => r("GET", `/v1/jobs/${id}`),
      create: (body: Body) => r("POST", "/v1/jobs", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/jobs/${id}`, body),
      transition: (id: string, body: Body) => r("POST", `/v1/jobs/${id}/transition`, body),
      complete: (id: string, body: Body) => r("POST", `/v1/jobs/${id}/complete`, body),
      cancel: (id: string, body?: Body) => r("POST", `/v1/jobs/${id}/cancel`, body),
      assign: (id: string, body: Body) => r("POST", `/v1/jobs/${id}/assign`, body),
      addPhoto: (id: string, body: Body) => r("POST", `/v1/jobs/${id}/photos`, body),
      addPart: (id: string, body: Body) => r("POST", `/v1/jobs/${id}/parts`, body),
    },
    quotes: {
      list: (q?: Record<string, string>) => r("GET", `/v1/quotes${qs(q)}`),
      get: (id: string) => r("GET", `/v1/quotes/${id}`),
      create: (body: Body) => r("POST", "/v1/quotes", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/quotes/${id}`, body),
      send: (id: string) => r("POST", `/v1/quotes/${id}/send`),
      cancel: (id: string) => r("POST", `/v1/quotes/${id}/cancel`),
    },
    contracts: {
      list: (q?: Record<string, string>) => r("GET", `/v1/contracts${qs(q)}`),
      get: (id: string) => r("GET", `/v1/contracts/${id}`),
      create: (body: Body) => r("POST", "/v1/contracts", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/contracts/${id}`, body),
      send: (id: string) => r("POST", `/v1/contracts/${id}/send`),
      sign: (id: string, body: Body) => r("POST", `/v1/contracts/${id}/sign`, body),
      terminate: (id: string, body?: Body) => r("POST", `/v1/contracts/${id}/terminate`, body),
    },
    invoices: {
      list: (q?: Record<string, string>) => r("GET", `/v1/invoices${qs(q)}`),
      get: (id: string) => r("GET", `/v1/invoices/${id}`),
      create: (body: Body) => r("POST", "/v1/invoices", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/invoices/${id}`, body),
      send: (id: string) => r("POST", `/v1/invoices/${id}/send`),
      recordPayment: (id: string, body: Body) => r("POST", `/v1/invoices/${id}/record-payment`, body),
      void_: (id: string) => r("POST", `/v1/invoices/${id}/void`),
      generateFromJob: (jobId: string) => r("POST", `/v1/invoices/from-job/${jobId}`),
    },
    commission: {
      rules: {
        list: () => r("GET", "/v1/commission/rules"),
        get: (id: string) => r("GET", `/v1/commission/rules/${id}`),
        create: (body: Body) => r("POST", "/v1/commission/rules", body),
        update: (id: string, body: Body) => r("PATCH", `/v1/commission/rules/${id}`, body),
        delete: (id: string) => r("DELETE", `/v1/commission/rules/${id}`),
      },
      computePreview: (body: Body) => r("POST", "/v1/commission/compute-preview", body),
    },
    accounts: {
      list: (q?: Record<string, string>) => r("GET", `/v1/accounts${qs(q)}`),
      get: (id: string) => r("GET", `/v1/accounts/${id}`),
      create: (body: Body) => r("POST", "/v1/accounts", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/accounts/${id}`, body),
    },
    locations: {
      list: (q?: Record<string, string>) => r("GET", `/v1/locations${qs(q)}`),
      get: (id: string) => r("GET", `/v1/locations/${id}`),
      create: (body: Body) => r("POST", "/v1/locations", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/locations/${id}`, body),
    },
    technicians: {
      list: (q?: Record<string, string>) => r("GET", `/v1/technicians${qs(q)}`),
      get: (id: string) => r("GET", `/v1/technicians/${id}`),
      create: (body: Body) => r("POST", "/v1/technicians", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/technicians/${id}`, body),
    },
    parts: {
      list: (q?: Record<string, string>) => r("GET", `/v1/parts${qs(q)}`),
      get: (id: string) => r("GET", `/v1/parts/${id}`),
      create: (body: Body) => r("POST", "/v1/parts", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/parts/${id}`, body),
    },
    equipment: {
      list: (q?: Record<string, string>) => r("GET", `/v1/equipment${qs(q)}`),
      get: (id: string) => r("GET", `/v1/equipment/${id}`),
      create: (body: Body) => r("POST", "/v1/equipment", body),
      update: (id: string, body: Body) => r("PATCH", `/v1/equipment/${id}`, body),
    },
    reports: {
      revenue: (q?: Record<string, string>) => r("GET", `/v1/reports/revenue${qs(q)}`),
      jobPipeline: (q?: Record<string, string>) => r("GET", `/v1/reports/job-pipeline${qs(q)}`),
      techPerformance: (q?: Record<string, string>) =>
        r("GET", `/v1/reports/tech-performance${qs(q)}`),
      equipmentHealth: (q?: Record<string, string>) =>
        r("GET", `/v1/reports/equipment-health${qs(q)}`),
      commissionSummary: (q?: Record<string, string>) =>
        r("GET", `/v1/reports/commission-summary${qs(q)}`),
      accountOverview: (q?: Record<string, string>) =>
        r("GET", `/v1/reports/account-overview${qs(q)}`),
    },
    webhooks: {
      esign: (body: Body, signatureHeader: string) =>
        r("POST", "/v1/webhooks/esign", body, { "x-esign-signature": signatureHeader }),
    },
  };
}

export type CommfitClient = ReturnType<typeof createCommfitClient>;
