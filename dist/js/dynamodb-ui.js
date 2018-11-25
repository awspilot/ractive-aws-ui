
var $session;
(function() {
	function session() {
	}
	session.prototype.account_list = function() {
		var accounts = JSON.parse(localStorage.getItem("accounts") || "[]")

		return accounts
	}

	session.prototype.account_add = function( name, key, endpoint ) {

		var new_account = {
			id: id=Math.random().toString().slice(2),
			name: name,
			key: key,
			endpoint: endpoint,
		}
		var account_list = this.account_list();
		account_list.push( new_account )

		localStorage.setItem("accounts", JSON.stringify(account_list))

	}
	session.prototype.account_delete = function( account ) {
		var account_list = this.account_list().filter(function(a) { return a.id !== account.id })
		localStorage.setItem("accounts", JSON.stringify(account_list))
	}

	$session = new session()
})($session)


var ractive;
var selected_account;

var json_post = function(url, payload, cb ) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
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
		data: function() {
			return {
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

Ractive.components.minitablelist = Ractive.extend({
	//isolated: true,
	template:
		"\
		<miniheader>\
			Tables\
			<div class='pull-right' style='margin-right: 5px;'>\
				<a class='btn btn-xs btn-default' on-click='create' as-tooltip=' \" Create Table \" '><i class='icon zmdi zmdi-plus'></i></a>\
				<a class='btn btn-xs btn-default' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh'></i></a>\
			</div>\
		</miniheader>\
		<scrollarea class='scrollarea miniheaderbody' style='position: absolute;'>\
		<tables>\
			{{#tables}}\
			<div on-click='@this.fire(\"open-table\",.)'> {{.}} </div>\
			{{/tables}}\
		</tables>\
		</scrollarea>\
		",
	data: function() { return {} },
	refresh_tables: function() {
		var ractive = this

		ractive.set('tables')

		DynamoDB.explain().query('SHOW TABLES', function(err, call ) {
			if (err)
				return console.log(err)

			routeCall( call, function( err, data ) {
				if (err)
					return ractive.set('err', err )

				ractive.set('err')
				ractive.set('tables', data.TableNames )
			} )
		})
		//ddb.listTables({}, function(err, data) {
		//})
	},
	oninit: function() {
		this.refresh_tables()
		var ractive = this
		ractive.on('open-table', function(e, table ) {
			ractive.root.fire('open-table', table )
		})
		ractive.on('create', function() {
			ractive.root.findComponent('tabs').newtab('tablecreate', 'Create Table' )
		})
	},
})


Ractive.components.tablelistfull = Ractive.extend({
	//isolated: true,
	template:
		"\
			<div class='pull-right' style='padding: 7px;'>\
				<a class='btn btn-xs btn-primary ' on-click='create'><i class='icon zmdi zmdi-plus'></i> CREATE TABLE <i class='zmdi'></i></a>\
				<a class='btn btn-xs btn-default {{#if selection_length > 0}}{{else}}disabled{{/if}}' on-click='delete' as-tooltip=' \" Delete table \" '><i class='icon zmdi zmdi-delete'></i></a>\
				<a class='btn btn-xs btn-default {{#if refresh_tables }}disabled{{/if}}' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh {{#if refresh_tables }}zmdi-hc-spin{{/if}}'></i></a>\
			</div>\
		\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 38px;' />\
		",
	data: function() {
		return {
			selection_length: 0,
			refresh_tables: false,
		}
	},
	refresh_tables: function() {
		var ractive = this
		ractive.set('refresh_tables', true)
		ractive.set('tables')

		DynamoDB.explain().query('SHOW TABLES', function(err, call ) {


			if (err)
				return console.log(err)

			routeCall( call, function( err, data ) {
				ractive.set('refresh_tables', false)

				if (err)
					return ractive.set('err', err )

				ractive.set('err')

				ractive.set('columns', [ null, 'Name', 'Status', 'Partition', 'Sort', 'Indexes', 'Read Capacity', 'Write Capacity'])
				ractive.set('rows', data.TableNames.map(function(t) {
					return [
						{ KEY: true },
						{ S: t },
						{ },
						{ },
						{ },
						{ },
						{ },
						{ }
					]
				}) )
				var waterfallz = data.TableNames.map(function(t) {

					var f = function( cb ) {
						//console.log(t)
						routeCall({ method: 'describeTable', payload: { TableName: t} }, function(err, data) {
							if (err)
								return cb()

							ractive.set('rows', ractive.get('rows').map(function(row) {
								if ( row[1].S === t ) {

									row[2].S = data.Table.TableStatus
									row[3].S = ((data.Table.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'HASH'})[0] || {}).AttributeName || '-'
									row[4].S = ((data.Table.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'RANGE'})[0] || {}).AttributeName || '-'
									row[5].S = (data.Table.GlobalSecondaryIndexes || []).length.toString()
									row[6].S = ([ data.Table.ProvisionedThroughput.ReadCapacityUnits ].concat( (data.Table.GlobalSecondaryIndexes || []).map(function(tr) { return tr.ProvisionedThroughput.ReadCapacityUnits }) )).reduce(function(a, b) { return a + b; }, 0)
									row[7].S = ([ data.Table.ProvisionedThroughput.WriteCapacityUnits ].concat( (data.Table.GlobalSecondaryIndexes || []).map(function(tr) { return tr.ProvisionedThroughput.WriteCapacityUnits }) )).reduce(function(a, b) { return a + b; }, 0)

								}
								return row
							}))
							cb()
						})
					}
					return f;
				})

				async.parallel(waterfallz, function( err ) {


				})
				//ractive.set('tables', data.TableNames )
			} )
		})
		//ddb.listTables({}, function(err, data) {
		//})
	},
	oninit: function() {
		this.refresh_tables()
		var ractive = this
		//ractive.on('open-table', function(e, table ) {
		//	ractive.root.fire('open-table', table )
		//})
		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )

			ractive.set('selection_length',
				ractive.get('rows').filter(function(r) { return r[0].selected === true } ).length
			)
		})
		ractive.on('delete', function() {
			var selected = ractive.get('rows').filter(function(r) { return r[0].selected === true } );

			if ( selected.length === 0 )
				return alert('Please select a table to delete')

			if ( selected.length > 1 )
				return alert('Please select one table at a time')

			var tablename = selected[0][1].S

			if (confirm('Are you sure you want to delete table ' + tablename )) {
				routeCall({ method: 'deleteTable', payload: { TableName: tablename } }, function(err, data) {
					if (err)
						return alert( err.errorMessage )
					ractive.refresh_tables()
				})
			}

		})
		ractive.on('create', function() {
			ractive.root.findComponent('tabs').newtab('tablecreate', 'Create Table' )
		})
	},
})



