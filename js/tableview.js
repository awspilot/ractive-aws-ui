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

		var params = {
			TableName: this.get('table.name')
		};
		ddb.scan(params, function(err, data) {
			var fields = {}
			var columns = []
			var rows = []

			if (err)
				return;

			data.Items.map(function(row) {
				Object.keys(row).map(function(column_name) {
					if (!fields.hasOwnProperty(column_name)) {
						fields[column_name] = {};
						columns.push(column_name)

					}
				})
			})
			data.Items.map(function(row) {
				var thisrow = []
				columns.map(function(column_name) {
					thisrow.push(row[column_name])
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
