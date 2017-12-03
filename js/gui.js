var ractive;
window.addEventListener('load', function() {
	var r = new Ractive({
		el: 'body',
		template: "\
			<header></header>\
			<left>\
				<tablelist />\
			</left>\
			<content>\
				<tabs />\
			</content>",
		data: {},
	})
	ractive = r
	ractive.on('open-table', function(e, table ) {
		ractive.findComponent('tabs').newtab('tableview', table )
	})
})


var ddb = new AWS.DynamoDB({
	region: 'us-east-1',
	credentials: {
		accessKeyId: 'xxxxxxx',
		secretAccessKey: 'yyyyyyy',
	}
})
//var DynamoDB = new window['@awspilot/dynamodb'](ddb)
var DynamoSQL = new window['@awspilot/dynamodb-sql'](ddb)
