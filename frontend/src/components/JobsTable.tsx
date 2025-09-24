import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../api';

const terminal = new Set(['completed', 'failed', 'not_found']);

function human(state: string) {
  switch (state) {
    case 'waiting':
    case 'queued':
    case 'delayed':
      return 'Na fila';
    case 'active':
      return 'Processando';
    case 'completed':
      return 'Concluído';
    case 'failed':
      return 'Erro';
    default:
      return state;
  }
}

export default function JobsTable({ highlightId }: { highlightId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    refetchInterval: (q) => {
      const items = (q.state.data as any)?.items ?? [];
      const hasInFlight = items.some((it: any) => !terminal.has(it.state));
      return hasInFlight ? 2000 : false;
    },
  });

  if (isLoading) return <div>Carregando…</div>;

  const items = data?.items ?? [];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Job</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Origem</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Progresso</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Ação</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it: any) => (
          <tr key={it.id} style={{ background: it.id === highlightId ? '#fff6d5' : undefined }}>
            <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{it.id}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{it.sourceUrl}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{human(it.state)}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{Math.round(it.progress || 0)}%</td>
            <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              {it.downloadUrl ? (
                <a href={it.downloadUrl} target="_blank">Baixar</a>
              ) : (
                <span style={{ opacity: 0.6 }}>Aguardando…</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}