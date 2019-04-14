


var RoutingProxy = require('@awspilot/cloudfront-mock');

new RoutingProxy({ agent: false })
	.upstream('/', 'http://localhost:10000/')
	.upstream('/v1/cloudformation', [ 'http://localhost:10001/v1/cloudformation' ])
	.upstream('/v1/s3', [ 'http://localhost:10003' ])

	.upstream('/v1/dynamodb', [ 'http://localhost:10004' ])
	.listen(80);
