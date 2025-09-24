import axios from 'axios';

export const api = axios.create({ baseURL: '/' });

export async function createDownload(input: { sourceUrl: string; filename?: string | null }) {
  const { data } = await api.post('/api/downloads', input);
  return data as { jobId: string };
}

export async function fetchJob(id: string) {
  const { data } = await api.get(`/api/downloads/${id}`);
  return data as any;
}

export async function fetchJobs() {
  const { data } = await api.get('/api/downloads');
  return data as { items: any[] };
}