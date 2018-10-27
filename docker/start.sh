#!/bin/sh

cd /
/usr/bin/java -Djava.library.path=/DynamoDBLocal_lib/ -jar DynamoDBLocal.jar -cors * -dbPath /var/dynamo -port 8000 &

cd /htdocs
node /index.js
