
Ractive.components.tableitems = Ractive.extend({
	isolated: true,
	template: "\
	<div class='tablebrowse'>\
		<div class='tablequery' style='padding: 10px;margin-top: 6px;'>\
			<select value='{{ .type }}'>\
				<option value='scan'>SCAN</option>\
			</select>\
			<select value='{{ .scan.table }}'>\
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
			<div class='btn btn-xs' on-click='run-oop' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			<div class='btn btn-xs' on-click='prev'><i class='zmdi zmdi-hc-fw zmdi-chevron-left'></i></div>\
			<div class='btn btn-xs' on-click='next'><i class='zmdi zmdi-hc-fw zmdi-chevron-right'></i></div>\
			\
			<div class='btn btn-xs pull-right' on-click='delete-selected'><i class='zmdi zmdi-delete'></i></div>\
			<div class='btn btn-xs pull-right' on-click='filter'><i class='zmdi zmdi-filter-list'></i></div>\
			<div class='btn btn-xs pull-right' on-click='refresh'><i class='zmdi zmdi-refresh'></i></div>\
		</div>\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 148px'/>\
	</div>\
		",


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

					hash_key = (ractive.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName;
					range_key = (ractive.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;
					columns.push(hash_key)
					fields[hash_key] = 1;
					if (range_key) {
						columns.push(range_key)
						fields[range_key] = 1;
					}


					var scan_index = ractive.get('scan.table')
					if (scan_index === '') {
					} else {
						var scan_type = scan_index.split(':')[0]
						scan_index = scan_index.split(':')[1]
						if (scan_type === 'gsi ') {
							var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function(i) { return i.IndexName === scan_index})[0]

							var index_hash_key  = (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH' })[0] || {}).AttributeName;
							var index_range_key = (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;

							columns.push(index_hash_key)
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
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
							//ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey )
							cb()

						});
					})
				},

			], function(err) {
				if (err)
					ractive.set('err', err.errorMessage )

				var rows = []




				dbrows.map(function(row) {
					Object.keys(row).map(function(column_name) {
						if (!fields.hasOwnProperty(column_name)) {
							fields[column_name] = 1;
							columns.push(column_name)

						}
					})
				})

				columns = columns.slice(0,10)

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

	data: function() { return {
		type: 'scan',
		scan: {
			table: '',
			LastEvaluatedKey: [null],
		},
	} },
	oninit: function() {
		var ractive = this

		this.refresh_data(null)

		this.on('run-oop', function() {
			this.refresh_data(null)
		})
		// this.on('tablebrowsehead.next', function() {
		// 	alert('next')
		// 	console.log(ractive.get('scan'))
		// })



		routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
			if (err)
				return ractive.set('err', err.errorMessage );

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
