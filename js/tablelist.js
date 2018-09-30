Ractive.components.tablelist = Ractive.extend({
	//isolated: true,
	template:
		"\
		<miniheader>\
			Tables\
			<a class='btn btn-xs pull-right' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh'></i></a>\
		</miniheader>\
		<scrollarea class='scrollarea miniheaderbody' style='position: absolute;'>\
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
	},
})





Ractive.components.tablelistfull = Ractive.extend({
	//isolated: true,
	template:
		"\
		<miniheader>\
			Tables\
			<a class='btn btn-xs pull-right' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh'></i></a>\
		</miniheader>\
		<scrollarea class='scrollarea miniheaderbody' style='position: absolute;'>\
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
	},
})
