import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { downloadQueue, downloadQueueEvents, getJobState } from './queue.js';
import { saveJobMeta, listJobs, getJobMeta } from './store.js';
import { getBasePublicUrl, getPort } from './config.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const PORT = getPort();
const BASE_PUBLIC_URL = getBasePublicUrl();

function buildDownloadUrl(fileName) {
  return `${BASE_PUBLIC_URL}/files/${fileName}`;
}

function mergeState(id, meta, stateInfo) {
  const safeMeta = meta ?? {};
  const combined = { id, ...safeMeta, ...stateInfo };
  combined.meta = safeMeta;

  if (stateInfo.state === 'not_found' && safeMeta?.state) {
    combined.state = safeMeta.state;
    if (safeMeta.progress !== undefined) combined.progress = safeMeta.progress;
    if (safeMeta.returnvalue) combined.returnvalue = safeMeta.returnvalue;
    if (safeMeta.failedReason) combined.failedReason = safeMeta.failedReason;
  }

  const fileName = combined.returnvalue?.fileName || safeMeta?.returnvalue?.fileName;
  if (!combined.downloadUrl && fileName) {
    combined.downloadUrl = buildDownloadUrl(fileName);
  } else if (!combined.downloadUrl && safeMeta?.downloadUrl) {
    combined.downloadUrl = safeMeta.downloadUrl;
  }

  return combined;
}

downloadQueueEvents.on('waiting', ({ jobId }) => {
  saveJobMeta(jobId, { state: 'waiting', progress: 0 });
});

downloadQueueEvents.on('active', ({ jobId }) => {
  saveJobMeta(jobId, { state: 'active' });
});

downloadQueueEvents.on('progress', ({ jobId, data }) => {
  const raw = typeof data === 'number' ? data : Number(data?.progress ?? 0);
  const progress = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
  saveJobMeta(jobId, { progress, state: 'active' });
});

downloadQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  const updates = {
    state: 'completed',
    progress: 100,
    returnvalue,
  };
  if (returnvalue?.fileName) {
    updates.downloadUrl = buildDownloadUrl(returnvalue.fileName);
  }
  saveJobMeta(jobId, updates);
});

downloadQueueEvents.on('failed', ({ jobId, failedReason }) => {
  saveJobMeta(jobId, { state: 'failed', failedReason, downloadUrl: null, progress: 0 });
});

downloadQueueEvents.on('error', (err) => {
  console.error('Queue events error', err);
});

app.use('/files', express.static(path.join(process.cwd(), 'downloads')));

app.post('/api/downloads', async (req, res) => {
  const { sourceUrl, filename } = req.body || {};
  if (!sourceUrl || typeof sourceUrl !== 'string') {
    return res.status(400).json({ message: 'sourceUrl é obrigatório' });
  }
  const job = await downloadQueue.add(
    'download',
    { sourceUrl, filename },
    { removeOnComplete: { age: 60 * 60 }, removeOnFail: false }
  );
  saveJobMeta(job.id, { sourceUrl, filename: filename || null, createdAt: Date.now(), state: 'waiting', progress: 0 });
  return res.status(202).json({ jobId: job.id });
});

app.get('/api/downloads/:id', async (req, res) => {
  const { id } = req.params;
  const meta = getJobMeta(id);
  const stateInfo = await getJobState(id);
  const payload = mergeState(id, meta, stateInfo);
  res.json(payload);
});

app.get('/api/downloads', async (_req, res) => {
  const items = await Promise.all(
    listJobs().map(async (j) => {
      const s = await getJobState(j.id);
      return mergeState(j.id, j, s);
    })
  );
  res.json({ items });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));