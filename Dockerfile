FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --legacy-peer-deps

COPY . .

# Adicione estas variáveis de ambiente para o Vite
ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["yarn", "dev"]