
var ractive;
var selected_account;
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
					credentials: {},
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
