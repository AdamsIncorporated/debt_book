type FetchByIdOptions<T> = {
  endpoint: string; // FULL endpoint, already includes any params
  entityName: string; // used for logging
  mapResponse: (raw: any) => T;
};

export async function fetchById<T>({
  endpoint,
  entityName,
  mapResponse,
}: FetchByIdOptions<T>): Promise<T> {
  console.groupCollapsed(`📡 [API] Fetch ${entityName}`);
  console.info("➡️ Request URL:", endpoint);

  try {
    const res = await fetch(endpoint);

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ HTTP Error:", res.status, text);
      throw new Error(`${entityName} fetch failed (HTTP ${res.status})`);
    }

    const json = await res.json();
    console.debug("✅ Raw API response:", json);

    if (!Array.isArray(json) || !json[0]) {
      console.error("❌ Unexpected response shape:", json);
      throw new Error(`${entityName} response format invalid`);
    }

    const mapped = mapResponse(json[0]);
    console.info("✅ Parsed result:", mapped);

    return mapped;
  } catch (err) {
    console.error(`🔥 [API] ${entityName} fetch error`, err);
    throw err;
  } finally {
    console.groupEnd();
  }
}
