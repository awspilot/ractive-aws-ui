

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
	isolated: true,
	template: "\
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
		",
	data: function() { return {} },
	oninit: function() {
		var ractive = this

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
