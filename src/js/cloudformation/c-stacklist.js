;
Ractive.components.stacklist = Ractive.extend({
	template: `
		<div class="pull-right" style="padding: 7px;">
			<a class="btn btn-xs btn-primary" on-click="create-stack"><i class="icon zmdi zmdi-plus"></i> CREATE STACK </a>
			<a class="btn btn-xs btn-default {{#if selection_length > 0}}{{else}}disabled{{/if}}" on-click='delete' as-tooltip=' \" Delete stack \" '><i class="icon zmdi zmdi-delete"></i></a>
			<a class="btn btn-xs btn-default" on-click="refresh"><i class="icon zmdi zmdi-refresh"></i></a>
		</div>


		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 38px;' />

	`,
	stack_list: function(cb) {
		var ractive=this;

		cloudformation.listStacks({
			//  NextToken: 'STRING_VALUE',
			//  StackStatusFilter: [
			//    CREATE_IN_PROGRESS | CREATE_FAILED | CREATE_COMPLETE | ROLLBACK_IN_PROGRESS | ROLLBACK_FAILED | ROLLBACK_COMPLETE | DELETE_IN_PROGRESS | DELETE_FAILED | DELETE_COMPLETE | UPDATE_IN_PROGRESS | UPDATE_COMPLETE_CLEANUP_IN_PROGRESS | UPDATE_COMPLETE | UPDATE_ROLLBACK_IN_PROGRESS | UPDATE_ROLLBACK_FAILED | UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS | UPDATE_ROLLBACK_COMPLETE | REVIEW_IN_PROGRESS,
			//    /* more items */
			//  ]
		}, function(err, data) {

			if (err) {
				if (cb) cb(err)
				return;
			}

			ractive.set('rows',
				data.StackSummaries.map(function(stack) {
					return [
						{ KEY: true },
						{ S: stack.StackName },
						{ S: stack.StackStatus },
						{ },
						{ }
					]
				})
			)


			if (cb) cb(err,data)
		});
	},
	oninit: function() {
		var ractive=this;
		ractive.set('columns', [ null, 'Stack Name', 'Status', 'Created time'])
		ractive.set('rows', [] )

		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )

			ractive.set('selection_length',
				ractive.get('rows').filter(function(r) { return r[0].selected === true } ).length
			)
		})

		ractive.on('refresh', function() {
			ractive.stack_list()
		})

		ractive.on('create-stack', function() {
			ractive.root.findComponent('cftabs').newtab('stackcreate', 'Create Stack' )
		})
		ractive.on('delete', function() {
			var selected = ractive.get('rows').filter(function(r) { return r[0].selected === true } );

			if ( selected.length === 0 )
				return alert('Please select a stack to delete')

			if ( selected.length > 1 )
				return alert('Please select one stack at a time')

			var stackname = selected[0][1].S

			if (confirm('Are you sure you want to delete stack ' + stackname )) {

				cloudformation.deleteStack({ StackName: stackname, }, function(err, data) {
					if (err)
						alert('delete stack failed')

					alert('stack deleted')
				});
			}

		})
		ractive.stack_list()
	},
});
