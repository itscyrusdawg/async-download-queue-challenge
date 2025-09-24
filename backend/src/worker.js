import { Worker } from 'bullmq';
import fs from 'fs/promises';
import path from 'path';
import { getRedisUrl } from './config.js';

const connection = { connection: { url: getRedisUrl() } };
const downloadsDir = path.join(process.cwd(), 'downloads');
await fs.mkdir(downloadsDir, { recursive: true });

export const worker = new Worker(
  'downloads',
  async (job) => {
    const { sourceUrl, filename } = job.data;
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 600));
      await job.updateProgress(i * 20);
    }
    const fileId = job.id;
    const finalName = filename || `arquivo-${fileId}.txt`;
    const filePath = path.join(downloadsDir, finalName);
    await fs.writeFile(
      filePath,
      `Job ${fileId}\nSource: ${sourceUrl}\nGenerated at: ${new Date().toISOString()}\n`
    );
    return { fileId, fileName: finalName };
  },
  connection
);

worker.on('completed', (job, result) => console.log('Job completed', job.id, result));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));