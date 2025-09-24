# Async Download Queue (React + Vite + RHF/Zod + TanStack Query + Node/Express + BullMQ)

## Visão geral

Este projeto demonstra uma solução completa para orquestrar downloads assíncronos de
arquivos a partir de URLs remotas. A proposta é simular um cenário comum em produtos que
precisam coletar conteúdos grandes ou demorados sob demanda, evitando que o usuário fique
aguardando uma requisição HTTP longa. O sistema foi desenhado para explorar boas práticas de
fila de processamento e feedback em tempo real ao usuário.

### Motivação

Aplicações que efetuam downloads externos diretamente na chamada HTTP sofrem com timeouts,
uso excessivo de recursos e dificuldade para escalar. Ao transferir o trabalho pesado para
uma fila, o backend pode responder rapidamente e distribuir a carga entre workers, enquanto
o frontend monitora o progresso. Essa abordagem melhora a experiência do usuário final e
reduz a chance de falhas em processos demorados.

### Caso de uso coberto

Imagine um painel administrativo em que o usuário fornece links de vídeos ou arquivos
volumosos que devem ser baixados e armazenados para processamento posterior. O fluxo fica
mais eficiente quando o backend registra a intenção de download, delega a execução para um
worker e oferece um dashboard que mostra o status de cada tarefa.

### Como a solução funciona

1. **Frontend (React + Vite)** – Interface onde o usuário cadastra URLs e acompanha a fila
   de downloads em tempo real por meio de chamadas periódicas ao backend.
2. **Backend (Express + BullMQ)** – API REST que recebe pedidos de download, cria jobs na
   fila Redis e expõe endpoints para consultar o status.
3. **Worker (BullMQ)** – Serviço que consome a fila, executa os downloads assíncronos e
   atualiza o progresso. Poderíamos ter múltiplas réplicas para escalar conforme a demanda.
4. **Redis** – Armazena a fila e os metadados de cada job, garantindo persistência enquanto a
   operação acontece.

Esse desenho permite aplicar throttling, reprocessar falhas e monitorar métricas sem travar a
API principal. Também facilita substituir o backend ou o worker por implementações mais
robustas em ambientes de produção.

## Requisitos
- Node 18+
- Docker (para usar o ambiente completo via Compose)

As variáveis necessárias já estão versionadas em `backend/.env` e `frontend/.env`.

## Rodando tudo com Docker Compose
```bash
docker compose up
```

Isso sobe quatro serviços:

1. **redis** – banco de dados em memória utilizado pelo BullMQ.
2. **backend** – API Express em modo de desenvolvimento (`npm run dev`).
3. **worker** – processador da fila (`npm run worker`).
4. **frontend** – Vite dev server com proxy para o backend.

Com o Compose rodando:

- API disponível em [http://localhost:4000](http://localhost:4000)
- Frontend disponível em [http://localhost:5173](http://localhost:5173)

Para encerrar, pressione `Ctrl+C` e depois execute `docker compose down` se quiser remover os containers.

## Rodando manualmente (sem Compose)
1. Suba um Redis local (por exemplo, via Docker):
   ```bash
   docker run -p 6379:6379 --name redis -d redis:7-alpine
   ```
2. Backend e worker (dois terminais distintos):
   ```bash
   cd backend
   npm install
   npm run dev      # terminal 1
   npm run worker   # terminal 2
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Caso queira alterar URLs ou portas, ajuste as variáveis em `backend/.env` e `frontend/.env` antes de iniciar.
