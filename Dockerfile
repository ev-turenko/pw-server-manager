FROM node@sha256:5340cbfc2df14331ab021555fdd9f83f072ce811488e705b0e736b11adeec4bb

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install chromium --with-deps

COPY . .

EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "PORT=${PORT:-3000} npm run start"]