Ractive.components.tablecreate = Ractive.extend({
	//isolated: true,
	template: "\
		<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
			<div style='padding: 30px'>\
				<h3>Create DynamoDB table</h3>\
				<br>\
				<div style='color:red'>{{ err }}</div>\
				<hr>\
				DynamoDB is a schema-less database that only requires a table name and primary key. The table's primary key is made up of one or two attributes that uniquely identify items, partition the data, and sort data within each partition.\
				\
				<br><br>\
				<table cellpadding='10'>\
					<tr>\
						<td>Table name</td>\
						<td><input type='text' value='{{newtable.TableName}}' on-focus='focus'></td>\
					</tr>\
					<tr>\
						<td>Partition key</td>\
						<td><input type='text' value='{{ newtable.AttributeDefinitions.0.AttributeName }}'></td>\
						<td>\
							<select value='{{ newtable.AttributeDefinitions.0.AttributeType }}' on-focus='focus'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					<tr>\
						<td></td>\
						<td><input type='checkbox' checked='{{newtable.sort_enabled}}' />Add sort key</td>\
					</tr>\
					{{#if newtable.sort_enabled}}\
					<tr>\
						<td>Sort key</td>\
						<td><input type='text' value='{{newtable.sort_key_name}}' on-focus='focus'></td>\
						<td>\
							<select value='{{ newtable.sort_key_type}}' on-focus='focus'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					{{/if}}\
				</table>\
				<br><br>\
				<h4>Secondary indexes</h4>\
				<table cellpadding='10' border='0'>\
					<tr style='background-color: #eadfdf'>\
						<td>Name</td>\
						<td>Type</td>\
						<td>Partition key</td>\
						<td>Sort key</td>\
						<td>Projection type</td>\
						<td>Projected attributes</td>\
						<td></td>\
					</tr>\
					{{#newtable.LocalSecondaryIndexes:i}}\
					<tr style='background-color: #ffefef'>\
						<td><input type='text' value='{{.IndexName}}' on-focus='focus' /></td>\
						<td>LSI</td>\
						<td><input type='text' value='{{ newtable.AttributeDefinitions.0.AttributeName }}' disabled> ( \
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'S' }}String{{/if}}\
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'N' }}Number{{/if}}\
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'B' }}Binary{{/if}}\
						)</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'RANGE'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							<select value='{{.Projection.ProjectionType}}'>\
								<option value='ALL'>ALL</option>\
								<option value='KEYS_ONLY'>KEYS_ONLY</option>\
								<option value='INCLUDE'>INCLUDE</option>\
							</select>\
						</td>\
						<td>\
							{{#if .Projection.ProjectionType === 'INCLUDE'}}\
							\
							{{#.Projection.NonKeyAttributes}}\
								<span class='badge badge-info'>{{.}}</span><br>\
							{{/.Projection.NonKeyAttributes}}\
							\
							<input type='text' value='{{ ~/nonkeyattribute }}' /><a class='btn btn-xs btn-primary' on-click='add-nonkey-attribute'><i class='icon zmdi zmdi-plus'></i></a>\
							\
							{{/if}}\
						</td>\
						<td>\
							<a class='btn btn-xs btn-danger' on-click='lsi-delete'><i class='zmdi zmdi-delete'></i></a>\
						</td>\
					</tr>\
					{{/newtable.LocalSecondaryIndexes}}\
					\
					\
					{{#newtable.GlobalSecondaryIndexes:i}}\
					<tr style='background-color: #ffefef'>\
						<td><input type='text' value='{{.IndexName}}' on-focus='focus' /></td>\
						<td>GSI</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'HASH'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'RANGE'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							<select value='{{.Projection.ProjectionType}}'>\
								<option value='ALL'>ALL</option>\
								<option value='KEYS_ONLY'>KEYS_ONLY</option>\
								<option value='INCLUDE'>INCLUDE</option>\
							</select>\
						</td>\
						<td>\
							{{#if .Projection.ProjectionType === 'INCLUDE'}}\
							\
							{{#.Projection.NonKeyAttributes}}\
								<span class='badge badge-info'>{{.}}</span><br>\
							{{/.Projection.NonKeyAttributes}}\
							\
							<input type='text' value='{{ ~/nonkeyattribute }}' /><a class='btn btn-xs btn-primary' on-click='add-nonkey-attribute'><i class='icon zmdi zmdi-plus'></i></a>\
							\
							{{/if}}\
						</td>\
						<td>\
							<a class='btn btn-xs btn-danger' on-click='gsi-delete'><i class='zmdi zmdi-delete'></i></a>\
						</td>\
					</tr>\
					{{/newtable.GlobalSecondaryIndexes}}\
					\
				</table>\
				<a class='btn btn-md btn-default' on-click='lsi-add'>Add LSI</a>\
				<a class='btn btn-md btn-default' on-click='gsi-add'>Add GSI</a>\
				<br>\
				<br>\
				<h4>Provisioned capacity</h4>\
				<table cellpadding='10'>\
					<tr>\
						<td></td>\
						<td>Read capacity</td>\
						<td>Write capacity</td>\
					</tr>\
					<tr>\
						<td>Table</td>\
						<td><input type='text' value='{{newtable.ProvisionedThroughput.ReadCapacityUnits}}'  size='4' on-focus='focus' /></td>\
						<td><input type='text' value='{{newtable.ProvisionedThroughput.WriteCapacityUnits}}' size='4' on-focus='focus' /></td>\
					</tr>\
					{{#newtable.GlobalSecondaryIndexes:i}}\
					<tr>\
						<td>{{.IndexName}} ( GSI )</td>\
						<td><input type='text' value='{{.ProvisionedThroughput.ReadCapacityUnits}}'  size='4' on-focus='focus' /></td>\
						<td><input type='text' value='{{.ProvisionedThroughput.WriteCapacityUnits}}' size='4' on-focus='focus' /></td>\
					</tr>\
					{{/newtable.GlobalSecondaryIndexes}}\
				</table>\
				<br>\
				<hr>\
				<div style='color:red'>{{ errorMessage }}&nbsp;</div>\
				<br>\
				<a class='btn btn-md btn-primary' on-click='create'>Create</a>\
				<br>\
			</div>\
		</scrollarea>\
	",
	data: function() {
		return {
			newtable: {
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1,
				},

				AttributeDefinitions: [
					{
						AttributeName: '',
						AttributeType: 'S'
					}
				],
				LocalSecondaryIndexes: [],
				GlobalSecondaryIndexes: [],
			},
		}
	},

	oninit: function() {
		var ractive = this
		ractive.on('lsi-add', function() {
			ractive.push('newtable.LocalSecondaryIndexes', {
				IndexName: '',
				KeySchema: [
					{
						AttributeName: ractive.get('newtable.AttributeDefinitions.0.AttributeName'),
						KeyType: 'HASH',
					},
					{
						AttributeName: '',
						KeyType: 'RANGE'
					},
				],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: [],
				},
			})
		})
		ractive.on('gsi-add', function() {
			ractive.push('newtable.GlobalSecondaryIndexes', {
				IndexName: '',
				KeySchema: [
					{
						AttributeName: '',
						KeyType: 'HASH',
					},
					{
						AttributeName: '',
						KeyType: 'RANGE'
					},
				],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: [],
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1,
				}
			})
		})
		ractive.on('add-nonkey-attribute', function(e) {
			var keypath = e.resolve() + '.Projection.NonKeyAttributes';
			ractive.push( keypath , ractive.get('nonkeyattribute'))
			ractive.set(  keypath , ractive.get( keypath ).filter(function(value,index,self) { return self.indexOf(value) === index; }))
			ractive.set('nonkeyattribute')
		})
		ractive.on('lsi-delete', function(e) {
			ractive.set('newtable.LocalSecondaryIndexes', ractive.get('newtable.LocalSecondaryIndexes').filter(function(val, key ) {
				return e.resolve() !== 'newtable.LocalSecondaryIndexes.' + key;
			}))
		})
		ractive.on('gsi-delete', function(e) {
			ractive.set('newtable.GlobalSecondaryIndexes', ractive.get('newtable.GlobalSecondaryIndexes').filter(function(val, key ) {
				return e.resolve() !== 'newtable.GlobalSecondaryIndexes.' + key;
			}))
		})

		ractive.observe('newtable.AttributeDefinitions.0.AttributeName', function() {
			ractive.set('newtable.LocalSecondaryIndexes', ractive.get('newtable.LocalSecondaryIndexes').map( function(lsi) {
				lsi.KeySchema[0].AttributeName = ractive.get('newtable.AttributeDefinitions.0.AttributeName')
				return lsi;
			}) )
		})

		ractive.on('focus', function() {
			ractive.set( 'errorMessage' )
		})
		ractive.on('create', function() {
			ractive.set( 'errorMessage' )



			var newtable = JSON.parse(JSON.stringify(ractive.get('newtable')))
			console.log('newtable', newtable )

			var payload = {
				TableName: newtable.TableName,
				AttributeDefinitions: newtable.AttributeDefinitions,
				KeySchema: [
					{
						AttributeName: newtable.AttributeDefinitions[0].AttributeName,
						KeyType: "HASH"
					},
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: newtable.ProvisionedThroughput.ReadCapacityUnits,
					WriteCapacityUnits: newtable.ProvisionedThroughput.WriteCapacityUnits,
				},
				GlobalSecondaryIndexes: newtable.GlobalSecondaryIndexes,
				LocalSecondaryIndexes:  newtable.LocalSecondaryIndexes,
			};

			if (ractive.get('newtable.sort_enabled')) {
				payload.KeySchema.push({
					AttributeName: newtable.sort_key_name,
					KeyType: "RANGE"
				})
				payload.AttributeDefinitions.push({
					AttributeName: newtable.sort_key_name,
					AttributeType: newtable.sort_key_type,
				})
			}

			payload.LocalSecondaryIndexes = payload.LocalSecondaryIndexes.map(function(lsi) {
				if (lsi.Projection.ProjectionType !== 'INCLUDE')
					delete lsi.Projection.NonKeyAttributes;

				if ( payload.AttributeDefinitions.map(function(atd) { return atd.AttributeName+'.'+atd.AttributeType }).indexOf( lsi.KeySchema[1].AttributeName + '.' + lsi.KeySchema[1].AttributeType ) === -1 )
					payload.AttributeDefinitions.push({
						AttributeName: lsi.KeySchema[1].AttributeName,
						AttributeType: lsi.KeySchema[1].AttributeType,
					})
				delete lsi.KeySchema[1].AttributeType;


				return lsi;
			})

			payload.GlobalSecondaryIndexes = payload.GlobalSecondaryIndexes.map(function(gsi) {
				if (gsi.Projection.ProjectionType !== 'INCLUDE')
					delete gsi.Projection.NonKeyAttributes;

				// add attribute, if not exists
				if ( payload.AttributeDefinitions.map(function(atd) { return atd.AttributeName+'.'+atd.AttributeType }).indexOf( gsi.KeySchema[0].AttributeName + '.' + gsi.KeySchema[0].AttributeType ) === -1 )
					payload.AttributeDefinitions.push({
						AttributeName: gsi.KeySchema[0].AttributeName,
						AttributeType: gsi.KeySchema[0].AttributeType,
					})
				delete gsi.KeySchema[0].AttributeType;

				if (gsi.KeySchema[1].AttributeName.trim().length) {
					if ( payload.AttributeDefinitions.map(function(atd) { return atd.AttributeName+'.'+atd.AttributeType }).indexOf( gsi.KeySchema[1].AttributeName + '.' + gsi.KeySchema[1].AttributeType ) === -1 )
						payload.AttributeDefinitions.push({
							AttributeName: gsi.KeySchema[1].AttributeName,
							AttributeType: gsi.KeySchema[1].AttributeType,
						})
					delete gsi.KeySchema[1].AttributeType;
				} else {
					gsi.KeySchema = [gsi.KeySchema[0]]
				}


				return gsi;
			})

			if (! payload.LocalSecondaryIndexes.length )
				delete payload.LocalSecondaryIndexes;

			if (! payload.GlobalSecondaryIndexes.length )
				delete payload.GlobalSecondaryIndexes;

			console.log("final payload", payload )
			routeCall({ method: 'createTable', payload: payload }, function(err, data) {
				if (err) {
					ractive.set( 'errorMessage', err.message )
					return
				}

				ractive.root.findComponent('tablelist').refresh_tables()
			})
		})
	},
})

Ractive.components.tabletab = Ractive.extend({
	//isolated: true,
	template:
		"<div class='tableview {{#if active}}active{{/if}}'>\
			<div class='tableview-table-tabs'>\
				<a class='btn-tableview-tab {{#if tab === \"info\"}}active{{/if}}'         on-click='@this.set(\"tab\",\"info\")'><!-- <i class='zmdi zmdi-info'></i>--> Overview </a>\
				<a class='btn-tableview-tab {{#if tab === \"data\"}}active{{/if}}'         on-click='@this.set(\"tab\",\"data\")'><!--<i class='zmdi zmdi-format-list-bulleted'></i>--> Items</a>\
				<a class='btn-tableview-tab {{#if tab === \"metrics\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"metrics\")'><!--<i class='zmdi zmdi-chart'></i>--> Metrics</a>\
				<a class='btn-tableview-tab {{#if tab === \"alarms\"}}active{{/if}}'       on-click='@this.set(\"tab\",\"alarms\")'><!--<i class='zmdi zmdi-notifications'></i>--> Alarms</a>\
				<a class='btn-tableview-tab {{#if tab === \"capacity\"}}active{{/if}}'     on-click='@this.set(\"tab\",\"capacity\")'><!--<i class='zmdi zmdi-memory'></i>--> Capacity</a>\
				<a class='btn-tableview-tab {{#if tab === \"indexes\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"indexes\")'><!--<i class='zmdi zmdi-format-line-spacing'></i>--> Indexes</a>\
				<a class='btn-tableview-tab {{#if tab === \"globaltables\"}}active{{/if}}' on-click='@this.set(\"tab\",\"globaltables\")'><!--<i class='zmdi zmdi-globe'></i>--> Global Tables</a>\
				<a class='btn-tableview-tab {{#if tab === \"backups\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"backups\")'><!--<i class='zmdi zmdi-card-sd'></i>--> Backups</a>\
				<a class='btn-tableview-tab {{#if tab === \"triggers\"}}active{{/if}}'     on-click='@this.set(\"tab\",\"triggers\")'><!--<i class='zmdi zmdi-portable-wifi'></i>--> Triggers</a>\
			</div>\
			<div style='position: absolute;top: 42px;left: 30px;right: 30px;bottom: 0px;'>\
				{{#if tab === 'info'}}\
					<tableinfo table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'data'}}\
					<tableitems table='{{.table}}' type='{{.type}}' scan='{{.scan}}' query='{{.query}}' sql='{{.sql}}' />\
				{{/if}}\
				\
				{{#if tab === 'metrics'}}\
					<tablemetrics table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'alarms'}}\
					<tablealarms table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'capacity'}}\
					<tablecapacity table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'indexes'}}\
					<tableindexes table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'globaltables'}}\
					<tableglobal table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'backups'}}\
					<tablebackup table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'triggers'}}\
					<tabletriggers table='{{.table}}'/>\
				{{/if}}\
			</div>\
		</div>",
	data: function() {
		return {
			tab: 'info',
		}
	},

	oninit: function() {

		var ractive = this
		ractive.on('tab', function(e, tab ) {
			console.log("tab", e.resolve(), e, tab )

		})

	},
})


Ractive.components.tableinfo = Ractive.extend({
	template: "\
		<div class='tableinfo'>\
			<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
				<div style='padding: 30px'>\
					<h3>\
						Table details\
						<a class='btn btn-xs btn-default pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
					</h3>\
					<div style='color:red'>{{ err }}</div>\
					<hr>\
					<table>\
						<tr>\
							<td align='right' width='350'><b>Table ID</b></td>\
							<td> {{ describeTable.TableId }}</td>\
						</tr>\
						<tr>\
							<td align='right' width='350'><b>Table name</b></td>\
							<td> {{ describeTable.TableName }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Primary partition key</b></td>\
							<td>\
								{{#describeTable.KeySchema:i}}\
									{{#if .KeyType === 'HASH'}}\
										{{.AttributeName}}\
										{{# ~/describeTable.AttributeDefinitions }}\
											{{#if .AttributeName === ~/.describeTable.KeySchema[i].AttributeName }}\
												{{#if .AttributeType === 'S'}}\
													( String )\
												{{/if}}\
												{{#if .AttributeType === 'N'}}\
													( Number )\
												{{/if}}\
												{{#if .AttributeType === 'B'}}\
													( Binary )\
												{{/if}}\
											{{/if}}\
										{{/}}\
									{{/if}}\
								{{/describeTable.KeySchema}}\
							</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Primary sort key</b></td>\
							<td>\
								{{#describeTable.KeySchema:i}}\
									{{#if .KeyType === 'RANGE'}}\
										{{.AttributeName}}\
										{{# ~/describeTable.AttributeDefinitions }}\
											{{#if .AttributeName === ~/.describeTable.KeySchema[i].AttributeName }}\
												{{#if .AttributeType === 'S'}}\
													( String )\
												{{/if}}\
												{{#if .AttributeType === 'N'}}\
													( Number )\
												{{/if}}\
												{{#if .AttributeType === 'B'}}\
													( Binary )\
												{{/if}}\
											{{/if}}\
										{{/}}\
									{{/if}}\
								{{/describeTable.KeySchema}}\
							</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Point-in-time recovery</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Encryption</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Time to live attribute</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Table status</b></td>\
							<td>{{describeTable.TableStatus}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Creation date</b></td>\
							<td>{{describeTable.CreationDateTime}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned read capacity units</b></td>\
							<td>{{describeTable.ProvisionedThroughput.ReadCapacityUnits}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned write capacity units</b></td>\
							<td>{{describeTable.ProvisionedThroughput.WriteCapacityUnits}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last decrease time</b></td>\
							<td>{{describeTable.ProvisionedThroughput.LastDecreaseDateTime || '-' }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last increase time</b></td>\
							<td>{{describeTable.ProvisionedThroughput.LastIncreaseDateTime || '-'}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Storage size (in bytes)</b></td>\
							<td>{{describeTable.TableSizeBytes }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Item count</b></td>\
							<td>{{ describeTable.ItemCount }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Region</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Amazon Resource Name (ARN)</b></td>\
							<td> {{describeTable.TableArn}}</td>\
						</tr>\
					</table>\
					<small>Storage size and item count are not updated in real-time. They are updated periodically, roughly every six hours.</small>\
				</div>\
			</scrollarea>\
		</div>",
	data: function() { return {} },
	oninit: function() {
		var ractive = this;
		var refresh_table = function() {
			ractive.set('describeTable', {})
			routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				if (err)
					return ractive.set('err', err.errorMessage );

				ractive.set('describeTable', data.Table)
			})

		}

		ractive.on('refresh-table', function() {
			refresh_table()
		})
		refresh_table()

	},
})


Ractive.components.tablemetrics = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Metrics</h3>\
		</div>\
	",
})

Ractive.components.tablealarms = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Alarms</h3>\
		</div>\
	",
})


Ractive.components.tablecapacity = Ractive.extend({
	template: "\
		<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
			<div style='padding: 30px'>\
				<h3>\
					Provisioned capacity\
					<a class='btn btn-xs pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
				</h3>\
				<hr>\
				<table>\
					<tr>\
						<td width='160' align='right'></td>\
						<td width='160'>Read capacity units</td>\
						<td width='160'>Write capacity units</td>\
					</tr>\
					<tr>\
						<td>Table</td>\
						<td><input type='text' size='4' value='{{describeTable.ProvisionedThroughput.ReadCapacityUnits}}' on-focus='focus' /></td>\
						<td><input type='text' size='4' value='{{describeTable.ProvisionedThroughput.WriteCapacityUnits}}' on-focus='focus' /></td>\
					</tr>\
					{{#describeTable.GlobalSecondaryIndexes}}\
					<tr>\
						<td>{{ .IndexName }}</td>\
						<td><input type='text' size='4' value='{{.ProvisionedThroughput.ReadCapacityUnits}}' on-focus='focus' /></td>\
						<td><input type='text' size='4' value='{{.ProvisionedThroughput.WriteCapacityUnits}}' on-focus='focus' /></td>\
					</tr>\
					{{/describeTable.GlobalSecondaryIndexes}}\
				</table>\
				<h3>Auto Scaling</h3>\
				<hr/>\
					<small>Auto Scaling not supported by this UI</small>\
					<br>\
					<div style='color:red'>{{ err }}&nbsp;</div>\
					<table>\
						<tr>\
							<td width='160'>\
							<td>\
								<a class='btn btn-md btn-primary' on-click='save'>Save</a>\
								<a class='btn btn-md btn-default' on-click='cancel'>Cancel</a>\
							</td>\
						</tr>\
					</table>\
			</div>\
		</scrollarea>\
	",
	oninit: function() {
		var ractive = this;
		var refresh_table = function() {
			ractive.set('describeTable', {})
			routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				if (err)
					return ractive.set('err', err.message );

				console.log(data)
				ractive.set('describeTable', data.Table)
				ractive.set('originalDescribeTable', JSON.parse(JSON.stringify( data.Table ))) // this wont change
			})
		}
		ractive.on('cancel', function() {
			refresh_table()
		})
		ractive.on('focus', function() {
			ractive.set( 'err' )
		})

		ractive.on('save', function() {



			var payload = {
				TableName: ractive.get('describeTable.TableName')
			};

			if (
				(ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits')  !== ractive.get('originalDescribeTable.ProvisionedThroughput.ReadCapacityUnits') ) ||
				(ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits') !== ractive.get('originalDescribeTable.ProvisionedThroughput.WriteCapacityUnits') )
			) {
				payload.ProvisionedThroughput = {
					ReadCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits'),
					WriteCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits'),
				}
			} else {
				// if no changes, do not add obj at all
				//payload.ProvisionedThroughput = { ... }
			}


			// each index
			if ((ractive.get('describeTable.GlobalSecondaryIndexes') || []).length) {
				payload.GlobalSecondaryIndexUpdates = []
				ractive.get('describeTable.GlobalSecondaryIndexes').map(function(gsi, i ) {
					var original_gsi = ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i )

					console.log("gsi",gsi)
					console.log("original gsi", original_gsi )


					if (
						(gsi.ProvisionedThroughput.ReadCapacityUnits  !==  ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i+'.ProvisionedThroughput.ReadCapacityUnits' ) ) ||
						(gsi.ProvisionedThroughput.WriteCapacityUnits !==  ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i+'.ProvisionedThroughput.WriteCapacityUnits') )
					) {
						payload.GlobalSecondaryIndexUpdates.push({
							Update: {
								IndexName: gsi.IndexName,
								ProvisionedThroughput: {
									ReadCapacityUnits:  gsi.ProvisionedThroughput.ReadCapacityUnits,
									WriteCapacityUnits: gsi.ProvisionedThroughput.WriteCapacityUnits,
								}
							}
						})
					}
				})
			}

			if ( (payload.GlobalSecondaryIndexUpdates || []).length === 0 )
				delete payload.GlobalSecondaryIndexUpdates;

			//console.log('payload', payload )

			routeCall({ method: 'updateTable', payload: payload }, function(err, data) {
				if (err)
					return ractive.set('err', err.message );



			 	setTimeout(refresh_table,1000)
				//console.log( err, data )
			})
		})
		ractive.on('refresh-table', function() {
			refresh_table()
		})
		refresh_table()

	},
})


Ractive.components.tableindexes = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			{{#if tab === 'create'}}\
				<h3>Create Global Secondary Index</h3>\
				<table cellpadding='10' border='0'>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Name</td>\
						<td><input type='text' value='{{newindex.IndexName}}' on-focus='focus' /></td>\
					</tr>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Type</td>\
						<td>GSI</td>\
					</tr>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Partition key</td>\
						<td>\
							<input type='text' value='{{ newindex.KeySchema.0.AttributeName }}' on-focus='focus' />\
							<select value='{{ newindex.KeySchema.0.AttributeType }}'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Sort key</td>\
						<td>\
							<input type='text' value='{{ newindex.KeySchema.1.AttributeName }}' on-focus='focus' />\
							<select value='{{ newindex.KeySchema.1.AttributeType }}'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Projection type</td>\
						<td>\
							<select value='{{ newindex.Projection.ProjectionType}}'>\
								<option value='ALL'>ALL</option>\
								<option value='KEYS_ONLY'>KEYS_ONLY</option>\
								<option value='INCLUDE'>INCLUDE</option>\
							</select>\
						</td>\
					</tr>\
					{{#if newindex.Projection.ProjectionType === 'INCLUDE' }}\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Projected attributes</td>\
						<td>\
							{{#if newindex.Projection.ProjectionType === 'INCLUDE'}}\
							\
							{{#newindex.Projection.NonKeyAttributes}}\
								<span class='badge badge-info'>{{.}}</span><br>\
							{{/newindex.Projection.NonKeyAttributes}}\
							\
							<input type='text' value='{{ ~/nonkeyattribute }}' on-focus='focus' /><a class='btn btn-xs btn-primary' on-click='add-nonkey-attribute'><i class='icon zmdi zmdi-plus'></i></a>\
							\
							{{/if}}\
						</td>\
					</tr>\
					{{/if}}\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Read capacity</td>\
						<td>\
							<input type='text' value='{{ newindex.ProvisionedThroughput.ReadCapacityUnits }}'  size='4' on-focus='focus' />\
						</td>\
					</tr>\
					<tr style='background-color: #ffefef'>\
						<td style='background-color: #eadfdf'>Write capacity</td>\
						<td>\
							<input type='text' value='{{ newindex.ProvisionedThroughput.WriteCapacityUnits}}' size='4' on-focus='focus' />\
						</td>\
					</tr>\
					\
				</table>\
				<br>\
				<div style='color:red'>{{ err }}&nbsp;</div>\
				<br>\
				<a class='btn btn-md btn-primary' on-click='create-gsi'>Create</a>\
				<a class='btn btn-md btn-default' on-click='cancel-gsi'>Cancel</a>\
				<br>\
			{{else}}\
				<h3>Indexes</h3>\
				<div>\
					<a class='btn btn-sm btn-primary' on-click='create'>Create index</a>\
					<a class='btn btn-sm btn-default' on-click='delete'>Delete index</a>\
					\
					<a class='btn btn-sm btn-default pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
				</div>\
				<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 128px'/>\
			{{/if}}\
		</div>\
	",
	oninit: function() {
		var ractive = this;
		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )
		})
		ractive.on('focus', function() {
			ractive.set( 'err' )
		})
		ractive.on('create', function() {
			ractive.set('tab', 'create')
			ractive.set('newindex', {
				IndexName: '',
				KeySchema: [
					{
						AttributeName: '',
						AttributeType: 'S',
						KeyType: 'HASH',
					},
					{
						AttributeName: '',
						AttributeType: 'S',
						KeyType: 'RANGE'
					},
				],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: [],
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1,
				}
			})
		})
		ractive.on('cancel-gsi', function() {
			ractive.set('tab')
			ractive.set('newindex')
		})

		ractive.on('add-nonkey-attribute', function(e) {
			var keypath = 'newindex.Projection.NonKeyAttributes';
			ractive.push( keypath , ractive.get('nonkeyattribute'))
			ractive.set(  keypath , ractive.get( keypath ).filter(function(value,index,self) { return self.indexOf(value) === index; }))
			ractive.set('nonkeyattribute')
		})
		ractive.on('create-gsi', function() {
			var newindex = JSON.parse(JSON.stringify(ractive.get('newindex')))
			var AttributeDefinitions = []

			newindex.KeySchema.map(function(ks) {
				if (ks.KeyType === 'HASH') {
					AttributeDefinitions.push({
						AttributeName: ks.AttributeName,
						AttributeType: ks.AttributeType,
					})
					delete ks.AttributeType;
				}
				if (ks.KeyType === 'RANGE') {
					if ( ks.AttributeName.trim() === '' ) {
						newindex.KeySchema = [ newindex.KeySchema[0] ]
					} else {
						AttributeDefinitions.push({
							AttributeName: ks.AttributeName,
							AttributeType: ks.AttributeType,
						})
						delete ks.AttributeType;
					}

				}
			})
			if ( newindex.Projection.ProjectionType !== 'INCLUDE' )
				delete newindex.Projection.NonKeyAttributes;

			var payload = {
				TableName: ractive.get('describeTable.TableName'),
				AttributeDefinitions: AttributeDefinitions,
				GlobalSecondaryIndexUpdates: [],
			};

			payload.GlobalSecondaryIndexUpdates.push({
				Create: newindex
			})

			routeCall({ method: 'updateTable', payload: payload }, function(err, data) {
				if (err)
					return ractive.set('err', err.message || err.errorMessage );

				ractive.set('tab')
				ractive.set('newindex')
				setTimeout(refresh_table,100)

			})
		})


		ractive.on('delete', function() {
			var selected = ractive.get('rows').filter(function(r) { return r[0].selected === true } );

			if ( selected.length === 0 )
				return alert('Please select an index to delete')

			if ( selected.length > 1 )
				return alert('Please select one index at a time')

			var tablename = ractive.get('describeTable.TableName')
			var indexname = selected[0][1].S

			if (confirm('Are you sure you want to delete index ' + indexname + ' from table ' + tablename )) {

				var payload = {
					TableName: ractive.get('describeTable.TableName'),
					GlobalSecondaryIndexUpdates: [],
				};

				payload.GlobalSecondaryIndexUpdates.push({
					Delete: {
						IndexName: indexname,
					}
				})

				routeCall({ method: 'updateTable', payload: payload }, function(err, data) {
					if (err)
						return alert( err.message );

					setTimeout(refresh_table,1000)

				})

			}

		})
		var refresh_table = function() {
			ractive.set('describeTable', {})
			ractive.set('rows',[])
			routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				if (err)
					return ractive.set('err', err.message );

				ractive.set('describeTable', data.Table)
				ractive.set('rows',
					(data.Table.LocalSecondaryIndexes || []).map(function(index){
						var partition_key_name = (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'HASH'})[0] || {}).AttributeName);
						var partition_key_type =
							({S: 'String', N: 'Number', B: 'Binary'})[
								data.Table.AttributeDefinitions.filter(function(at) {
									return at.AttributeName === (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'HASH'})[0] || {}).AttributeName)
								})[0].AttributeType
							];
						var sort_key_name = (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'RANGE'})[0] || {}).AttributeName) || '';
						var sort_key_type = ({S: 'String', N: 'Number', B: 'Binary'})[(
									data.Table.AttributeDefinitions.filter(function(at) {
										return at.AttributeName === (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'RANGE'})[0] || {}).AttributeName)
									})[0] || {}
								).AttributeType
							] || '';


						return [
							{ KEY: true },
							{ S: index.IndexName },
							{ S: 'N/A' },
							{ S: 'LSI' },
							{ S: partition_key_name + ' (' + partition_key_type + ' )' },
							{ S: sort_key_name + ( sort_key_type ? ' ( ' + sort_key_type + ' )' : '' ) },
							{ S: index.Projection.ProjectionType + ' ' + (index.Projection.ProjectionType === 'INCLUDE' ? index.Projection.NonKeyAttributes.join(', ') : '')},
							{ N: index.IndexSizeBytes.toString() },
							{ N: index.ItemCount.toString() },
						]
					}).concat(
						(data.Table.GlobalSecondaryIndexes || []).map(function(index){
							var partition_key_name;
							var partition_key_type;
							var sort_key_name;
							var sort_key_type;
							var projection = '';
							try {
								partition_key_name = (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'HASH'})[0] || {}).AttributeName);
								partition_key_type =
									({S: 'String', N: 'Number', B: 'Binary'})[
										data.Table.AttributeDefinitions.filter(function(at) {
											return at.AttributeName === (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'HASH'})[0] || {}).AttributeName)
										})[0].AttributeType
									];
								sort_key_name = (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'RANGE'})[0] || {}).AttributeName) || '';
								sort_key_type = ({S: 'String', N: 'Number', B: 'Binary'})[(
											data.Table.AttributeDefinitions.filter(function(at) {
												return at.AttributeName === (((index.KeySchema || []).filter(function( ks ) { return ks.KeyType === 'RANGE'})[0] || {}).AttributeName)
											})[0] || {}
										).AttributeType
									] || '';
								projection = index.Projection.ProjectionType + ' ' + (index.Projection.ProjectionType === 'INCLUDE' ? index.Projection.NonKeyAttributes.join(', ') : '');
							} catch(e) {}



							return [
								{ KEY: true },
								{ S: index.IndexName },
								{ S: index.IndexStatus },
								{ S: 'GSI' },
								{ S: partition_key_name + ' (' + partition_key_type + ' )' },
								{ S: sort_key_name + ( sort_key_type ? ' ( ' + sort_key_type + ' )' : '' ) },
								{ S: projection },
								{ N: index.hasOwnProperty('IndexSizeBytes') ? index.IndexSizeBytes.toString() : 0 },
								{ N: index.hasOwnProperty('ItemCount')      ? index.ItemCount.toString()      : 0 },
							]
						})
					)
				);
			})
		}
		ractive.on('refresh-table', function() {
			refresh_table()
		})

		refresh_table()
	},
	data: function() {
		return {
			columns: [ null, 'Name', 'Status', 'Type', 'Partition key', 'Sort key', 'Attributes', 'Size', 'Item count' ],
			rows: [],
			//newindex:
		}
	}
})

Ractive.components.tableglobal = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Global Tables</h3>\
		</div>\
	",
})

Ractive.components.tablebackup = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Backups</h3>\
		</div>\
	",
})

Ractive.components.tabletriggers = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Triggers</h3>\
		</div>\
	",
})


Ractive.components.tableitems = Ractive.extend({
	isolated: true,
	template: "\
	<div class='tablebrowse'>\
		<div class='tablequery' style='padding: 10px;margin-top: 6px;'>\
			<table width='100%' border='0'>\
				<tr>\
					<td>\
						<select value='{{ .type }}'>\
							<option value='scan'>SCAN</option>\
							<option value='query'>QUERY</option>\
						</select>\
					</td>\
					<td colspan='4'>\
						{{#if .type === 'scan' }}\
						<select value='{{ .scan.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ _hash_key_name() }} ( {{ _hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ _range_key_name() }} ( {{ _range_key_type_name() }} ) \
								{{/if}}\
								\
							</option>\
							\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ _lsi_hash_key_name( .IndexName ) }} ( {{ _lsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _lsi_range_key_name( .IndexName ) }} (  {{ _lsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
							\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ _gsi_hash_key_name( .IndexName ) }} ( {{ _gsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _gsi_range_key_name( .IndexName ) }} (  {{ _gsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
						\
						{{#if .type === 'query' }}\
						<select value='{{ .query.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ _hash_key_name() }} ( {{ _hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ _range_key_name() }} ( {{ _range_key_type_name() }} ) \
								{{/if}}\
								\
							</option>\
							\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ _lsi_hash_key_name( .IndexName ) }} ( {{ _lsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _lsi_range_key_name( .IndexName ) }} (  {{ _lsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
							\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ _gsi_hash_key_name( .IndexName ) }} ( {{ _gsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _gsi_range_key_name( .IndexName ) }} (  {{ _gsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
					</td>\
				</tr>\
				{{#if .type === 'query' }}\
				<tr>\
					<td>Partition</td>\
					{{#if .query.table === ''  }}\
						<td>{{ _hash_key_name() }}</td>\
						<td><select><option>{{ _hash_key_type_name() }}</option></select></td>\
					{{/if}}\
					{{#describeTable.LocalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
							<td>{{ _lsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _lsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.LocalSecondaryIndexes}}\
					{{#describeTable.GlobalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
							<td>{{ _gsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _gsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.GlobalSecondaryIndexes}}\
					<td><select><option>=</option></select></td>\
					<td><input type='text' value='{{.query.partition.value}}'></td>\
				</tr>\
				{{#if .query.table === ''  }}\
					{{#if describeTable.KeySchema.length === 2}}\
					<tr>\
						<td>Sort</td>\
						<td>{{ _range_key_name() }}</td>\
						<td><select><option>{{ _range_key_type_name( ) }}</option></select></td>\
						<td>\
							<select value='{{ ~/query.sort.op }}'>\
								<option value='eq'>=</option>\
								<option value='gt'>&gt;</option>\
								<option value='ge'>&gt;=</option>\
								<option value='lt'>&lt;</option>\
								<option value='le'>&lt;=</option>\
								<option value='between'>between</option>\
								{{#if _range_key_type()  === 'S' }}\
									<option value='begins_with'>begins with</option>\
								{{/if}}\
							</select>\
						</td>\
						<td>\
							<input type='text' value='{{ ~/query.sort.value }}'>\
							{{#if ~/query.sort.op === 'between' }}\
								<input type='text' value='{{ ~/query.sort.value2 }}'>\
							{{/if}}\
						</td>\
					</tr>\
					{{/if}}\
				{{/if}}\
				{{#describeTable.GlobalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ _gsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _gsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if _gsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.GlobalSecondaryIndexes}}\
				{{#describeTable.LocalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ _lsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _lsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if _lsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.LocalSecondaryIndexes}}\
				\
				{{/if}}\
			</table>\
			\
		</div>\
		<div class='tabledatacontrols'>\
			<div class='btn btn-xs btn-default' on-click='run-oop' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			<div class='btn btn-xs btn-default' on-click='prev'><i class='zmdi zmdi-hc-fw zmdi-chevron-left'></i></div>\
			<div class='btn btn-xs btn-default' on-click='next'><i class='zmdi zmdi-hc-fw zmdi-chevron-right'></i></div>\
			\
			<div class='pull-right'>\
				<a class='btn btn-xs btn-default' on-click='refresh'><i class='zmdi zmdi-refresh'></i></a>\
				<div class='btn-group'>\
					<button class='btn btn-default btn-xs' type='button'>\
						<i class='zmdi zmdi-filter-list'></i>\
					</button>\
					<button type='button' class='btn btn-xs btn-default dropdown-toggle dropdown-toggle-split' on-click='@this.toggle(\"drowndownfilteropen\")'>\
						<i class='zmdi zmdi-caret-down'></i>\
					</button>\
					<div class='dropdown-menu pull-right {{#if drowndownfilteropen}}show{{/if}}' style='max-height: 250px;overflow-y: auto;'>\
						{{#display_columns}}\
							<li><a> <input type=checkbox checked='{{.show}}' />  {{.name}}</a>\
						{{/display_columns}}\
						\
					</div>\
				</div>\
				<a class='btn btn-xs btn-default' on-click='create-item-window' as-tooltip=' \"Create Item \" ' ><i class='zmdi zmdi-plus'></i></a>\
				<a class='btn btn-xs btn-danger'  on-click='delete-selected'    as-tooltip=' \"Delete selected items \"' ><i class='zmdi zmdi-delete'></i></a>\
			</div>\
		</div>\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 148px'/>\
	</div>\
		",

		_hash_key_name: function() {
			return (this.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName
		},
		_hash_key_type: function() {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._hash_key_name() )
					ret = at.AttributeType
			})
			return ret;
		},
		_hash_key_type_name: function() {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._hash_key_type() ]
		},

		_range_key_name: function() {
			return (this.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;
		},
		_range_key_type: function() {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._range_key_name() )
					ret = at.AttributeType
			})
			return ret;
		},
		_range_key_type_name: function() {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._range_key_type() ]
		},


		_gsi_hash_key_name: function( indexname ) {

			var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName

		},
		_gsi_hash_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._gsi_hash_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_gsi_hash_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._gsi_hash_key_type( indexname ) ]
		},



		_gsi_range_key_name: function( indexname ) {

			var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName

		},
		_gsi_range_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._gsi_range_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_gsi_range_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._gsi_range_key_type( indexname ) ]
		},











		_lsi_hash_key_name: function( indexname ) {

			var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName

		},
		_lsi_hash_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._lsi_hash_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_lsi_hash_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._lsi_hash_key_type( indexname ) ]
		},



		_lsi_range_key_name: function( indexname ) {

			var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName

		},
		_lsi_range_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._lsi_range_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_lsi_range_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._lsi_range_key_type( indexname ) ]
		},




		display_data: function() {
			var ractive = this;

			var dbrows = this.get('rawdata');

			var columns = [null]
			var rows = []
			var display_columns = {}
			this.get('display_columns').map(function(dc) {
				if (dc.show)
					columns.push(dc.name)
			})
			var rows = []



			dbrows.map(function(row) {
				var thisrow = []

				columns.map(function(column_name) {
					if (column_name === null) {
						// checkbox
						var key = {}
						key[ractive._hash_key_name()] = row[ractive._hash_key_name()]
						if (ractive._range_key_name()) key[ractive._range_key_name()] = row[ractive._range_key_name()]
						thisrow.push({KEY: key})
					} else {
						if (row.hasOwnProperty(column_name)) {
							if (typeof row[column_name] === 'string')
								thisrow.push({'S':row[column_name]})
							else if (typeof row[column_name] === 'number')
								thisrow.push({'N':row[column_name]})
							else if (typeof row[column_name] === 'boolean') {
								thisrow.push({'BOOL':row[column_name].toString()})
							} else if (row[column_name] === null) {
								thisrow.push({'NULL': "NULL"})
							} else if ((typeof row[column_name] === 'object') &&  Array.isArray(row[column_name]) ) {
								thisrow.push({'L': true })
							} else if ((typeof row[column_name] === 'object') && !Array.isArray(row[column_name]) ) {
								thisrow.push({'M': true })
							} else
								thisrow.push({'U': true })
						} else {
							thisrow.push({'U': true })
						}
					}
				})
				rows.push(thisrow)
			})




			this.set('columns', columns )
			this.set('rows', rows )
		},

		refresh_data: function( LastEvaluatedKey ) {

			var ractive = this;
			this.set('columns', [])
			this.set('rows', [])

			var dbrows = null
			var hash_key = null
			var range_key = null
			var fields = {}
			var columns = [null]


			async.waterfall([
				function(cb) {

					routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
					//ddb.describeTable({ TableName: ractive.get('table.name')}, function(err, data) {
						if (err)
							return cb(err);

						ractive.set('describeTable', data.Table )
						cb()
					})
				},
				function( cb ) {
					if (ractive.get('type') !== 'scan')
						return cb()

					fields = {}


					hash_key = ractive._hash_key_name();
					range_key = ractive._range_key_name();

					columns.push(hash_key)
					ractive.add_display_column( hash_key, true )
					fields[hash_key] = 1;
					if (range_key) {
						columns.push(range_key)
						ractive.add_display_column( range_key, true )
						fields[range_key] = 1;
					}


					var scan_index = ractive.get('scan.table')
					if (scan_index === '') {
					} else {
						var scan_type = scan_index.split(':')[0]
						scan_index = scan_index.split(':')[1]
						if (scan_type === 'gsi') {
							var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function(i) { return i.IndexName === scan_index})[0]

							var index_hash_key  = (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH' })[0] || {}).AttributeName;
							var index_range_key = (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
								fields[index_range_key] = 1;
							}
						}


					}

					var ddb = DynamoDB.explain().table(ractive.get('table.name'))
					if (LastEvaluatedKey)
						ddb.resume( LastEvaluatedKey )
					ddb.limit(100)
					if (scan_index)
						ddb = ddb.index(scan_index)

					ddb.scan(function(err, data, raw ) {
						if (err)
							return alert("scan error")

						routeCall( raw.Explain , function(err, data) {
							if (err)
								return cb(err);

							dbrows = DynamodbFactory.util.parse({ L:
									(data.Items || []).map(function(item) { return {'M': item } })
								})

							console.log("LastEvaluatedKey=", data.LastEvaluatedKey )
							ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey )
							cb()

						});
					})
				},

				function( cb ) {
					if (ractive.get('type') !== 'query')
						return cb()

					fields = {}
					var query_partition_name = '';
					var query_partition_type = 'S';
					var query_sort_name = '';
					var query_sort_type = 'S';



					hash_key = ractive._hash_key_name();
					range_key = ractive._range_key_name();

					columns.push(hash_key)
					ractive.add_display_column( hash_key, true )
					fields[hash_key] = 1;
					if (range_key) {
						columns.push(range_key)
						ractive.add_display_column( range_key, true )
						fields[range_key] = 1;
					}


					var query_index = ractive.get('query.table')
					if (query_index === '') {
						query_partition_name = hash_key
						query_partition_type = ractive._hash_key_type();
						if (range_key) {
							query_sort_name = ractive._range_key_name();
							query_sort_type = ractive._range_key_type();
						}
					} else {
						var query_type = query_index.split(':')[0]
						query_index = query_index.split(':')[1]
						if (query_type === 'gsi') {

							var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function(i) { return i.IndexName === query_index})[0]
							var index_hash_key  = ractive._gsi_hash_key_name( index.IndexName )
							var index_range_key = ractive._gsi_range_key_name( index.IndexName )
							query_partition_name = index_hash_key;
							query_partition_type = ractive._gsi_hash_key_type( index.IndexName )

							if (index_range_key) {
								query_sort_name = ractive._gsi_range_key_name( index.IndexName )
								query_sort_type = ractive._gsi_range_key_type( index.IndexName )
							}

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
								fields[index_range_key] = 1;
							}
						}
						if (query_type === 'lsi') {

							var index = ractive.get('describeTable.LocalSecondaryIndexes').filter(function(i) { return i.IndexName === query_index})[0]
							var index_hash_key  = ractive._lsi_hash_key_name( index.IndexName )
							var index_range_key = ractive._lsi_range_key_name( index.IndexName )
							query_partition_name = index_hash_key;
							query_partition_type = ractive._lsi_hash_key_type( index.IndexName )

							if (index_range_key) {
								query_sort_name = ractive._lsi_range_key_name( index.IndexName )
								query_sort_type = ractive._lsi_range_key_type( index.IndexName )
							}

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
								fields[index_range_key] = 1;
							}

						}

					}

					var ddb = DynamoDB.explain().table(ractive.get('table.name'))
					if (LastEvaluatedKey)
						ddb.resume( LastEvaluatedKey )
					ddb.limit(100)
					if (query_index)
						ddb = ddb.index(query_index)

					if (query_partition_type === 'S')
						ddb = ddb.where(query_partition_name).eq( ractive.get('query.partition.value').toString() )

					if (query_partition_type === 'N')
						ddb = ddb.where(query_partition_name).eq( parseFloat(ractive.get('query.partition.value')) )


					if ( ractive.get('query.sort.value').length ) {
						// apply sort
						console.log("sort", query_sort_name, ractive.get('query.sort.op') , query_sort_type )
						if (query_sort_type === 'S')
							ddb = ddb.where(query_sort_name)[ ractive.get('query.sort.op') ]( ractive.get('query.sort.value').toString(), ractive.get('query.sort.value2').toString() )

						if (query_sort_type === 'N')
							ddb = ddb.where(query_sort_name)[ ractive.get('query.sort.op') ]( parseFloat(ractive.get('query.sort.value')), parseFloat(ractive.get('query.sort.value2')) )


					}

					console.log("query_partition_name=",query_partition_name)

					dbrows = []
					ddb.query(function(err, data, raw ) {
						if (err)
							return alert("query error")

						console.log("got raw query ", raw.Explain )

						routeCall( raw.Explain , function(err, data) {
							if (err)
								return cb(err);

							dbrows = DynamodbFactory.util.parse({ L:
									(data.Items || []).map(function(item) { return {'M': item } })
								})

							console.log("LastEvaluatedKey=", data.LastEvaluatedKey )
							ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey )
							cb()

						});
					})

				},

				// save raw data
				function(cb ) {
					ractive.set('rawdata', dbrows )
					cb()
				}
			], function(err) {
				if (err)
					ractive.set('err', err.errorMessage )


				if (ractive.get('autocolumns')) {
					dbrows.map(function(row) {
						Object.keys(row).map(function(column_name) {
							if (!fields.hasOwnProperty(column_name)) {
								if (columns.length > 10) {
									ractive.add_display_column( column_name, false )
								} else {
									ractive.add_display_column( column_name, true )
									fields[column_name] = 1;
									columns.push(column_name)
								}
							}
						})
					})
					ractive.set('autocolumns', false)
				}
				ractive.display_data()
				/*
				var rows = []







				dbrows.map(function(row) {
					var thisrow = []

					columns.map(function(column_name) {
						if (column_name === null) {
							// checkbox
							var key = {}
							key[hash_key] = row[hash_key]
							if (range_key) key[range_key] = row[range_key]
							thisrow.push({KEY: key})
						} else {
							if (row.hasOwnProperty(column_name)) {
								if (typeof row[column_name] === 'string')
									thisrow.push({'S':row[column_name]})
								else if (typeof row[column_name] === 'number')
									thisrow.push({'N':row[column_name]})
								else if (typeof row[column_name] === 'boolean') {
									thisrow.push({'BOOL':row[column_name].toString()})
								} else if (row[column_name] === null) {
									thisrow.push({'NULL': "NULL"})
								} else if ((typeof row[column_name] === 'object') &&  Array.isArray(row[column_name]) ) {
									thisrow.push({'L': true })
								} else if ((typeof row[column_name] === 'object') && !Array.isArray(row[column_name]) ) {
									thisrow.push({'M': true })
								} else
									thisrow.push({'U': true })
							} else {
								thisrow.push({'U': true })
							}
						}
					})
					rows.push(thisrow)
				})
				ractive.set('columns', columns )
				ractive.set('rows', rows )
				*/
			})
		},
	add_display_column: function( cname, show ) {
		var display_columns = this.get('display_columns')
		if ( display_columns.filter(function(dc) { return dc.name === cname}).length )
			return;

		display_columns.push({
			name: cname,
			show: show,
		})
		this.set('display_columns', display_columns )
	},
	data: function() { return {
		type: 'scan',
		display_columns: [
			// { name, type, show: true|false|null}
		],
		autocolumns: true,
		scan: {
			table: '',
			LastEvaluatedKey: [null],
		},
		query: {
			table: '',
			sort: {
				op: 'eq',
				value: '',
				value2: '',
			}
		}
	} },
	oninit: function() {
		var ractive = this

		this.refresh_data(null)

		this.on('run-oop', function() {
			this.refresh_data(null)
		})
		this.on('prev', function() {
			if (ractive.get('scan.LastEvaluatedKey').length < 3)
				return;

			var next = ractive.pop('scan.LastEvaluatedKey')

			var current = ractive.pop('scan.LastEvaluatedKey')

			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0]

			ractive.refresh_data(LastEvaluatedKey)
		})
		this.on('next', function() {
			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0]
			ractive.refresh_data(LastEvaluatedKey)
		})

		ractive.observe('display_columns.*.show', function( n, o, keypath ) {
			if (o === undefined)
				return;

			if (o == n)
				return;

			var col = ractive.get(keypath.slice(0,-5)).name
			console.log(col, n, o )
			ractive.display_data()
		})


		routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
			if (err)
				return ractive.set('err', err.errorMessage );

			ractive.set('describeTable', data.Table)
		})


		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )
		})
		ractive.on('create-item-window', function() {
			var describeTable = this.get('describeTable')
			window.ractive.findComponent('WindowHost').newWindow(function($window) {
				$window.set({
					title: 'Create Item',
					'geometry.width': window.innerWidth - 100,
					'geometry.height': window.innerHeight - 100,
					'geometry.left': 50,
					'geometry.top': 50,
				});

				var vid = "window"+(Math.random()*0xFFFFFF<<0).toString(16)
				$window.content('<div id="' + vid + '"/>').then(function() {
					var ractive = new Ractive({
						el: $('#'+vid).get(0),
						template: '<CreateItem describeTable="{{describeTable}}" />',
						data: {
							describeTable: describeTable,
						}
					})
					ractive.on('CreateItem.close-window', function() {
						$window.close()
					})
				})
			})
		})
		ractive.on('delete-selected', function(context) {
			//console.log(ractive.findComponent('tabledata').get('rows'))
			var to_delete = ractive.findComponent('tabledata').get('rows')
				.map(function(r) { return r[0] })
				.filter(function(r) { return r.selected })
				.map(function(r) { return r.KEY })

			if (!to_delete.length)
				return alert('No Items Selected')

			to_remove_from_list = []


			async.each(to_delete, function(item, cb) {

				var Key = {}
				Object.keys(item).map(function(k) {
					if (typeof item[k] === "string")
						Key[k] = {"S": item[k]}

					if (typeof item[k] === "number")
						Key[k] = {"N": item[k].toString()}
				})

				var params = {
					Key: Key,
					TableName: ractive.get('table.name')
				};

				routeCall( { method: 'deleteItem', payload: params } , function(err, data) {
					if (err)
						return console.log("deleting ", Key, " failed err=", err) || cb(err)
					else
						to_remove_from_list.push(item)

					cb()
				});
			}, function(err) {
				if (err)
					alert('some items failed to delete')

				ractive.set('rows',
					ractive.get('rows')
						.filter(function(r) {

							var is_in_deleted_list = false
							to_remove_from_list.map(function(deleted_item) {
								var isequal = true;
								Object.keys(deleted_item).map(function(k) {
									if (deleted_item[k] !==  r[0].KEY[k] )
										isequal = false;
								})

								if (isequal)
									is_in_deleted_list = true
							})
							return !is_in_deleted_list
						})
				)
			})

		})
	},
})


















/*
Ractive.components.tablebrowsesqlhead = Ractive.extend({
	template: "\
		<div class='tablesqlquery'>\
			<ace mode='sql' value='{{table.sql}}' theme='custom' />\
		</div>\
		<div class='tabledatacontrols'>\
			<div class='btn btn-xs' on-click='run-sql' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			\
			<div class='btn btn-xs pull-right' on-click='delete-selected'><i class='zmdi zmdi-delete'></i></div>\
			<div class='btn btn-xs pull-right' on-click='filter'><i class='zmdi zmdi-filter-list'></i></div>\
			<div class='btn btn-xs pull-right' on-click='refresh'><i class='zmdi zmdi-refresh'></i></div>\
		</div>\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 148px'/>\
		",
	data: function() { return {} },
	oninit: function() {
		var ractive = this
		ractive.on('selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )
		})
		ractive.on('delete-selected', function(context) {
			var to_delete = ractive.get('rows')
				.map(function(r) { return r[0] })
				.filter(function(r) { return r.selected })
				.map(function(r) { return r.KEY })

			if (!to_delete.length)
				return alert('No Items Selected')

			to_remove_from_list = []


			async.each(to_delete, function(item, cb) {
				var Key = {}
				Object.keys(item).map(function(k) {
					if (typeof item[k] === "string")
						Key[k] = {"S": item[k]}

					if (typeof item[k] === "number")
						Key[k] = {"N": item[k].toString()}
				})

				var params = {
					Key: Key,
					TableName: ractive.get('table.name')
				};
				ddb.deleteItem(params, function(err, data) {
					if (err)
						return console.log("deleting ", Key, " failed err=", err) || cb(err)

					to_remove_from_list.push(item)
					cb()
				});

			}, function(err) {
				if (err)
					alert('some items failed to delete')

				ractive.set('rows',
					ractive.get('rows')
						.filter(function(r) {

							var is_in_deleted_list = false
							to_remove_from_list.map(function(deleted_item) {
								if (_.isEqual(deleted_item, r[0].KEY)) {
									is_in_deleted_list = true
								}
							})
							return !is_in_deleted_list
						})
				)
			})

		})
	},
})

*/

Ractive.components.tabledata = Ractive.extend({
	isolated: true,
	template:
		"\
		<div class='tabledata' style='{{style}}'>\
			<div class='tabledatahead'>\
				{{#columns:i}}\
					<div style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>{{.}}</div>\
				{{/columns}}\
			</div>\
			<div class='tabledatacontent'>\
				{{#rows:row}}\
				<div class='tabledatarow {{#if .[0].selected}}selected{{/if}}' on-click='selectrow'>\
					{{#each .:i}}\
					<div class='tabledatacell\
						{{#if .KEY}}t-K{{/if}}\
						{{#if .S}}t-S{{/if}}\
						{{#if .N}}t-N{{/if}}\
						{{#if .BOOL}}t-BOOL{{/if}}\
						{{#if .NULL}}t-NULL{{/if}}\
						{{#if .L}}t-L{{/if}}\
						{{#if .M}}t-M{{/if}}\
						{{#if .U}}t-U{{/if}}\
						' style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>\
						{{#if .KEY}}\
							{{#if .selected}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-check-square'></i>\
							{{else}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-square-o'></i>\
							{{/if}}\
						{{/if}}\
						{{#if .S}}{{.S}}{{/if}}\
						{{#if .N}}{{.N}}{{else}}{{#if .N === 0}}0{{/if}}{{/if}}\
						{{#if .BOOL}}{{.BOOL}}{{/if}}\
						{{#if .NULL}}NULL{{/if}}\
						{{#if .L}}[...]{{/if}}\
						{{#if .M}}{...}{{/if}}\
					</div>\
					{{/each}}\
				</div>\
				{{/rows}}\
			</div>\
		</div>\
		",
	data: function() { return {} },
	oninit: function() {
	}
})

Ractive.components.tabs = Ractive.extend({
	//isolated: true,
	template:
		"\
		<tabhead>\
			<tab class='{{#if active_id === \"tables\" }}active{{/if}}' on-click='@this.fire(\"activetab\", \"tables\")'>\
				<i class='icon zmdi zmdi-view-dashboard'></i>\
			</tab>\
		{{#tabs}}\
			<tab class='{{#if .id === active_id }}active{{/if}}' on-click='@this.fire(\"activetab\",.id)'>\
				{{.name}}\
				<i class='icon zmdi zmdi-close' on-click='@this.fire(\"closetab\",.id)'></i>\
			</tab>\
		{{/tabs}}\
		</tabhead>\
		<tabcontent>\
			{{#if active_id === \"tables\" }}\
				<tablelistfull />\
			{{else}}\
				{{#tabs}}\
					{{#if .id === active_id}}\
						{{#if .type === 'tabletab' }}\
							<tabletab table={{.}}  />\
						{{/if}}\
						{{#if .type === 'tablecreate' }}\
							<tablecreate />\
						{{/if}}\
					{{/if}}\
				{{/tabs}}\
			{{/if}}\
		</tabcontent>\
		",
	data: function() { return {} },
	active_cache: [],
	activetabcontent: function() {
		var ractive = this
		ractive.active_cache.push(ractive.get('active_id'))
		ractive.findAllComponents('tabletab').map(function( tableview_c ) {
			tableview_c.set('active', tableview_c.get('table.id') === ractive.get('active_id') )
		})
	},
	newtab: function(component_name, param1 ) {
		var id=Math.random()
		this.set('active_id', id )
		this.push('tabs', {
			id: id,

			name: param1,
			type: component_name,

			sql: "\nSCAN * FROM `" + param1 + "` LIMIT 100\n",
		} )
		this.activetabcontent()
	},
	oninit: function() {
		var ractive = this


		this.observe('active_id', function(newvalue, oldvalue, keypath ) {
			ractive.activetabcontent()
		})

		this.on('closetab', function(e, id) {

			this.active_cache = this.active_cache.filter(function(tid) { return tid !== id })
			this.set('tabs', this.get('tabs').filter(function(t) { return t.id !== id }) )

			if (this.get('active_id') === id ) {
				// the current tab was closed
				this.set('active_id', this.active_cache.pop() )
			}
			ractive.activetabcontent()
			return false;
		})
		this.on('activetab', function(e, id) {
			this.set('active_id', id )
			return false;
		})
	},
})



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
			<input type='text' value='{{new.endpoint}}'                        placeholder='Endpoint ( for local DynamoDB )'>\
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
				<minitablelist />\
			</left>\
			<content>\
				<tabs active_id='tables' />\
			</content>",
	data: function() { return {} },
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

Ractive.components.CreateItem = Ractive.extend({
	//isolated: true,
	template:
		'\
		<div id="jsoneditor" style="position: absolute;top:0;left:0;bottom:40px;right:0;">\
		</div>\
		<div style="position: absolute;left: 0px;right:0px;bottom:0px;height: 40px;box-sizing: border-box;padding: 5px;">\
			<a class="btn btn-sm btn-primary pull-right" on-click="create-item">Save</a>\
		</div>\
		',
	data: function() {
		return {

		}
	},

	oninit: function() {
		var ractive = this

		ractive.on('create-item', function() {
			var json = ractive.editor.get();
			var ddb = DynamoDB
				.explain()
				.table( ractive.get('describeTable.TableName') )

			ddb = ddb.if( ractive.get('describeTable.KeySchema.0.AttributeName') ).not_exists()

			if (ractive.get('describeTable.KeySchema.1.AttributeName'))
				ddb = ddb.if( ractive.get('describeTable.KeySchema.1.AttributeName') ).not_exists()

			ddb.insert(json, function(err, data ) {
				if (err)
					return alert('Failed')


				routeCall( { method: data.method, payload: data.payload } , function(err, data) {
					if (err)
						return alert('Failed: ' + ( err.message || err.errorMessage ) );

					// close window
					ractive.fire('close-window')
				});
			})

		})


		//console.log("createItem",  )
	},
	oncomplete: function() {
		var ractive = this;
		var container = document.getElementById('jsoneditor');
		var options = {
			//statusBar
			//mainMenuBar
			history: false,
			colorPicker: false,
			//timestampTag
			autocomplete: false,
			navigationBar: false,
			search: false,
			enableSort: false,
			sortObjectKeys: false,
			enableTransform: false,

			mode: 'tree',
			modes: [
				//'code', // ace source
				// 'form', // <-- does not allow adding / deleting attributes
				'text', // without ace
				'tree', // <-- aws style
				//'view'  // <-- useless
			],

		};
		ractive.editor = new JSONEditor(container, options);

		var dt = ractive.get('describeTable')
		var json = {}
		dt.KeySchema.map(function(ks) {
			json[ks.AttributeName] = ''
		})


		ractive.editor.set(json)
	}
})
