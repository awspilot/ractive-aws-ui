;
var cloudformation = null;
;
Ractive.components.cloudformationui = Ractive.extend({
	template:
		`
			<hsplit style='top: 56px;'>
				<left>
					<div style="display: block;height: 28px;line-height: 28px;font-size: 12px;padding-left: 10px;background: linear-gradient(#eee, #e0e0e0);border: 1px solid #b9b8b6;border-top: 1px solid #fff;border-bottom: 1px solid #ccc;">Cloudformation</div>
					<div style="position: absolute;bottom: 0px;top: 29px;left: 0px;right: 0px;border: 1px solid #b9b8b6;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 10px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;cursor: pointer;border-bottom: 1px solid #e0e0e0;color: #146eb4;">Stacks</div>
					</div>
				</left>
				<content>
					<cftabs active_id='stacklist' />
				</content>
			</hsplit>
	`,
	oninit: function() {
		var ractive=this;

		cloudformation = new AWS.CloudFormation({
			endpoint: location.protocol + '//' + location.hostname + ':10001' + '/' + ractive.get('region'),

			// region is required by aws-sdk to build the endpoint host when endpoint is not passwd
			// we passed an endpoint so it does not really matter what we write in region
			region: 'xyz',

			accessKeyId: "myKeyId",
			secretAccessKey: "secretKey",
		});

	}
})
;

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

			console.log("ListStacks",err,data)

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

				});
			}

		})
		ractive.stack_list()
	},
});

Ractive.components.cftabs = Ractive.extend({
	//isolated: true,
	template:
		`
		<tabhead>
			<tab class='{{#if active_id === "stacklist" }}active{{/if}}' on-click='@this.fire("activetab", "stacklist")'>
				Stacks
			</tab>
		{{#tabs}}
			<tab class='{{#if .id === active_id }}active{{/if}}' on-click='@this.fire("activetab",.id)'>
				{{.name}}
				<i class='icon zmdi zmdi-close' on-click='@this.fire("closetab",.id)'></i>
			</tab>
		{{/tabs}}
		</tabhead>
		<tabcontent>
			{{#if active_id === "stacklist" }}
				<stacklist />
			{{else}}
				{{#tabs}}
					{{#if .id === active_id}}
						{{#if .type === 'stackcreate' }}
							<stackcreate />
						{{/if}}
					{{/if}}
				{{/tabs}}
			{{/if}}
		</tabcontent>
		`,
	data: function() { return {} },
	active_cache: [],
	activetabcontent: function() {
		var ractive = this
		ractive.active_cache.push(ractive.get('active_id'))
		ractive.findAllComponents('tabletab').map(function( tableview_c ) {
			tableview_c.set('active', tableview_c.get('table.id') === ractive.get('active_id') )
		})
	},
	newtab: function(component_name, param1 ) {
		var id=Math.random()
		this.set('active_id', id )
		this.push('tabs', {
			id: id,

			name: param1,
			type: component_name,

		} )
		this.activetabcontent()
	},
	oninit: function() {
		var ractive = this


		this.observe('active_id', function(newvalue, oldvalue, keypath ) {
			ractive.activetabcontent()
		})

		this.on('closetab', function(e, id) {

			this.active_cache = this.active_cache.filter(function(tid) { return tid !== id })
			this.set('tabs', this.get('tabs').filter(function(t) { return t.id !== id }) )

			if (this.get('active_id') === id ) {
				// the current tab was closed
				this.set('active_id', this.active_cache.pop() )
			}
			ractive.activetabcontent()
			return false;
		})
		this.on('activetab', function(e, id) {
			this.set('active_id', id )
			return false;
		})
	},
})

;
Ractive.components.stackcreate = Ractive.extend({
	template: `
		<div style="padding: 30px;">
			{{#if page === 'upload'}}
				<h3>Create Stack</h3>
				<br>
				<h4>Specify template</h4>

				<a class="btn btn-md btn-default"  on-click='upload' >Upload Template</a>
				<hr>
				<a class="btn btn-warning {{#if newstack.TemplateBody === null }}disabled{{/if}} pull-right" on-click="goto-parameters">Next</a>
			{{/if}}

			{{#if page === 'parameters'}}
				<h3>Specify stack details</h3>
				<br>
				<h4>Stack name</h4>
				<input type="text" value="{{newstack.StackName}}" />

				<h4>Parameters</h4>
				(not supported yet)

				<hr>
				<a class="btn btn-warning {{#if newstack.StackName === '' }}disabled{{/if}} pull-right" on-click="goto-confirm">Next</a>
			{{/if}}


			{{#if page === 'confirm'}}
				<a class="btn btn-warning" on-click="create">Create</a>
			{{/if}}
		</div>
	`,
	data: function() {
		return {
			page: 'upload',
			newstack: {
				StackName: '',
				TemplateBody: null,
			}

		}
	},
	oninit: function() {
		var ractive=this;


		ractive.on('upload', function(e ) {
			$('body').pickafile({
				//accept: "text/csv",
				onselect: function(file){
					console.log('selected', file )
					var reader = new FileReader();
					reader.onload = function(e) {
						ractive.set('newstack.TemplateBody', reader.result)
					}
					reader.readAsBinaryString(file);
				},
			})
		});
		ractive.on('goto-parameters', function() {
			ractive.set('page','parameters')
		})
		ractive.on('goto-confirm', function() {
			ractive.set('page','confirm')
		})
		ractive.on('create', function() {

			var params = ractive.get('newstack');
			cloudformation.createStack(params, function(err, data) {
				console.log("CreateStack",err,data)
			});
		})
	}
});
