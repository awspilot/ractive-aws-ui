console.log("Starting static webserver and dynamodb proxy server")
var http = require('http');
var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');
var url  = require('url');
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

	var pathname = url.parse(request.url).pathname

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
		case '.svg':
			contentType = 'image/svg+xml';
			break;
	}

	var content;
	try {
		content = fs.readFileSync('.'+pathname, 'utf8' )
	}  catch (e) {}
	try {
		if ( pathname.slice(-1) === '/' ) {
			content = fs.readFileSync('.'+pathname + 'index.html', 'utf8' )
		}

	}  catch (e) {}

	if (content) {
		response.writeHead(200, { 'Content-Type': contentType });
		response.end(content, 'utf-8');
	} else {
		fs.readFile('./404.html', function(error, content) {
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(content, 'utf-8');
		});
	}


	//
	// fs.readFile(filePath, function(error, content) {
	// 	if (error) {
	// 		if(error.code == 'ENOENT'){
	// 			fs.readFile('./404.html', function(error, content) {
	// 				response.writeHead(200, { 'Content-Type': contentType });
	// 				response.end(content, 'utf-8');
	// 			});
	// 		}
	// 		else {
	// 			response.writeHead(500);
	// 			response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
	// 			response.end();
	// 		}
	// 	}
	// 	else {
	// 		response.writeHead(200, { 'Content-Type': contentType });
	// 		response.end(content, 'utf-8');
	// 	}
	// });

}).listen(80);
