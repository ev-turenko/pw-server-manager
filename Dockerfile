FROM node@sha256:d7ecd44a5983a6647565509527498f1051ba409cfe847d2ab514fd67c2d67a2a

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install chromium --with-deps

COPY . .

EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "PORT=${PORT:-3000} npm run start"]