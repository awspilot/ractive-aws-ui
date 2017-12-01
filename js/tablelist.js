Ractive.components.tablelist = Ractive.extend({
	//isolated: true,
	template:
		"\
		<miniheader>\
			Tables\
			<i class='icon zmdi zmdi-refresh' style='float:right;' on-click='@this.refresh_tables()'>\
		</miniheader>\
		<scrollarea class='scrollarea' style='position: absolute;left: 0px;top: 21px;right: 0px;bottom: 0px;'>\
		<tables>\
			{{#tables}}\
			<div on-click='@this.fire(\"open-table\",.)'> {{.}} </div>\
			{{/tables}}\
		</tables>\
		</scrollarea>\
		",
	data: {},
	refresh_tables: function() {
		var ractive = this
		ractive.set('tables')
		ddb.listTables({}, function(err, data) {
			if (err)
				return ractive.set('err', err )

			ractive.set('err')
			ractive.set('tables', data.TableNames )
		})
	},
	oninit: function() {
		this.refresh_tables()
		var ractive = this
		ractive.on('open-table', function(e, table ) {
			ractive.root.fire('open-table', table )
		})
	},
})
