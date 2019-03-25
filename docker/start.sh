#!/bin/sh

cd /
/usr/bin/java -Djava.library.path=/DynamoDBLocal_lib/ -jar DynamoDBLocal.jar -cors * -dbPath /storage/dynamodb -port 8000 &

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

# start web server
cd /awsmock/htdocs
node /awsmock/ui.js &

# start cloudformation on port 10001
/awsmock/node_modules/.bin/cf-mock &

# start dynamodb in-between layer on port 10002
cd /awsmock/htdocs
node /awsmock/dynamodb.js &


# start s3-mock on port 10003
/awsmock/node_modules/.bin/s3rver -d ./storage/s3 -a 0.0.0.0 -p 10003 &

cd /awsmock/htdocs
node /awsmock/index.js
