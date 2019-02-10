#!/bin/sh

cd /
/usr/bin/java -Djava.library.path=/DynamoDBLocal_lib/ -jar DynamoDBLocal.jar -cors * -dbPath /var/dynamo -port 8000 &

cd /awsmock/
export CF_DYNAMODB_ENDPOINT="http://localhost:8000"
export CF_DYNAMODB_KEY="myKeyId"
export CF_DYNAMODB_SECRET="secretKey"
export CF_DYNAMODB_REGION_PREFIX="aws-"
# CF_DYNAMODB_REGION - will be taken from path in new AWS.Cloudformation

export DYNAMODB_ENDPOINT="http://localhost:8000"
export DYNAMODB_KEY="myKeyId"
export DYNAMODB_SECRET="secretKey"
# DYNAMODB_REGION - will be taken from path in new AWS.Cloudformation

/awsmock/node_modules/.bin/cf-mock &

cd /awsmock/htdocs
node /awsmock/index.js
