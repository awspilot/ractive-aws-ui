
Ractive.components.tableitems = Ractive.extend({
	isolated: true,
	template: "\
	<div class='tablebrowse'>\
		<div class='tablequery' style='padding: 10px;margin-top: 6px;'>\
			<table width='100%' border='0'>\
				<tr>\
					<td>\
						<select value='{{ .type }}'>\
							<option value='scan'>SCAN</option>\
							<option value='query'>QUERY</option>\
						</select>\
					</td>\
					<td colspan='4'>\
						{{#if .type === 'scan' }}\
						<select value='{{ .scan.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ _hash_key_name() }} ( {{ _hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ _range_key_name() }} ( {{ _range_key_type_name() }} ) \
								{{/if}}\
								\
							</option>\
							\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ _lsi_hash_key_name( .IndexName ) }} ( {{ _lsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _lsi_range_key_name( .IndexName ) }} (  {{ _lsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
							\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ _gsi_hash_key_name( .IndexName ) }} ( {{ _gsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _gsi_range_key_name( .IndexName ) }} (  {{ _gsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
						\
						{{#if .type === 'query' }}\
						<select value='{{ .query.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ _hash_key_name() }} ( {{ _hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ _range_key_name() }} ( {{ _range_key_type_name() }} ) \
								{{/if}}\
								\
							</option>\
							\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ _lsi_hash_key_name( .IndexName ) }} ( {{ _lsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _lsi_range_key_name( .IndexName ) }} (  {{ _lsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
							\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ _gsi_hash_key_name( .IndexName ) }} ( {{ _gsi_hash_key_type_name( .IndexName ) }} ) \
								{{#if .KeySchema.length === 2}}\
									, {{ _gsi_range_key_name( .IndexName ) }} (  {{ _gsi_range_key_type_name( .IndexName ) }} ) \
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
					</td>\
				</tr>\
				{{#if .type === 'query' }}\
				<tr>\
					<td>Partition</td>\
					{{#if .query.table === ''  }}\
						<td>{{ _hash_key_name() }}</td>\
						<td><select><option>{{ _hash_key_type_name() }}</option></select></td>\
					{{/if}}\
					{{#describeTable.LocalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
							<td>{{ _lsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _lsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.LocalSecondaryIndexes}}\
					{{#describeTable.GlobalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
							<td>{{ _gsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _gsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.GlobalSecondaryIndexes}}\
					<td><select><option>=</option></select></td>\
					<td><input type='text' value='{{.query.partition.value}}'></td>\
				</tr>\
				{{#if .query.table === ''  }}\
					{{#if describeTable.KeySchema.length === 2}}\
					<tr>\
						<td>Sort</td>\
						<td>{{ _range_key_name() }}</td>\
						<td><select><option>{{ _range_key_type_name( ) }}</option></select></td>\
						<td>\
							<select value='{{ ~/query.sort.op }}'>\
								<option value='eq'>=</option>\
								<option value='gt'>&gt;</option>\
								<option value='ge'>&gt;=</option>\
								<option value='lt'>&lt;</option>\
								<option value='le'>&lt;=</option>\
								<option value='between'>between</option>\
								{{#if _range_key_type()  === 'S' }}\
									<option value='begins_with'>begins with</option>\
								{{/if}}\
							</select>\
						</td>\
						<td>\
							<input type='text' value='{{ ~/query.sort.value }}'>\
							{{#if ~/query.sort.op === 'between' }}\
								<input type='text' value='{{ ~/query.sort.value2 }}'>\
							{{/if}}\
						</td>\
					</tr>\
					{{/if}}\
				{{/if}}\
				{{#describeTable.GlobalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ _gsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _gsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if _gsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.GlobalSecondaryIndexes}}\
				{{#describeTable.LocalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ _lsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ _lsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if _lsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.LocalSecondaryIndexes}}\
				\
				{{/if}}\
			</table>\
			\
		</div>\
		<div class='tabledatacontrols'>\
			<div class='btn btn-xs btn-default' on-click='run-oop' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			<div class='btn btn-xs btn-default' on-click='prev'><i class='zmdi zmdi-hc-fw zmdi-chevron-left'></i></div>\
			<div class='btn btn-xs btn-default' on-click='next'><i class='zmdi zmdi-hc-fw zmdi-chevron-right'></i></div>\
			\
			<div class='pull-right'>\
				<a class='btn btn-xs btn-default' on-click='refresh'><i class='zmdi zmdi-refresh'></i></a>\
				<div class='btn-group'>\
					<button class='btn btn-default btn-xs' type='button'>\
						<i class='zmdi zmdi-filter-list'></i>\
					</button>\
					<button type='button' class='btn btn-xs btn-default dropdown-toggle dropdown-toggle-split' on-click='@this.toggle(\"drowndownfilteropen\")'>\
						<i class='zmdi zmdi-caret-down'></i>\
					</button>\
					<div class='dropdown-menu pull-right {{#if drowndownfilteropen}}show{{/if}}' style='max-height: 250px;overflow-y: auto;'>\
						{{#display_columns}}\
							<li><a> <input type=checkbox checked='{{.show}}' />  {{.name}}</a>\
						{{/display_columns}}\
						\
					</div>\
				</div>\
				<a class='btn btn-xs btn-danger' on-click='delete-selected' as-tooltip=' \"Delete selected items \"' ><i class='zmdi zmdi-delete'></i></a>\
			</div>\
		</div>\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 148px'/>\
	</div>\
		",

		_hash_key_name: function() {
			return (this.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName
		},
		_hash_key_type: function() {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._hash_key_name() )
					ret = at.AttributeType
			})
			return ret;
		},
		_hash_key_type_name: function() {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._hash_key_type() ]
		},

		_range_key_name: function() {
			return (this.get('describeTable').KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;
		},
		_range_key_type: function() {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._range_key_name() )
					ret = at.AttributeType
			})
			return ret;
		},
		_range_key_type_name: function() {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._range_key_type() ]
		},


		_gsi_hash_key_name: function( indexname ) {

			var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName

		},
		_gsi_hash_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._gsi_hash_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_gsi_hash_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._gsi_hash_key_type( indexname ) ]
		},



		_gsi_range_key_name: function( indexname ) {

			var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName

		},
		_gsi_range_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._gsi_range_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_gsi_range_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._gsi_range_key_type( indexname ) ]
		},











		_lsi_hash_key_name: function( indexname ) {

			var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH'})[0] || {}).AttributeName

		},
		_lsi_hash_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._lsi_hash_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_lsi_hash_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._lsi_hash_key_type( indexname ) ]
		},



		_lsi_range_key_name: function( indexname ) {

			var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function(i) {return i.IndexName === indexname})[0];
			if (! index )
				return;

			return (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName

		},
		_lsi_range_key_type: function( indexname ) {
			var ractive = this;

			var ret;
			this.get('describeTable.AttributeDefinitions').map(function( at ) {
				if ( at.AttributeName === ractive._lsi_range_key_name( indexname ) )
					ret = at.AttributeType
			})
			return ret;
		},
		_lsi_range_key_type_name: function( indexname ) {
			return ({S: 'String', N: 'Number', 'B': 'Binary'})[ this._lsi_range_key_type( indexname ) ]
		},




		display_data: function() {
			var ractive = this;

			var dbrows = this.get('rawdata');

			var columns = [null]
			var rows = []
			var display_columns = {}
			this.get('display_columns').map(function(dc) {
				if (dc.show)
					columns.push(dc.name)
			})
			var rows = []



			dbrows.map(function(row) {
				var thisrow = []

				columns.map(function(column_name) {
					if (column_name === null) {
						// checkbox
						var key = {}
						key[ractive._hash_key_name()] = row[ractive._hash_key_name()]
						if (ractive._range_key_name()) key[ractive._range_key_name()] = row[ractive._range_key_name()]
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




			this.set('columns', columns )
			this.set('rows', rows )
		},

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


					hash_key = ractive._hash_key_name();
					range_key = ractive._range_key_name();

					columns.push(hash_key)
					ractive.add_display_column( hash_key, true )
					fields[hash_key] = 1;
					if (range_key) {
						columns.push(range_key)
						ractive.add_display_column( range_key, true )
						fields[range_key] = 1;
					}


					var scan_index = ractive.get('scan.table')
					if (scan_index === '') {
					} else {
						var scan_type = scan_index.split(':')[0]
						scan_index = scan_index.split(':')[1]
						if (scan_type === 'gsi') {
							var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function(i) { return i.IndexName === scan_index})[0]

							var index_hash_key  = (index.KeySchema.filter(function(k) { return k.KeyType === 'HASH' })[0] || {}).AttributeName;
							var index_range_key = (index.KeySchema.filter(function(k) { return k.KeyType === 'RANGE'})[0] || {}).AttributeName;

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
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
							ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey )
							cb()

						});
					})
				},

				function( cb ) {
					if (ractive.get('type') !== 'query')
						return cb()

					fields = {}
					var query_partition_name = '';
					var query_partition_type = 'S';
					var query_sort_name = '';
					var query_sort_type = 'S';



					hash_key = ractive._hash_key_name();
					range_key = ractive._range_key_name();

					columns.push(hash_key)
					ractive.add_display_column( hash_key, true )
					fields[hash_key] = 1;
					if (range_key) {
						columns.push(range_key)
						ractive.add_display_column( range_key, true )
						fields[range_key] = 1;
					}


					var query_index = ractive.get('query.table')
					if (query_index === '') {
						query_partition_name = hash_key
						query_partition_type = ractive._hash_key_type();
						if (range_key) {
							query_sort_name = ractive._range_key_name();
							query_sort_type = ractive._range_key_type();
						}
					} else {
						var query_type = query_index.split(':')[0]
						query_index = query_index.split(':')[1]
						if (query_type === 'gsi') {

							var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function(i) { return i.IndexName === query_index})[0]
							var index_hash_key  = ractive._gsi_hash_key_name( index.IndexName )
							var index_range_key = ractive._gsi_range_key_name( index.IndexName )
							query_partition_name = index_hash_key;
							query_partition_type = ractive._gsi_hash_key_type( index.IndexName )

							if (index_range_key) {
								query_sort_name = ractive._gsi_range_key_name( index.IndexName )
								query_sort_type = ractive._gsi_range_key_type( index.IndexName )
							}

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
								fields[index_range_key] = 1;
							}
						}
						if (query_type === 'lsi') {

							var index = ractive.get('describeTable.LocalSecondaryIndexes').filter(function(i) { return i.IndexName === query_index})[0]
							var index_hash_key  = ractive._lsi_hash_key_name( index.IndexName )
							var index_range_key = ractive._lsi_range_key_name( index.IndexName )
							query_partition_name = index_hash_key;
							query_partition_type = ractive._lsi_hash_key_type( index.IndexName )

							if (index_range_key) {
								query_sort_name = ractive._lsi_range_key_name( index.IndexName )
								query_sort_type = ractive._lsi_range_key_type( index.IndexName )
							}

							columns.push(index_hash_key)
							ractive.add_display_column( index_hash_key, true )
							fields[index_hash_key] = 1;

							if (index_range_key) {
								columns.push(index_range_key)
								ractive.add_display_column( index_range_key, true )
								fields[index_range_key] = 1;
							}

						}

					}

					var ddb = DynamoDB.explain().table(ractive.get('table.name'))
					if (LastEvaluatedKey)
						ddb.resume( LastEvaluatedKey )
					ddb.limit(100)
					if (query_index)
						ddb = ddb.index(query_index)

					if (query_partition_type === 'S')
						ddb = ddb.where(query_partition_name).eq( ractive.get('query.partition.value').toString() )

					if (query_partition_type === 'N')
						ddb = ddb.where(query_partition_name).eq( parseFloat(ractive.get('query.partition.value')) )


					if ( ractive.get('query.sort.value').length ) {
						// apply sort
						console.log("sort", query_sort_name, ractive.get('query.sort.op') , query_sort_type )
						if (query_sort_type === 'S')
							ddb = ddb.where(query_sort_name)[ ractive.get('query.sort.op') ]( ractive.get('query.sort.value').toString(), ractive.get('query.sort.value2').toString() )

						if (query_sort_type === 'N')
							ddb = ddb.where(query_sort_name)[ ractive.get('query.sort.op') ]( parseFloat(ractive.get('query.sort.value')), parseFloat(ractive.get('query.sort.value2')) )


					}

					console.log("query_partition_name=",query_partition_name)

					dbrows = []
					ddb.query(function(err, data, raw ) {
						if (err)
							return alert("query error")

						console.log("got raw query ", raw.Explain )

						routeCall( raw.Explain , function(err, data) {
							if (err)
								return cb(err);

							dbrows = DynamodbFactory.util.parse({ L:
									(data.Items || []).map(function(item) { return {'M': item } })
								})

							console.log("LastEvaluatedKey=", data.LastEvaluatedKey )
							ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey )
							cb()

						});
					})

				},

				// save raw data
				function(cb ) {
					ractive.set('rawdata', dbrows )
					cb()
				}
			], function(err) {
				if (err)
					ractive.set('err', err.errorMessage )


				if (ractive.get('autocolumns')) {
					dbrows.map(function(row) {
						Object.keys(row).map(function(column_name) {
							if (!fields.hasOwnProperty(column_name)) {
								if (columns.length > 10) {
									ractive.add_display_column( column_name, false )
								} else {
									ractive.add_display_column( column_name, true )
									fields[column_name] = 1;
									columns.push(column_name)
								}
							}
						})
					})
					ractive.set('autocolumns', false)
				}
				ractive.display_data()
				/*
				var rows = []







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
				*/
			})
		},
	add_display_column: function( cname, show ) {
		var display_columns = this.get('display_columns')
		if ( display_columns.filter(function(dc) { return dc.name === cname}).length )
			return;

		display_columns.push({
			name: cname,
			show: show,
		})
		this.set('display_columns', display_columns )
	},
	data: function() { return {
		type: 'scan',
		display_columns: [
			// { name, type, show: true|false|null}
		],
		autocolumns: true,
		scan: {
			table: '',
			LastEvaluatedKey: [null],
		},
		query: {
			table: '',
			sort: {
				op: 'eq',
				value: '',
				value2: '',
			}
		}
	} },
	oninit: function() {
		var ractive = this

		this.refresh_data(null)

		this.on('run-oop', function() {
			this.refresh_data(null)
		})
		this.on('prev', function() {
			if (ractive.get('scan.LastEvaluatedKey').length < 3)
				return;

			var next = ractive.pop('scan.LastEvaluatedKey')

			var current = ractive.pop('scan.LastEvaluatedKey')

			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0]

			ractive.refresh_data(LastEvaluatedKey)
		})
		this.on('next', function() {
			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0]
			ractive.refresh_data(LastEvaluatedKey)
		})

		ractive.observe('display_columns.*.show', function( n, o, keypath ) {
			if (o === undefined)
				return;

			if (o == n)
				return;

			var col = ractive.get(keypath.slice(0,-5)).name
			console.log(col, n, o )
			ractive.display_data()
		})


		routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
			if (err)
				return ractive.set('err', err.errorMessage );

			ractive.set('describeTable', data.Table)
		})


		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )
		})
		ractive.on('delete-selected', function(context) {
			//console.log(ractive.findComponent('tabledata').get('rows'))
			var to_delete = ractive.findComponent('tabledata').get('rows')
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

				routeCall( { method: 'deleteItem', payload: params } , function(err, data) {
					if (err)
						return console.log("deleting ", Key, " failed err=", err) || cb(err)
					else
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
								var isequal = true;
								Object.keys(deleted_item).map(function(k) {
									if (deleted_item[k] !==  r[0].KEY[k] )
										isequal = false;
								})

								if (isequal)
									is_in_deleted_list = true
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
