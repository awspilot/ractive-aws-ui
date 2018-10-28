
Ractive.components.tableitems = Ractive.extend({
	template: "\
		<div class='tablebrowse'>\
			<!-- table query -->\
			<!-- <tablebrowsesqlhead table='{{table}}' columns='{{columns}}' rows='{{rows}}'/> -->\
			<tablebrowsehead table='{{table}}' columns='{{columns}}' rows='{{rows}}'/>\
		</div>",
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
	oninit: function() {
		var ractive = this;
		this.refresh_data(null)

		this.on('tablebrowsehead.run-oop', function() {

			this.set('type', ractive.findComponent('tablebrowsehead').get('type') )
			this.set('scan', ractive.findComponent('tablebrowsehead').get('scan') )
			this.set('query', ractive.findComponent('tablebrowsehead').get('query') )
			this.set('sql', ractive.findComponent('tablebrowsehead').get('sql') )

			this.refresh_data(null)
		})
		this.on('tablebrowsehead.next', function() {
			alert('next')
			console.log(ractive.get('scan'))
		})
	},
	data: function() { return {
		type: 'scan',
		scan: {
			table: '',
			LastEvaluatedKey: [null],
		},
	} },

})
