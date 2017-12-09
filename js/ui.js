var ddb;
Ractive.components.dynamoui = Ractive.extend({
	template:
		"\
			<header></header>\
			<left>\
				<tablelist />\
			</left>\
			<content>\
				<tabs />\
			</content>",
	data: {},

	oninit: function() {
		ddb = new AWS.DynamoDB(this.get('key'))
	},
})
