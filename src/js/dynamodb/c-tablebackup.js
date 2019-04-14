Ractive.components.tablebackup = Ractive.extend({
	template: `
			<div>
				
				<br>
				<br>
				<h4>On-Demand Backup and Restore</h4>
				<hr />
				<div>You can create and restore a complete backup of your DynamoDB table data and its settings at any time. 
				<a target="_blank" href="http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BackupRestore.html">Learn more</a>
				</div>

				<br>
				<div>
					<a class='btn btn-sm btn-primary disabled' on-click='create'>Create backup</a>
					<a class='btn btn-sm btn-default disabled' on-click='restore'>Restore backup</a>
					<a class='btn btn-sm btn-default disabled' on-click='delete'>Delete backup</a>
					
					<a class='btn btn-sm btn-default pull-right' on-click='refresh'><i class='icon zmdi zmdi-refresh'></i></a>
				</div>

				<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 160px'/>



			</div>

	`,
	list_backups: function() {
		var ractive=this;
		ractive.set('rows',null);

		DynamoDB.client.listBackups( { TableName: 'created_by_cloudformation',} , function(err, data) {
			if (err)
				return alert('failed getting backup list')
			
			ractive.set('rows', data.BackupSummaries.map(function(b) {
				return {
					
				}
			}))

		});
	},
	oninit: function() {
		var ractive=this;

		this.on('refresh', function() {
			ractive.list_backups()
			
		})

		ractive.list_backups()
	},
	data: function() {
		return {
			columns: [ null, 'Backup name', 'Status', 'Creation time', 'Size', 'Backup type', 'Expiration date', 'Backup ARN' ],
			rows: null,
			//newindex:
		}
	}
})
