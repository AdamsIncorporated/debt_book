type customFetchOptions<T> = {
  endpoint: string; // FULL endpoint, already includes any params
  entityName: string; // used for logging
  mapResponse: (raw: any) => T;
};

export async function customFetch<T>({
  endpoint,
  entityName,
  mapResponse,
}: customFetchOptions<T>): Promise<T> {
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

    const mapped = mapResponse(json);
    console.info("✅ Parsed result:", mapped);

    return mapped;
  } catch (err) {
    console.error(`🔥 [API] ${entityName} fetch error`, err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

export async function post(url: string, body: any) {
  console.log("POST →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("POST STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("POST RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("POST ERROR →", err);
    throw err;
  }
}

export async function patch<T>(
  url: string,
  body: Partial<T>,
): Promise<{ status: number; data: T | null }> {
  console.log("PATCH →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    return { status: res.status, data };
  } catch (err) {
    console.error("PATCH ERROR →", err);
    throw err;
  }
}
``;

export async function del(url: string, body?: any) {
  console.log("DELETE →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log("DELETE STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("DELETE RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("DELETE ERROR →", err);
    throw err;
  }
}

export async function get(url: string) {
  console.log("GET →", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("GET STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("GET RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("GET ERROR →", err);
    throw err;
  }
}
