const jobs = new Map();
const TTL = 1000 * 60 * 60; // 1h

export function saveJobMeta(id, meta) {
  const existing = jobs.get(id) ?? {};
  jobs.set(id, { ...existing, ...meta, updatedAt: Date.now() });
}

export function getJobMeta(id) {
  return jobs.get(id);
}

export function listJobs() {
  const now = Date.now();
  return [...jobs.entries()]
    .filter(([, v]) => now - v.updatedAt < TTL)
    .map(([id, v]) => ({ id, ...v }));
}