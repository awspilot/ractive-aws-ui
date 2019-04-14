console.log("Starting dynamodb proxy server on port 10002")
var http = require('http');
var AWS = require('aws-sdk');

AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" })
var is_demo = process.env.DEMO == '1';
console.log("demo is ", is_demo ? 'ON' : 'OFF' )
http.createServer(function (request, response) {
	console.log( "[dynamoproxy]", request.method, request.url )
	if ( request.method === 'POST') {
		var dynamodb = new AWS.DynamoDB({
			endpoint: new AWS.Endpoint('http://localhost:8000'),
			region: request.headers.region || 'us-east-1'
		});

		var body = '';

		request.on('data', function (data) { body += data;});

		request.on('end', function () {

			var event = {
				_POST: JSON.parse(body)
			}
			response.writeHead(200, { 'Content-Type': 'application/json' });

			var demo_tables = [ 'cities','countries' ];
			if (is_demo) {

				if ( event._POST.method === 'deleteTable' && (demo_tables.indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'deleteTable forbidden in demo'}, }));
				if ( event._POST.method === 'updateTable' && (demo_tables.indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'updateTable forbidden in demo'}, }));

				if ( event._POST.method === 'putItem'  && (demo_tables.indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'putItem forbidden in demo'}, }));
				if ( event._POST.method === 'deleteItem'  && (demo_tables.indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'deleteItem forbidden in demo'}, }));

			}


			switch ( event._POST.method ) {
				case 'listTables':
				case 'createTable':
				case 'deleteTable':
				case 'describeTable':
				case 'describeTimeToLive':
				case 'updateTimeToLive':
				case 'updateTable':
				case 'scan':
				case 'query':
				case 'deleteItem':
				case 'putItem':
					dynamodb[event._POST.method](event._POST.payload, function(err, data) {
						response.end(JSON.stringify({ err: err, data:data }));
					})
					break;
				default:
					response.end(JSON.stringify({err:'not-implemented', event: event }));
			}
		});
		return;
	}
}).listen(10002);
