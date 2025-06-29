FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install chromium --with-deps

COPY . .

EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "PORT=${PORT:-3000} npm run start"]