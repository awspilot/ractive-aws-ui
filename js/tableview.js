Ractive.components.tableview = Ractive.extend({
	//isolated: true,
	template:
		"<div class='tableview {{#if active}}active{{/if}}'>\
			<tablebrowse table='{{.table}}'/>\
		</div>",
	data: {},

	oninit: function() {

		var ractive = this
		//ractive.on('open-table', function(e, table ) {})

	},
})
Ractive.components.tablebrowse = Ractive.extend({
	template: "\
		<div class='tablebrowse'>\
			<!-- table query -->\
			<tabledata table='{{table}}' columns='{{columns}}' rows='{{rows}}'/>\
		</div>",
	data: {},
	refresh_data: function() {
		var ractive = this;
		this.set('columns', [])
		this.set('rows', [])

		var dbrows = null
		var hash_key = null
		var range_key = null

		async.parallel([
			function(cb) {
				ddb.describeTable({ TableName: ractive.get('table.name')}, function(err, data) {
					if (err)
						return cb(err);

					hash_key = (data.Table.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName;
					range_key = (data.Table.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;
					cb()
				})
			},
			function(cb) {
				DynamoSQL.query(ractive.get('table.sql'), function(err, data) {
				//ddb.scan({TableName: ractive.get('table.name'), Limit: 100}, function(err, data) {
					dbrows = data
					cb(err)
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
Ractive.components.tabledata = Ractive.extend({
	template: "\
		<div class='tablequery'>\
			<ace mode='sql' value='{{table.sql}}' theme='custom' />\
		</div>\
		<div class='tabledatacontrols'>\
			<div class='btn' on-click='run-sql' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			\
			<div class='btn pull-right' on-click='delete-selected'><i class='zmdi zmdi-delete'></i></div>\
			<div class='btn pull-right' on-click='filter'><i class='zmdi zmdi-filter-list'></i></div>\
			<div class='btn pull-right' on-click='refresh'><i class='zmdi zmdi-refresh'></i></div>\
		</div>\
		<div class='tabledata'>\
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
						{{#if .N}}{{.N}}{{/if}}\
						{{#if .BOOL}}{{.BOOL}}{{/if}}\
						{{#if .NULL}}NULL{{/if}}\
						{{#if .L}}[...]{{/if}}\
						{{#if .M}}{...}{{/if}}\
					</div>\
					{{/each}}\
				</div>\
				{{/rows}}\
			</div>\
		</div>",
	data: {},
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
