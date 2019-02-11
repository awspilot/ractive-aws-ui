


var RoutingProxy = require('./proxylib');

new RoutingProxy({ agent: false })
	.upstream('/', 'http://localhost:10000')
	.upstream('/v1/cloudformation', [ 'http://localhost:10001' ])
	.upstream('/v1/dynamodb', [ 'http://localhost:10002' ])
	.listen(80);
