
Ractive.components.tableinfo = Ractive.extend({
	template: "\
		<div class='tableinfo'>\
			<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>\
				<div style='padding: 30px'>\
					<h3>\
						Table details\
						<a class='btn btn-xs pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>\
					</h3>\
					<div style='color:red'>{{ err }}</div>\
					<hr>\
					<table>\
						<tr>\
							<td align='right' width='350'><b>Table ID</b></td>\
							<td> {{ describeTable.TableId }}</td>\
						</tr>\
						<tr>\
							<td align='right' width='350'><b>Table name</b></td>\
							<td> {{ describeTable.TableName }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Primary partition key</b></td>\
							<td>\
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
							</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Primary sort key</b></td>\
							<td>\
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
							</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Point-in-time recovery</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Encryption</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Time to live attribute</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Table status</b></td>\
							<td>{{describeTable.TableStatus}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Creation date</b></td>\
							<td>{{describeTable.CreationDateTime}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned read capacity units</b></td>\
							<td>{{describeTable.ProvisionedThroughput.ReadCapacityUnits}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Provisioned write capacity units</b></td>\
							<td>{{describeTable.ProvisionedThroughput.WriteCapacityUnits}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last decrease time</b></td>\
							<td>{{describeTable.ProvisionedThroughput.LastDecreaseDateTime || '-' }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Last increase time</b></td>\
							<td>{{describeTable.ProvisionedThroughput.LastIncreaseDateTime || '-'}}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Storage size (in bytes)</b></td>\
							<td>{{describeTable.TableSizeBytes }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Item count</b></td>\
							<td>{{ describeTable.ItemCount }}</td>\
						</tr>\
						<tr>\
							<td align='right'><b>Region</b></td>\
							<td></td>\
						</tr>\
						<tr>\
							<td align='right'><b>Amazon Resource Name (ARN)</b></td>\
							<td> {{describeTable.TableArn}}</td>\
						</tr>\
					</table>\
					<small>Storage size and item count are not updated in real-time. They are updated periodically, roughly every six hours.</small>\
				</div>\
			</scrollarea>\
		</div>",
	data: function() { return {} },
	oninit: function() {
		var ractive = this;
		var refresh_table = function() {
			ractive.set('describeTable', {})
			routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				if (err)
					return ractive.set('err', err.errorMessage );

				ractive.set('describeTable', data.Table)
			})

		}

		ractive.on('refresh-table', function() {
			refresh_table()
		})
		refresh_table()

	},
})
