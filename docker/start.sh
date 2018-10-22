#!/bin/sh

cd /htdocs
node /index.js &


cd /
/usr/bin/java -Djava.library.path=/DynamoDBLocal_lib/ -jar DynamoDBLocal.jar -delayTransientStatuses -sharedDb -dbPath /var/dynamo -port 8000 &

# -inMemory

sh
