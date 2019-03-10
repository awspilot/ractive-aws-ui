
var ractive;
var selected_account;

deparam = (function(d,x,params,pair,i) {
return function (qs) {
	params = {};
	qs = qs.substring(qs.indexOf('?')+1).replace(x,' ').split('&');
	for (i = qs.length; i > 0;) {
		pair = qs[--i].split('=');
		params[d(pair[0])] = d(pair[1]);
	}
	return params;
};//--  fn  deparam
})(decodeURIComponent, /\+/g);

var json_post = function(url, payload, cb ) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	if (window.installation_type === 'docker')
		xhr.setRequestHeader("Region", deparam( location.href ).region || 'us-east-1' );

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			cb(JSON.parse(xhr.responseText))
		}
	};
	var data = JSON.stringify(payload);
	//xhr.error(cb)
	//xhr.addEventListener("error", cb );
	xhr.send(data);
}

var routeCall = function( call, cb ) {
	if (window.installation_type === 'apigw') {
		json_post('/v1/dynamodb', call, function(data) {
			cb(data.err, data.data )
		} )
		return;
	}

	if (window.installation_type === 'docker') {
		json_post('/v1/wrapdynamodb', call, function(data) {
			cb(data.err, data.data )
		} )
		return;
	}

	// call.operation
	// call.payload
	console.log("routing call", call )
};
window.addEventListener('load', function() {
	ractive = new Ractive({
		el: 'body',
		components: {
			Window: RactiveWindow.default.Window,
			WindowHost: RactiveWindow.default.WindowHost,
		},
		template: `
			<WindowHost />
			<header>
				{{#if installation_type === 'docker'}}
					<div class="dropdown services-dropdown pull-left" style="margin-left: 100px;">
						<a on-click="@this.toggle('show_services_dropdown')">
							Services
							<i class="icon zmdi {{#if show_services_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>
						</a>
						<div class="dropdown-menu {{#if show_services_dropdown}}show{{/if}}">
							<li><a class="dropdown-item" href="/cloudformation/?region={{region}}">Cloudformation</a>
							<li><a class="dropdown-item" href="/dynamodb/?region={{region}}">DynamoDB</a>
						</div>
					</div>

					<div class="dropdown region-dropdown pull-right">
						<a on-click="@this.toggle('show_region_dropdown')">
							{{#regions}}{{#if region === .id }}{{.name}}{{/if}}{{/regions}}
							<i class="icon zmdi {{#if show_region_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>
						</a>
						<div class="dropdown-menu {{#if show_region_dropdown}}show{{/if}}">
							{{#regions}}
								<li class="{{#if region === .id }}active{{/if}}"><a class="dropdown-item" href="?region={{.id}}">{{.name}}</a>
							{{/regions}}
						</div>
					</div>
				{{/if}}
			</header>
			{{#if service === 'dynamodb' }}
				{{#if selected_account}}
					<dynamoui account='{{selected_account}}' installation_type='{{installation_type}}' region="{{region}}" />
				{{else}}
					{{#if installation_type === 'apigw'}}
						<dynamoui account='{{autoaccount}}' installation_type='{{installation_type}}' region="{{region}}" />
					{{/if}}
					{{#if installation_type === 'docker'}}
						<dynamoui account='{{autoaccount}}' installation_type='{{installation_type}}' region="{{region}}" />
					{{/if}}
					<!-- <login /> -->
				{{/if}}
			{{/if}}



			{{#if service === 'cloudformation' }}
				{{#if selected_account}}
					<cloudformationui account='{{selected_account}}' installation_type='{{installation_type}}' region="{{region}}" />
				{{else}}
					{{#if installation_type === 'apigw'}}
						AWSPilot Cloudformation is not available in AWS environment, use the AWS Cloudformation console instead
					{{/if}}
					{{#if installation_type === 'docker'}}
						<cloudformationui account='{{autoaccount}}' installation_type='{{installation_type}}' region="{{region}}" />
					{{/if}}
				{{/if}}
			{{/if}}

			`,
		data: function() {
			return {

				service: window.service,
				installation_type: window.installation_type,
				autoaccount: window.installation_type === 'apigw' ? {
					endpoint: location.protocol + '//' + location.host + '/v1/dynamodb',
					id: Math.random().toString(),
					key: {
						credentials: {
							accessKeyId: 'k',
							secretAccessKey: 's',
						},
						region: 'us-east-1',
					},
					name: '',
				} : null,


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
					{ id: 'sa-east-1',      name: 'South America (Sao Paulo)'},

				],
				region: deparam( location.href ).region || 'us-east-1',



			}
		},
	})

	ractive.on('open-table', function(e, table ) {
		ractive.findComponent('tabs').newtab('tabletab', table )
	})
	ractive.on('login.switch-account', function(e) {
		selected_account = ractive.findComponent('login').get(e.resolve())
		ractive.set('selected_account', selected_account )
		return false;
	})
	ractive.on('login.delete-account', function(e) {
		$session.account_delete(ractive.findComponent('login').get(e.resolve()))
		ractive.findComponent('login').set('accounts', $session.account_list() )
		return false;
	})
	ractive.on('login.add-account', function(e) {
		var new_account = ractive.findComponent('login').get('new');
		$session.account_add(new_account.name, new_account.key,  new_account.endpoint )
		ractive.findComponent('login').set('accounts', $session.account_list() )
		ractive.findComponent('login').set('new')
		return false;
	})
})
