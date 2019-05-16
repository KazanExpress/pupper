FROM browserless/chrome

# Expose the web-socket and HTTP ports
EXPOSE 3000

USER 0

RUN mkdir /app
WORKDIR /app
ADD package.json .

RUN npm i
ADD . .
USER blessuser

CMD [ "node", "src/index.js" ]
