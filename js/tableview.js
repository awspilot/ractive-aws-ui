Ractive.components.tableview = Ractive.extend({
	//isolated: true,
	template:
		"<div class='tableview {{#if active}}active{{/if}}'>\
			<div class='tableview-table-tabs'>\
				<a class='btn-tableview-tab {{#if tab === \"info\"}}active{{/if}}'         on-click='@this.set(\"tab\",\"info\")'><i class='zmdi zmdi-info'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"data\"}}active{{/if}}'         on-click='@this.set(\"tab\",\"data\")'><i class='zmdi zmdi-format-list-bulleted'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"metrics\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"metrics\")'><i class='zmdi zmdi-chart'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"alarms\"}}active{{/if}}'       on-click='@this.set(\"tab\",\"alarms\")'><i class='zmdi zmdi-notifications'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"capacity\"}}active{{/if}}'     on-click='@this.set(\"tab\",\"capacity\")'><i class='zmdi zmdi-memory'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"indexes\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"indexes\")'><i class='zmdi zmdi-format-line-spacing'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"globaltables\"}}active{{/if}}' on-click='@this.set(\"tab\",\"globaltables\")'><i class='zmdi zmdi-globe'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"backups\"}}active{{/if}}'      on-click='@this.set(\"tab\",\"backups\")'><i class='zmdi zmdi-card-sd'></i></a>\
				<a class='btn-tableview-tab {{#if tab === \"triggers\"}}active{{/if}}'     on-click='@this.set(\"tab\",\"triggers\")'><i class='zmdi zmdi-portable-wifi'></i></a>\
			</div>\
			<div style='position: absolute;top: 0px;left: 40px;right: 0px;bottom: 0px;'>\
				{{#if tab === 'info'}}\
					<tableinfo table='{{.table}}'/>\
				{{/if}}\
				\
				{{#if tab === 'data'}}\
					<tablebrowse table='{{.table}}'/>\
				{{/if}}\
			</div>\
		</div>",
	data: function() {
		return {
			tab: 'data',
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
Ractive.components.tablebrowsehead = Ractive.extend({
	template: "\
		<div class='tablequery'>\
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

Ractive.components.tableinfo = Ractive.extend({
	template: "\
		<div class='tableinfo'>\
			<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
				<div style='padding: 30px'>\
					<h3>Table details</h3>\
					<br>\
					<div style='color:red'>{{ err }}</div>\
					<hr>\
					<table>\
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
							<td align='right'><b>Table status	</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Creation date</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned read capacity units</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned write capacity units</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last decrease time</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last increase time</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Storage size (in bytes)	</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Item count</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Region</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Amazon Resource Name (ARN)</b></td>\
							<td></td>\
						</tr>\
					</table>\
					<small>Storage size and item count are not updated in real-time. They are updated periodically, roughly every six hours.</small>\
				</div>\
			</scrollarea>\
		</div>",
	data: function() { return {} },
	oninit: function() {
		var ractive = this;

		routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
			if (err)
				return ractive.set('err', err.errorMessage );

			console.log(data)
			ractive.set('describeTable', data.Table)
		})


	},
})
