Ractive.components.tablelist = Ractive.extend({
	//isolated: true,
	template:
		"\
		<miniheader>\
			Tables\
			<a class='btn btn-xs pull-right' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh'></i></a>\
			<a class='btn btn-xs pull-right' on-click='create'><i class='icon zmdi zmdi-plus'></i></a>\
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
			<a class='btn btn-xs pull-right' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh'></i></a>\
			<a class='btn btn-xs pull-right' on-click='delete'><i class='icon zmdi zmdi-delete'></i></a>\
			<a class='btn btn-xs pull-right' on-click='create'><i class='icon zmdi zmdi-plus'></i> CREATE TABLE <i class='zmdi'></i></a>\
		\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 28px;'/>\
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

				async.waterfall(waterfallz, function( err ) {


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
				<a class='btn btn-md' on-click='lsi-add'>Add LSI</a>\
				<a class='btn btn-md' on-click='gsi-add'>Add GSI</a>\
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
			console.log( e.resolve() )
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
