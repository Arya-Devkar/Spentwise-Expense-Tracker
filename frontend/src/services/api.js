const BASE = "/api";

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(BASE + path, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
    } catch {
        throw new Error("Cannot reach the server. Is the backend running?");
    }

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            // FastAPI: detail is a string (our errors) or a list (validation)
            if (typeof body.detail === "string") message = body.detail;
            else if (Array.isArray(body.detail)) message = body.detail[0]?.msg ?? message;
        } catch {
            // response had no JSON body
        }
        throw new Error(message);
    }

    return res.status === 204 ? null : res.json();
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
};