FROM node:latest

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

ENV NODE_ENV production

CMD ["yarn", "start"]
