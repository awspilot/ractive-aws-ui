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
			<tabledata columns='{{columns}}' rows='{{rows}}'/>\
		</div>",
	data: {},
	oninit: function() {
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
				ddb.scan({TableName: ractive.get('table.name'), Limit: 100}, function(err, data) {
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
			if (range_key)
				columns.push(range_key)

			dbrows.Items.map(function(row) {
				Object.keys(row).map(function(column_name) {
					if (!fields.hasOwnProperty(column_name)) {
						fields[column_name] = {};
						columns.push(column_name)

					}
				})
			})
			dbrows.Items.map(function(row) {
				var thisrow = []
				//thisrow[null] = {}
				//thisrow[null].KEY[columns[hash_key]] = row[hash_key]
				//if (range_key)
				//	thisrow[null].KEY[columns[range_key]] = row[range_key]

				columns.map(function(column_name) {
					if (column_name === null) {
						// checkbox
						var key = {}
						key[hash_key] = row[hash_key]
						if (range_key) key[range_key] = row[range_key]
						thisrow.push({KEY: key})
					} else {
						thisrow.push(row[column_name])
					}
				})
				rows.push(thisrow)
			})
			ractive.set('columns', columns )
			ractive.set('rows', rows )

		})
	},
})
Ractive.components.tabledata = Ractive.extend({
	template: "\
		<div class='tabledata'>\
			<div class='tabledatahead'>\
				{{#columns}}\
					<div style='width: {{100/columns.length}}%'>{{.}}</div>\
				{{/columns}}\
			</div>\
			<div class='tabledatacontent'>\
				{{#rows}}\
				<div class='tabledatarow'>\
					{{#each .}}\
					<div class='tabledatacell' style='width: {{100/columns.length}}%'>\
						{{#if .KEY}}<input type='checkbox' />{{/if}}\
						{{#if .S}}{{.S}}{{/if}}\
						{{#if .N}}{{.N}}{{/if}}\
					</div>\
					{{/each}}\
				</div>\
				{{/rows}}\
			</div>\
		</div>",
	data: {},
	oninit: function() {

	},
})
