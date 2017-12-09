var ddb;
var DynamoSQL;

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
		ddb = new AWS.DynamoDB(this.get('account.key'))
		DynamoSQL = new window['@awspilot/dynamodb-sql'](ddb)
	},
})
