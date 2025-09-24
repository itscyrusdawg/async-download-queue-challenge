export type JobStatus = 'waiting' | 'delayed' | 'active' | 'completed' | 'failed' | 'paused' | 'stuck' | 'not_found' | 'waiting-children' | 'queued';

export interface JobItem {
  id: string;
  sourceUrl: string;
  filename?: string | null;
  createdAt: number;
  state: JobStatus;
  progress?: number;
  downloadUrl?: string;
}