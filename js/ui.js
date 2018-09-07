var ddb;
var DynamoSQL;

Ractive.components.dynamoui = Ractive.extend({
	template:
		"\
			<WindowHost />\
			<header></header>\
			<left>\
				<tablelist />\
			</left>\
			<content>\
				<tabs />\
			</content>",
	data: {},
	components: {
		Window: RactiveWindow.default.Window,
		WindowHost: RactiveWindow.default.WindowHost,
	},
	oninit: function() {
		var credentials = this.get('account.key')
		if (this.get('account.endpoint'))
			credentials.endpoint = this.get('account.endpoint')

		ddb = new AWS.DynamoDB(credentials)
		DynamoSQL = new window['@awspilot/dynamodb-sql'](ddb)
	},
})
