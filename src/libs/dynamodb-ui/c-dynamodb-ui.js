var ddb;
var DynamoSQL;
var DynamoDB;
var DynamodbFactory;
Ractive.components.dynamoui = Ractive.extend({
	template:
		`
			<WindowHost />
			<header>
				{{#if installation_type === 'docker'}}
					<div class="dropdown pull-right">
						<a class="btn" type="button" on-click="@this.toggle('show_region_dropdown')">
							{{#regions}}{{#if region === .id }}{{.name}}{{/if}}{{/regions}}
						</a>
						<div class="dropdown-menu {{#if show_region_dropdown}}show{{/if}}">
							{{#regions}}
								<li class="{{#if region === .id }}active{{/if}}"><a class="dropdown-item" href="?{{.id}}">{{.name}}</a>
							{{/regions}}
						</div>
					</div>
				{{/if}}
			</header>
			<hsplit style='top: 56px;'>
				<left>
					<minitablelist />
				</left>
				<content>
					<tabs active_id='tables' />
				</content>
			</hsplit>
		`,
	data: function() {
		return {
			regions: [
				{ id: 'us-east-1',      name: 'US East (N. Virginia)'},
				{ id: 'us-east-2',      name: 'US East (Ohio)'},
				{ id: 'us-west-1',      name: 'US West (N. California)'},
				{ id: 'us-west-2',      name: 'US West (Oregon)'},
				{ id: 'ap-south-1',     name: 'Asia Pacific (Mumbai)'},
				{ id: 'ap-northeast-2', name: 'Asia Pacific (Seoul)'},
				{ id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)'},
				{ id: 'ap-southeast-2', name: 'Asia Pacific (Sydney)'},
				{ id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)'},
				{ id: 'ca-central-1',   name: 'Canada (Central)'},
				{ id: 'eu-central-1',   name: 'EU (Frankfurt)'},
				{ id: 'eu-west-1',      name: 'EU (Ireland)'},
				{ id: 'eu-west-2',      name: 'EU (London)'},
				{ id: 'eu-west-3',      name: 'EU (Paris)'},
				{ id: 'eu-north-1',     name: 'EU (Stockholm)'},
				{ id: 'sa-east-1',      name: 'South America (São Paulo)'},

			],
			region: 'us-east-1',
		}
	},
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
