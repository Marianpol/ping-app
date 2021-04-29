FROM node:14-alpine3.13

COPY index.js /usr/src/app/
COPY package.json /usr/src/app/

WORKDIR /usr/src/app/

RUN mkdir files && npm install

RUN npm install

CMD ["node", "index.js"]
