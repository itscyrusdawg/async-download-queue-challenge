import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDownload } from '../api';

const schema = z.object({
  sourceUrl: z.string().url('Informe uma URL válida'),
  filename: z.string().min(1, 'Opcional, mas se preencher precisa ter 1+ caractere').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function DownloadForm({ onCreated }: { onCreated: (jobId: string) => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createDownload,
    onSuccess: (data) => {
      onCreated(data.jobId);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      reset();
    }
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ sourceUrl: v.sourceUrl, filename: v.filename || undefined }))} style={{ display: 'grid', gap: 12, marginTop: 16, marginBottom: 24 }}>
      <label>
        URL de origem
        <input placeholder="https://exemplo.com/arquivo.csv" {...register('sourceUrl')} style={{ width: '100%', padding: 8 }} />
        {errors.sourceUrl && <small style={{ color: 'crimson' }}>{errors.sourceUrl.message}</small>}
      </label>
      <label>
        Nome do arquivo (opcional)
        <input placeholder="meu-arquivo.txt" {...register('filename')} style={{ width: '100%', padding: 8 }} />
        {errors.filename && <small style={{ color: 'crimson' }}>{errors.filename.message}</small>}
      </label>
      <button type="submit" disabled={mutation.isPending} style={{ padding: '10px 14px' }}>
        {mutation.isPending ? 'Enfileirando…' : 'Enviar para fila'}
      </button>
      {mutation.isError && <div style={{ color: 'crimson' }}>Erro ao criar job.</div>}
      {mutation.isSuccess && <div style={{ color: 'seagreen' }}>Job criado! Acompanhe na tabela abaixo.</div>}
    </form>
  );
}