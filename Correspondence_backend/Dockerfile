FROM node:16

WORKDIR /usr/src/app
COPY . .

RUN npm install
RUN npm run build


EXPOSE 5000 
CMD [ "node", "build/index.js" ]
