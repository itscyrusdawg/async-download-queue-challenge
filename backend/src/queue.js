import { Queue, QueueEvents, Worker, Job } from 'bullmq';
import { getRedisUrl } from './config.js';

const connection = { connection: { url: getRedisUrl() } };
export const downloadQueue = new Queue('downloads', connection);
export const downloadQueueEvents = new QueueEvents('downloads', connection);

// Helper para consultar status de um job pelo id
export async function getJobState(jobId) {
  const job = await downloadQueue.getJob(jobId);
  if (!job) return { state: 'not_found' };
  const state = await job.getState();
  const progress = job.progress || 0;
  return { state, progress, returnvalue: job.returnvalue, failedReason: job.failedReason };
}