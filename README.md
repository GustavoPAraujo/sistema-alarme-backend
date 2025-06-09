# Sistema de Controle de Alarmes - Documentação do Backend

## Visão Geral do Projeto

Este projeto consiste em um backend para um sistema de controle e monitoramento de alarmes antifurto, desenvolvido com uma arquitetura de microsserviços. A arquitetura é composta por um API Gateway que serve como ponto de entrada único para todas as requisições, e seis microsserviços independentes, cada um com sua responsabilidade específica e seu próprio schema no banco de dados para garantir o isolamento dos dados.

## Tecnologias Utilizadas

- **Node.js:** Ambiente de execução JavaScript no servidor.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **Express.js:** Framework para a construção das APIs.
- **PostgreSQL:** Banco de dados relacional para persistência dos dados.
- **pgAdmin:** Ferramenta de administração para o PostgreSQL.
- **Axios:** Cliente HTTP para a comunicação entre os microsserviços.
- **Dotenv:** Para gerenciamento de variáveis de ambiente.
- **ts-node-dev:** Para reiniciar automaticamente os serviços em ambiente de desenvolvimento.

## Estrutura do Projeto

O projeto está organizado em pastas, onde cada pasta representa um microsserviço independente ou o API Gateway:
```
/
├── api-gateway/
├── user-service/
├── alarm-service/
├── trigger-control-service/
├── dispatch-control-service/
├── notification-service/
└── logging-service/
```

## Pré-requisitos

Antes de iniciar, garanta que você tenha os seguintes softwares instalados em sua máquina:

1.  **Node.js** (versão 20.x ou superior)
2.  **PostgreSQL**
3.  **pgAdmin** (Recomendado)
4.  Um cliente de API como o **Postman**

## Como Executar o Projeto

### 1. Configuração do Banco de Dados
- Abra o pgAdmin e crie um novo banco de dados chamado `alarm_system_db`.
- Para cada serviço que utiliza banco de dados (`user-service`, `alarm-service`, `logging-service`), execute o script SQL de criação de schema e tabelas correspondente.

### 2. Instalação das Dependências
- Abra um terminal para **cada uma das 7 pastas** do projeto.
- Em cada terminal, execute o comando:
  ```bash
  npm install
  ```

### 3. Configuração das Variáveis de Ambiente
- Em cada pasta de serviço, localize o arquivo `.env`.
- Abra cada arquivo `.env` e substitua os valores de exemplo (`SEU_USUARIO`, `SUA_SENHA`) pelas suas credenciais reais do PostgreSQL na variável `DATABASE_URL`.

### 4. Execução dos Serviços
- Mantenha os 7 terminais abertos (um para cada serviço).
- Em cada terminal, execute o comando:
  ```bash
  npm run dev
  ```
- Verifique no console de cada terminal se a mensagem de "rodando na porta X" apareceu sem erros.

### 5. Testando a Aplicação
- Com todos os serviços em execução, utilize o Postman para enviar requisições para o **API Gateway** na URL base `http://localhost:3000`, seguindo a documentação de rotas abaixo.

---

## Documentação das Rotas da API

### 1. API Gateway
Este serviço é a porta de entrada para todo o sistema.

- **URL Base:** `http://localhost:3000`

### 2. Serviço de Cadastro de Usuários (`user-service`)
Gerencia todas as operações relacionadas aos dados dos usuários.

- **Porta Interna:** `3001`
- **Schema no Banco:** `user_service`
- **Rotas:**
  - `POST /usuarios`
    - **Descrição:** Cria um novo usuário.
    - **Corpo (Body):** `{ "nome": "string", "celular": "string" }`
  - `GET /usuarios`
    - **Descrição:** Lista todos os usuários.
  - `GET /usuarios/:id`
    - **Descrição:** Busca um usuário pelo ID.
  - `PUT /usuarios/:id`
    - **Descrição:** Atualiza os dados de um usuário.
    - **Corpo (Body):** `{ "nome": "string", "celular": "string" }`
  - `DELETE /usuarios/:id`
    - **Descrição:** Remove um usuário.

### 3. Serviço de Cadastro de Alarmes (`alarm-service`)
Gerencia os alarmes, seus pontos e as permissões de acesso.

- **Porta Interna:** `3002`
- **Schema no Banco:** `alarm_service`
- **Rotas:**
  - `POST /alarmes`
    - **Descrição:** Cria um novo alarme.
    - **Corpo (Body):** `{ "nome": "string", "localizacao": "string" }`
  - `POST /alarmes/:id/pontos`
    - **Descrição:** Adiciona um ponto monitorado a um alarme.
    - **Corpo (Body):** `{ "nome_ponto": "string" }`
  - `POST /alarmes/:id/usuarios`
    - **Descrição:** Associa um usuário a um alarme.
    - **Corpo (Body):** `{ "id_usuario": "integer" }`
  - `GET /alarmes/:id/usuarios`
    - **Descrição:** Lista os IDs dos usuários associados a um alarme.

### 4. Serviço de Controle de Acionamento (`trigger-control-service`)
Orquestra o processo de armar e desarmar um alarme (stateless).

- **Porta Interna:** `3003`
- **Rotas:**
  - `POST /acionar`
    - **Descrição:** Arma um alarme, verificando permissão, logando e notificando.
    - **Corpo (Body):** `{ "id_alarme": "integer", "id_usuario": "integer" }`
  - `POST /desarmar`
    - **Descrição:** Desarma um alarme, seguindo o mesmo fluxo.
    - **Corpo (Body):** `{ "id_alarme": "integer", "id_usuario": "integer" }`

### 5. Serviço de Controle de Disparo (`dispatch-control-service`)
Orquestra a resposta a um evento de disparo (stateless).

- **Porta Interna:** `3004`
- **Rotas:**
  - `POST /disparar`
    - **Descrição:** Processa um alerta, logando e notificando todos os usuários do alarme.
    - **Corpo (Body):** `{ "id_alarme": "integer", "id_ponto": "integer" }`

### 6. Serviço de Notificação de Usuários (`notification-service`)
Simula o envio de notificações para os usuários (stateless).

- **Porta Interna:** `3005`
- **Rotas:**
  - `POST /notificar`
    - **Descrição:** Simula o envio de uma notificação para um usuário específico.
    - **Corpo (Body):** `{ "id_usuario": "integer", "mensagem": "string" }`

### 7. Serviço de Logging (`logging-service`)
Armazena um registro de todos os eventos importantes do sistema.

- **Porta Interna:** `3006`
- **Schema no Banco:** `logging_service`
- **Rotas:**
  - `POST /logs`
    - **Descrição:** Cria um novo registro de evento.
    - **Corpo (Body):** `{ "evento": "string", "id_alarme": "integer", "id_usuario": "integer" (opcional), "descricao": "string" (opcional) }`
  - `GET /logs`
    - **Descrição:** Lista todos os logs do sistema.
    - **Query Params (Opcional):** `?id_alarme=1` para filtrar logs por alarme.
