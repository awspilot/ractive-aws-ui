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
			browse table {{.table.name}}\
		</div>",
	data: {},
	oninit: function() {

	},
})
