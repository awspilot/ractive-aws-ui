var ddb;
var DynamoSQL;
var DynamoDB;
var DynamodbFactory;





Ractive.components.dynamoui = Ractive.extend({
	template:
		`
			<hsplit style='top: 56px;'>
				<left>
					<minitablelist />
				</left>
				<content>
					<tabs active_id='tables' />
				</content>
			</hsplit>
		`,


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
