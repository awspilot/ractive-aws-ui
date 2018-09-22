var ddb;
var DynamoSQL;
var DynamoDB;
var DynamodbFactory;
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

		if (this.get('account.endpoint')) {
			credentials.endpoint = this.get('account.endpoint')
			if (this.get('account.endpoint').indexOf( location.protocol + '//' + location.host ) === 0) {
				// dynamodb is proxied via same host, force version signature 3 so Authorization header is not used
				credentials.signatureVersion = 'v3'
				// httpOptions: { xhrWithCredentials: true },
			}
		}

		ddb = new AWS.DynamoDB(credentials)
		DynamoSQL = new window['@awspilot/dynamodb-sql'](ddb)
		DynamodbFactory = window['@awspilot/dynamodb']
		DynamoDB  = new DynamodbFactory(ddb)

	},
})
