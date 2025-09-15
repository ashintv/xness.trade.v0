FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN npm run build

CMD ["npm", "run", "start"]