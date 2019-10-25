


var RoutingProxy = require('@awspilot/cloudfront-mock');

new RoutingProxy({ agent: false })
	.upstream('/', 'http://localhost:10000/')
	.upstream('/v1/cloudformation', [ 'http://localhost:10001/v1/cloudformation' ])
	.upstream('/v1/s3', [ 'http://localhost:10003' ])
	.upstream('/v1/dynamodb', [ 'http://localhost:10004' ])
	.upstream('/v1/cloudwatch', [ 'http://localhost:10005' ])
	.upstream('/v1/iam', [ 'http://localhost:10006' ])
	.listen(80);
