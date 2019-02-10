;
Ractive.components.stacklist = Ractive.extend({
	template: `
		<div class="pull-right" style="padding: 7px;">
			<a class="btn btn-xs btn-primary" on-click="create-stack"><i class="icon zmdi zmdi-plus"></i> CREATE STACK </a>
			<a class="btn btn-xs btn-default disabled"><i class="icon zmdi zmdi-delete"></i></a>
			<a class="btn btn-xs btn-default"><i class="icon zmdi zmdi-refresh"></i></a>
		</div>


		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 38px;' />

	`,
	stack_list: function(cb) {
		cloudformation.listStacks({
			//  NextToken: 'STRING_VALUE',
			//  StackStatusFilter: [
			//    CREATE_IN_PROGRESS | CREATE_FAILED | CREATE_COMPLETE | ROLLBACK_IN_PROGRESS | ROLLBACK_FAILED | ROLLBACK_COMPLETE | DELETE_IN_PROGRESS | DELETE_FAILED | DELETE_COMPLETE | UPDATE_IN_PROGRESS | UPDATE_COMPLETE_CLEANUP_IN_PROGRESS | UPDATE_COMPLETE | UPDATE_ROLLBACK_IN_PROGRESS | UPDATE_ROLLBACK_FAILED | UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS | UPDATE_ROLLBACK_COMPLETE | REVIEW_IN_PROGRESS,
			//    /* more items */
			//  ]
		}, function(err, data) {
			console.log("ListStacks",err,data)
			if (cb)
				cb(err,data)
		});
	},
	oninit: function() {
		var ractive=this;
		ractive.set('columns', [ null, 'Stack Name', 'Status', 'Created time'])
		ractive.set('rows', [].map(function(stackname) {
			return [
				{ KEY: true },
				{ S: stackname },
				{ },
				{ },
				{ },
				{ },
				{ },
				{ }
			]
		}) )

		ractive.stack_list()
		ractive.on('create-stack', function() {
			ractive.root.findComponent('cftabs').newtab('stackcreate', 'Create Stack' )
		})
	},
});
