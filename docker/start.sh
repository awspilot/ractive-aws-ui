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
export CF_LOG_REQUESTS=true
export IAM_ENDPOINT='http://localhost:10006/'
export IAM_KEY='myKeyId'
export IAM_SECRET='my-lil-secret'
/awsmock/node_modules/.bin/cf-mock &

# start dynamodb in-between layer on port 1004
export CW_ENDPOINT='http://localhost:10005/'
/awsmock/node_modules/.bin/dynamodb-mock &



# start cw-mock on port 10005
export CW_DYNAMODB_ENDPOINT='http://localhost:8000'
export CW_DYNAMODB_KEY='myKeyId'
export CW_DYNAMODB_SECRET="my-lil-secret"
/awsmock/node_modules/.bin/cw-mock &

# start s3-mock on port 10003
/awsmock/node_modules/.bin/s3rver -d /storage/s3 -a 0.0.0.0 -p 10003 --silent &

# start iam mock
# export IAM_DYNAMODB_ENDPOINT='http://localhost:8000'
# export IAM_DYNAMODB_KEY='myKeyId'
# export IAM_DYNAMODB_SECRET='secretKey'
# export IAM_DYNAMODB_REGION='global'
# export IAM_DYNAMODB_TABLE='iam_users'
# /awsmock/node_modules/.bin/iam-mock &

cd /awsmock/htdocs
node /awsmock/index.js
