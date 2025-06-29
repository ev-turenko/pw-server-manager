FROM node@sha256:a7c10fad0b8fa59578bf3cd1717b168df134db8362b89e1ea6f54676fee49d3b
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx playwright install chromium --with-deps
COPY . .
EXPOSE ${PORT:-3000}
CMD ["npm", "run", "start"]