
var ractive;
var selected_account;

var json_post = function(url, payload, cb ) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			cb(null, JSON.parse(xhr.responseText))
		}
	};
	var data = JSON.stringify(payload);
	xhr.send(data);
}

var routeCall = function( call, cb ) {
	if (window.installation_type === 'apigw') {
		json_post('/v1/dynamodb', call, cb )
		return;
	}
	// call.operation
	// call.payload
	console.log("routing call", call )
};
window.addEventListener('load', function() {
	ractive = new Ractive({
		el: 'body',
		template: "\
			{{#if selected_account}}\
				<dynamoui account='{{selected_account}}' />\
			{{else}}\
				{{#if installation_type === 'apigw'}}\
					<dynamoui account='{{autoaccount}}' />\
				{{else}}\
				<login />\
				{{/if}}\
			{{/if}}\
			",
		data: {
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
		},
	})

	ractive.on('open-table', function(e, table ) {
		ractive.findComponent('tabs').newtab('tableview', table )
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
