console.log("Starting static webserver on port 10000")
var http = require('http');
var fs = require('fs');
var path = require('path');
var url  = require('url');

http.createServer(function (request, response) {
	console.log( "[webproxy]", request.method, request.url )

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
		case '.png':
			contentType = 'image/png';
			break;
	}

	var content;
	try {
		content = fs.readFileSync('.'+pathname )
	}  catch (e) {}
	try {
		if ( pathname.slice(-1) === '/' ) {
			content = fs.readFileSync('.'+pathname + 'index.html' )
		}

	}  catch (e) {}

	if (content) {
		response.writeHead(200, { 'Content-Type': contentType });
		response.end(content);
	} else {
		fs.readFile('./404.html', function(error, content) {
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(content, 'utf-8');
		});
	}
}).listen(10000);
