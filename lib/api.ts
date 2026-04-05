import { Character, Episode, Filters, Info, Location, ResourceType } from "@/types/api";

const BASE = "https://rickandmortyapi.com/api";

interface ApiResult<T> {
  data: T | null;
  info: Info | null;
  error: string | null;
}

export async function fetchApi<T>(
  resource: ResourceType,
  page: number = 1,
  filters?: Partial<Filters>
): Promise<ApiResult<T>> {
  try {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (filters?.name) params.set("name", filters.name);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.species) params.set("species", filters.species);

    const url = `${BASE}/${resource}${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        data: null,
        info: null,
        error: errorData.error || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      data: data as T,
      info: data.info || null,
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      info: null,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export function buildUrl(resource: ResourceType, page: number, filters?: Partial<Filters>): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", page.toString());
  if (filters?.name) params.set("name", filters.name);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.species) params.set("species", filters.species);

  const queryString = params.toString();
  return `${BASE}/${resource}${queryString ? `?${queryString}` : ""}`;
}

export function generateCodeSnippet(url: string): { language: string; code: string }[] {
  return [
    {
      language: "JavaScript",
      code: `// JavaScript — Fetch API
const response = await fetch("${url}");
const data = await response.json();
console.log(data.info.count);
console.log(data.results[0].name);`,
    },
    {
      language: "Python",
      code: `# Python — requests
import requests

response = requests.get("${url}")
data = response.json()
print(data["info"]["count"])
print(data["results"][0]["name"])`,
    },
    {
      language: "cURL",
      code: `# cURL
curl -X GET \\
  "${url}" \\
  -H "Accept: application/json"`,
    },
  ];
}

export type { Character, Episode, Filters, Info, Location, ResourceType };
