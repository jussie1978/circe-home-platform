FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm ci --registry=$NPM_REGISTRY

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
