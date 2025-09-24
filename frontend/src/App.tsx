import { useState } from 'react';
import DownloadForm from './components/DownloadForm';
import JobsTable from './components/JobsTable';

export default function App() {
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Downloads assíncronos (fila + polling)</h1>
      <p>Envie uma URL para processar o arquivo. O job será colocado na fila e você pode acompanhar o status abaixo.</p>
      <DownloadForm onCreated={(id) => setLastJobId(id)} />
      <JobsTable highlightId={lastJobId ?? undefined} />
    </div>
  );
}