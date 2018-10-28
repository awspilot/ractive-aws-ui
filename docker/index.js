console.log("Starting static webserver and dynamodb proxy server")
var http = require('http');
var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" })
var dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });
var is_demo = process.env.DEMO == '1';
console.log("demo is ", is_demo ? 'ON' : 'OFF' )
http.createServer(function (request, response) {
	console.log( request.method, request.url )
	if ( request.method === 'POST' && request.url === '/v1/dynamodb') {
		var body = '';

		request.on('data', function (data) { body += data;});

		request.on('end', function () {

			var event = {
				_POST: JSON.parse(body)
			}
			response.writeHead(200, { 'Content-Type': 'application/json' });

			if (is_demo) {

				if ( event._POST.method === 'deleteTable' && (['world_cities'].indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'deleteTable forbidden in demo'}, }));
				if ( event._POST.method === 'updateTable' && (['world_cities'].indexOf(event._POST.payload.TableName) !== -1) )
					return response.end(JSON.stringify({ err: { errorMessage: 'updateTable forbidden in demo'}, }));

			}


			switch ( event._POST.method ) {
				case 'listTables':
				case 'createTable':
				case 'deleteTable':
				case 'describeTable':
				case 'updateTable':
				case 'scan':
				case 'query':
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

	var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';

	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}

	fs.readFile(filePath, function(error, content) {
		if (error) {
			if(error.code == 'ENOENT'){
				fs.readFile('./404.html', function(error, content) {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				});
			}
			else {
				response.writeHead(500);
				response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
				response.end();
			}
		}
		else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	});

}).listen(80);