# 🚀 Projeto Vendas (Vue 3 + Vue Router + Docker Compose)

> Um sistema de gestão de vendedores e vendas, feito com Vue 3, Vue Router e pronto para rodar com **Docker Compose**.

---

## 📋 Sobre o Projeto

Este é um projeto frontend de controle de vendas e vendedores, com autenticação simples via token (`localStorage`). Inclui rotas protegidas, navegação dinâmica e uma arquitetura organizada para facilitar a manutenção. O projeto foi configurado para rodar facilmente com **Docker Compose**, ideal para desenvolvimento local e ambientes de staging.

Feito com as melhores práticas e ferramentas modernas, ele combina velocidade, simplicidade e escalabilidade.

---

## 🧰 Tecnologias Utilizadas

- [Vue.js](https://vuejs.org/) v3 — *Um framework progressivo, performático e versátil para interfaces web.*
- [Vue Router](https://router.vuejs.org/) — *Sistema de roteamento oficial para Vue, flexível e fácil de usar.*
- [TypeScript](https://www.typescriptlang.org/) *(opcional)* — *Para tipagem estática e maior segurança no código.*
- [Vite](https://vitejs.dev/) — *Ferramenta de build rápida e moderna, baseada em módulos ES nativos.*
- [Yarn](https://yarnpkg.com/) — *Gerenciador de pacotes rápido, confiável e escalável.*
- [Docker](https://www.docker.com/) & **Docker Compose** — *Para facilitar o setup de ambiente consistente e reproduzível.*

---

## 🛠️ Como Rodar o Projeto com Docker Compose (Primeira Instalação)

### 🐳 Passo a passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/edgarleite/lwsa-sales-system-frontend-v2.git
   cd lwsa-sales-system-frontend-v2
   ```

2. **Suba os contêineres (construção automática):**

   ```bash
   docker compose up -d --build
   ```

   Isso irá:
   - Baixar as dependências
   - Construir a imagem Docker
   - Iniciar o app automaticamente

3. **Acesse no navegador:**

   👉 http://localhost:5173

4. **(Opcional) Para parar o contêiner:**

   ```bash
   docker compose down
   ```

---

## 🔁 Recriar Imagem Sem Cache (Opcional)

Se quiser garantir que tudo seja reconstruído do zero (útil se houve alterações nas dependências ou configurações):

```bash
docker compose build --no-cache
docker compose up -d
``