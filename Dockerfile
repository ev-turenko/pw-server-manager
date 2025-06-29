FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install chromium --with-deps

COPY . .

EXPOSE ${PORT:-3000}

CMD ["npm", "run", "start"]