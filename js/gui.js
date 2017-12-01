$(function() {

	var ractive = new Ractive({
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
	$('body').data('ractive', ractive )
	ractive.on('open-table', function(e, table ) {
		$('body').data('ractive').findComponent('tabs').newtab('tableview', table )

	})
})


var ddb = new AWS.DynamoDB({
	region: 'us-east-1',
	credentials: {
		accessKeyId: 'xxxxxxx',
		secretAccessKey: 'yyyyyyy',
	}
})
