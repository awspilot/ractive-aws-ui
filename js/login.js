

Ractive.components.login = Ractive.extend({
	template:
		"\
		<div class='loginbox'>					\
			{{#accounts}}							\
				<account on-click='switch-account'> \
					<name>{{.name}}</name>			\
					<key>{{.key.credentials.accessKeyId}}</key>\
					<region>{{.key.region}}</region>\
					<delete on-click='delete-account'><i class='zmdi zmdi-delete'></i></delete>\
				</account>							\
			{{/accounts}}						\
			\
			<input type='text' value='{{new.key.credentials.accessKeyId}}'     placeholder='AccessKeyId'>\
			<input type='text' value='{{new.key.credentials.secretAccessKey}}' placeholder='SecretAccessKey'>\
			<input type='text' value='{{new.key.region}}'                      placeholder='region ie. us-east-1'>\
			<input type='text' value='{{new.name}}'                            placeholder='Name this config'>\
			<add on-click='add-account'>Add Account</add>\
		</div>								\
		",
	data: {},

	oninit: function() {
		var ractive = this
		ractive.set('accounts', $session.account_list())
	},
})
