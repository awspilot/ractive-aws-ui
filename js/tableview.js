Ractive.components.tableview = Ractive.extend({
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
					<tablebrowse table='{{.table}}'/>\
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
Ractive.components.tablebrowse = Ractive.extend({
	template: "\
		<div class='tablebrowse'>\
			<!-- table query -->\
			<!-- <tablebrowsesqlhead table='{{table}}' columns='{{columns}}' rows='{{rows}}'/> -->\
			<tablebrowsehead table='{{table}}' columns='{{columns}}' rows='{{rows}}'/>\
		</div>",
	data: function() { return {} },
	refresh_data: function() {
		var ractive = this;
		this.set('columns', [])
		this.set('rows', [])

		var dbrows = null
		var hash_key = null
		var range_key = null

		async.parallel([
			function(cb) {


				routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				//ddb.describeTable({ TableName: ractive.get('table.name')}, function(err, data) {
					if (err)
						return cb(err);

					hash_key = (data.Table.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName;
					range_key = (data.Table.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;
					cb()
				})
			},
			function(cb) {
				DynamoDB.explain().query(ractive.get('table.sql'), function(err, call) {
					if (err)
						return cb(err)

					routeCall( call, function( err, data ) {
						if (err)
							return cb(err)


						dbrows = DynamodbFactory.util.parse({ L:
								(data.Items || []).map(function(item) { return {'M': item } })
							})
						//dbrows = data
						cb()
					})
				//ddb.scan({TableName: ractive.get('table.name'), Limit: 100}, function(err, data) {

				})
			},
		], function(err) {
			if (err)
				return;

			var fields = {}
			var columns = [null]
			var rows = []

			columns.push(hash_key)
			fields[hash_key] = 1;
			if (range_key) {
				columns.push(range_key)
				fields[range_key] = 1;
			}

			dbrows.map(function(row) {
				Object.keys(row).map(function(column_name) {
					if (!fields.hasOwnProperty(column_name)) {
						fields[column_name] = {};
						columns.push(column_name)

					}
				})
			})
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

		})
	},
	oninit: function() {
		this.refresh_data()

		this.on('tabledata.refresh', function() {
			this.refresh_data()
		})

		this.on('tabledata.run-sql', function() {
			//alert("run sql")
			this.refresh_data()
			console.log(this.get('table.sql'))
		})

	},
})

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


Ractive.components.tablebrowsehead = Ractive.extend({
	template: "\
		<div class='tablequery' style='padding: 10px;margin-top: 6px;'>\
			<select>\
				<option>SCAN</option>\
			</select>\
			<select>\
				<option value=''>\
					[ Table ]\
					{{ describeTable.TableName }}:\
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
					{{#if describeTable.KeySchema.length === 2}}\
						, \
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
					{{/if}}\
					\
				</option>\
				\
				{{#describeTable.LocalSecondaryIndexes:j}}\
				<option value='lsi:{{ .IndexName }}'>\
					[ LSI ]\
					{{ .IndexName }}:\
					{{#.KeySchema:i}}\
						{{#if .KeyType === 'HASH'}}\
							{{.AttributeName}}\
							{{# ~/describeTable.AttributeDefinitions }}\
								{{#if .AttributeName === ~/.describeTable.LocalSecondaryIndexes[j].KeySchema[i].AttributeName }}\
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
					{{/.KeySchema}}\
					{{#if .KeySchema.length === 2}}\
						, \
						{{#.KeySchema:i}}\
							{{#if .KeyType === 'RANGE'}}\
								{{.AttributeName}}\
								{{# ~/describeTable.AttributeDefinitions }}\
									{{#if .AttributeName === ~/.describeTable.LocalSecondaryIndexes[j].KeySchema[i].AttributeName }}\
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
						{{/.KeySchema}}\
					{{/if}}\
				</option>\
				{{/describeTable.LocalSecondaryIndexes}}\
				\
				{{#describeTable.GlobalSecondaryIndexes:j}}\
				<option value='gsi:{{ .IndexName }}'>\
					[ GSI ]\
					{{ .IndexName }}:\
					{{#.KeySchema:i}}\
						{{#if .KeyType === 'HASH'}}\
							{{.AttributeName}}\
							{{# ~/describeTable.AttributeDefinitions }}\
								{{#if .AttributeName === ~/.describeTable.GlobalSecondaryIndexes[j].KeySchema[i].AttributeName }}\
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
					{{/.KeySchema}}\
					{{#if .KeySchema.length === 2}}\
						, \
						{{#.KeySchema:i}}\
							{{#if .KeyType === 'RANGE'}}\
								{{.AttributeName}}\
								{{# ~/describeTable.AttributeDefinitions }}\
									{{#if .AttributeName === ~/.describeTable.GlobalSecondaryIndexes[j].KeySchema[i].AttributeName }}\
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
						{{/.KeySchema}}\
					{{/if}}\
				</option>\
				{{/describeTable.GlobalSecondaryIndexes}}\
			</select>\
			\
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

		routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
			if (err)
				return ractive.set('err', err.errorMessage );

			console.log(data.Table)
			// data.Table.total_read =
			// 	data.Table.ProvisionedThroughput.ReadCapacityUnits +
			// 	(data.Table.GlobalSecondaryIndexes || []).map(function(gsi) { return gsi.ProvisionedThroughput.ReadCapacityUnits })
			// 		.reduce(function (total, num) {return total + num;},0);
			//
			// data.Table.total_write =
			// 	data.Table.ProvisionedThroughput.WriteCapacityUnits +
			// 	(data.Table.GlobalSecondaryIndexes || []).map(function(gsi) { return gsi.ProvisionedThroughput.WriteCapacityUnits })
			// 		.reduce(function (total, num) {return total + num;},0);

			ractive.set('describeTable', data.Table)
		})


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

Ractive.components.tableinfo = Ractive.extend({
	template: "\
		<div class='tableinfo'>\
			<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
				<div style='padding: 30px'>\
					<h3>\
						Table details\
						<a class='btn btn-xs pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
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

				console.log(data)
				// data.Table.total_read =
				// 	data.Table.ProvisionedThroughput.ReadCapacityUnits +
				// 	(data.Table.GlobalSecondaryIndexes || []).map(function(gsi) { return gsi.ProvisionedThroughput.ReadCapacityUnits })
				// 		.reduce(function (total, num) {return total + num;},0);
				//
				// data.Table.total_write =
				// 	data.Table.ProvisionedThroughput.WriteCapacityUnits +
				// 	(data.Table.GlobalSecondaryIndexes || []).map(function(gsi) { return gsi.ProvisionedThroughput.WriteCapacityUnits })
				// 		.reduce(function (total, num) {return total + num;},0);

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
					<a class='btn btn-sm pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
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
					return ractive.set('err', err.message );

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
