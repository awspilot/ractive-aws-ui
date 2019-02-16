
Ractive.components.tablecapacity = Ractive.extend({
	template: `
		<scrollarea class='scrollarea' style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;'>
			<div style='padding: 30px'>
				<h3>
					Provisioned capacity
					<a class='btn btn-xs pull-right' on-click='refresh-table'><i class='icon zmdi zmdi-refresh'></i></a>
				</h3>
				<hr>
					{{#if describeTable.BillingModeSummary.BillingMode === 'PAY_PER_REQUEST'}}
						Not applicable because read/write capacity mode is on-demand.<br>
					{{else}}
						<table>
							<tr>
								<td width='160' align='right'></td>
								<td width='160'>Read capacity units</td>
								<td width='160'>Write capacity units</td>
							</tr>
							<tr>
								<td>Table</td>
								<td><input type='text' size='4' value='{{describeTable.ProvisionedThroughput.ReadCapacityUnits}}' on-focus='focus' /></td>
								<td><input type='text' size='4' value='{{describeTable.ProvisionedThroughput.WriteCapacityUnits}}' on-focus='focus' /></td>
							</tr>
							{{#describeTable.GlobalSecondaryIndexes}}
							<tr>
								<td>{{ .IndexName }}</td>
								<td><input type='text' size='4' value='{{.ProvisionedThroughput.ReadCapacityUnits}}' on-focus='focus' /></td>
								<td><input type='text' size='4' value='{{.ProvisionedThroughput.WriteCapacityUnits}}' on-focus='focus' /></td>
							</tr>
							{{/describeTable.GlobalSecondaryIndexes}}
						</table>
					{{/if}}



				<h3>Auto Scaling</h3>
				<hr/>
					<small>Auto Scaling not supported by this UI</small>
					<br>
					<div style='color:red'>{{ err }}&nbsp;</div>
					<table>
						<tr>
							<td width='160'>
							<td>
								<a class='btn btn-md btn-primary' on-click='save'>Save</a>
								<a class='btn btn-md btn-default' on-click='cancel'>Cancel</a>
							</td>
						</tr>
					</table>
			</div>
		</scrollarea>
	`,
	oninit: function() {
		var ractive = this;
		var refresh_table = function() {
			ractive.set('describeTable', {})
			routeCall({ method: 'describeTable', payload: { TableName: ractive.get('table.name')} }, function(err, data) {
				if (err)
					return ractive.set('err', err.message );

				console.log(data)
				ractive.set('describeTable', data.Table)
				ractive.set('originalDescribeTable', JSON.parse(JSON.stringify( data.Table ))) // this wont change
			})
		}
		ractive.on('cancel', function() {
			refresh_table()
		})
		ractive.on('focus', function() {
			ractive.set( 'err' )
		})

		ractive.on('save', function() {



			var payload = {
				TableName: ractive.get('describeTable.TableName')
			};

			if (
				(ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits')  !== ractive.get('originalDescribeTable.ProvisionedThroughput.ReadCapacityUnits') ) ||
				(ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits') !== ractive.get('originalDescribeTable.ProvisionedThroughput.WriteCapacityUnits') )
			) {
				payload.ProvisionedThroughput = {
					ReadCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits'),
					WriteCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits'),
				}
			} else {
				// if no changes, do not add obj at all
				//payload.ProvisionedThroughput = { ... }
			}


			// each index
			if ((ractive.get('describeTable.GlobalSecondaryIndexes') || []).length) {
				payload.GlobalSecondaryIndexUpdates = []
				ractive.get('describeTable.GlobalSecondaryIndexes').map(function(gsi, i ) {
					var original_gsi = ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i )

					console.log("gsi",gsi)
					console.log("original gsi", original_gsi )


					if (
						(gsi.ProvisionedThroughput.ReadCapacityUnits  !==  ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i+'.ProvisionedThroughput.ReadCapacityUnits' ) ) ||
						(gsi.ProvisionedThroughput.WriteCapacityUnits !==  ractive.get('originalDescribeTable.GlobalSecondaryIndexes.'+i+'.ProvisionedThroughput.WriteCapacityUnits') )
					) {
						payload.GlobalSecondaryIndexUpdates.push({
							Update: {
								IndexName: gsi.IndexName,
								ProvisionedThroughput: {
									ReadCapacityUnits:  gsi.ProvisionedThroughput.ReadCapacityUnits,
									WriteCapacityUnits: gsi.ProvisionedThroughput.WriteCapacityUnits,
								}
							}
						})
					}
				})
			}

			if ( (payload.GlobalSecondaryIndexUpdates || []).length === 0 )
				delete payload.GlobalSecondaryIndexUpdates;

			//console.log('payload', payload )

			routeCall({ method: 'updateTable', payload: payload }, function(err, data) {
				if (err)
					return ractive.set('err', err.message );



			 	setTimeout(refresh_table,1000)
				//console.log( err, data )
			})
		})
		ractive.on('refresh-table', function() {
			refresh_table()
		})
		refresh_table()

	},
})
