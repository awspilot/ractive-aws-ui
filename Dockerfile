
# docker build --no-cache -t awspilotcom/dynamodb-ui .

FROM amazonlinux:2
RUN yum install -y java
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install -y nodejs wget tar gzip


RUN wget -O /tmp/dynamodb_local_latest https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz
RUN tar xfz /tmp/dynamodb_local_latest
RUN rm -f /tmp/dynamodb_local_latest
ADD docker/index.js /index.js
ADD docker/start.sh /start.sh
RUN chmod +x /start.sh
ADD docker/index.html /htdocs/index.html
ADD dist /htdocs/dist
RUN npm install aws-sdk
CMD /start.sh
RUN mkdir /var/dynamo

CMD ["sh", "/start.sh"]
