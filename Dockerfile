
# docker build --no-cache -t awspilotcom/dynamodb-ui .

FROM amazonlinux:2
RUN yum install -y java
RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash -
RUN yum install -y nodejs wget tar gzip
RUN yum install -y net-tools


RUN wget -O /tmp/dynamodb_local_latest https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz
RUN tar xfz /tmp/dynamodb_local_latest
RUN rm -f /tmp/dynamodb_local_latest


ADD docker/index.js       /awsmock/index.js


ADD docker/ui.js          /awsmock/ui.js
ADD docker/start.sh       /awsmock/start.sh
RUN chmod +x              /awsmock/start.sh
ADD docker/package.json   /awsmock/package.json

ADD docker/htdocs         /awsmock/htdocs
ADD dist                  /awsmock/htdocs/dist


RUN cd /awsmock && npm install



RUN mkdir /storage
RUN mkdir /storage/dynamodb
RUN mkdir /storage/s3


CMD ["sh", "/awsmock/start.sh"]
