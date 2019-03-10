;
var cloudformation = null;
;
Ractive.components.cloudformationui = Ractive.extend({
	template:
		`
			<hsplit style='top: 41px;'>
				<left style="border: 1px solid #b9b8b6;">
					<div style="display: block;font-size: 12px;padding-left: 10px;font-size: 18px;font-weight: 700;color: #000;line-height: 2rem;padding: 12px 35px;border-bottom: 1px solid #ddd;">
						Cloudformation
					</div>
					<div style="position: absolute;bottom: 0px;top: 60px;left: 0px;right: 0px;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #ec7211;font-weight: bold;">Stacks</div>
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;">StacksSets</div>
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;">Exports</div>
					</div>
				</left>
				<content  style="background-color: transparent;border: 0px;">
					<cftabs active_id='stacklist' />
				</content>
			</hsplit>
	`,
	oninit: function() {
		var ractive=this;

		cloudformation = new AWS.CloudFormation({
			endpoint: location.protocol + '//' + location.hostname + '/v1/cloudformation?region=' + ractive.get('region'),

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
		ractive.set('selection_length')
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

		ractive.observe('selection_length', function(n) {

			var param1 = n === 1 ?
				ractive.get('rows').filter(function(r) { return r[0].selected === true } )[0][1].S
				:
				undefined;

			ractive.root.findComponent('cftabs').command( n === 1 ? 'stackdetails' : 'stacklist', param1 )
		})

		ractive.on('refresh', function() {
			ractive.stack_list()
		})

		ractive.on('create-stack', function() {
			ractive.root.findComponent('cftabs').command('stackcreate', 'Create Stack' )
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

					setTimeout(function(){
						ractive.stack_list()
					}, 1500)

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
			{{#if active_id === "stacklist" || active_id === "stackdetails" }}
			<div style="position: absolute;top: 40px;left: 50px;right: 50px;bottom: 10px;">
				<div style="position: absolute;top: 0px;left: 0px;right:0px;height: {{#if active_id === 'stackdetails'}} 50% {{else}}100%{{/if}};box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">
					<tabcontent style="top: 0px;">
							<stacklist />
					</tabcontent>
				</div>
				{{#if active_id === 'stackdetails'}}
				<div style="position: absolute;left: 0px;right:0px;top: 51%;height: 49%;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;">
					<stackdetails stack="{{stackdetails}}" />
				</div>
				{{/if}}
			</div>
			{{/if}}

			{{#if active_id === "stackcreate" }}
			<div style="position: absolute;top: 10px;left: 50px;right: 50px;bottom: 10px;">
				<stackcreate />
			</div>
			{{/if}}




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
	command: function(component_name, param1 ) {

		if (component_name === 'stackdetails' )
			this.set('stackdetails', param1 )

		this.set('active_id', component_name )

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

			{{#if page === 'upload'}}
				<h3>Create Stack</h3>
				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Specify template</div>
					<div style="padding: 30px;">

							<br>
							<h4>Specify template</h4>
							<p>
								<li>✅ .yaml or json
								<li>✅ !Ref to in-template and pseudo parameters
								<li>❌ !Ref to another resource
								<li>❌ !ImportValue, !GetAtt !Transform
								<li>❌ !Base64 !FindInMap !GetAZs !If !Join !Select !Split !Sub
								<li>✅ the only partially supported resource type is <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html" target="_blank">AWS::DynamoDB::Table</a>
								<li>❌ all other resource types are created as decoy
							</p>
							<a class="btn btn-md btn-default"  on-click='upload' >Upload Template</a>

					</div>
				</div>
				<div style="max-width: 800px;">
					<a class="btn btn-warning {{#if newstack.TemplateBody === null }}disabled{{/if}} pull-right" on-click="goto-parameters">Next</a>
				</div>
			{{/if}}

			{{#if page === 'parameters'}}
				<h3>Specify stack details</h3>

				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Stack name</div>
					<div style="padding: 30px;">
						<br>
						<div>Stack name</div>
						<input type="text" value="{{newstack.StackName}}" style="width: 100%;padding: 10px;"/>
						<small>Stack name can include letters (A-Z and a-z), numbers (0-9), and dashes (-).</small>

					</div>
				</div>
				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Parameters</div>
					<div style="padding: 30px;">


				{{#newstack.Parameters}}
				<br>
				<div>{{.ParameterKey}}</div>
					<div>
					{{#if .ParameterConstraints.AllowedValues}}
						<select value="{{.ParameterValue}}" style="width: 100%;padding: 10px;height: 37px;">
							{{#.ParameterConstraints.AllowedValues}}
							<option value="{{.}}">{{.}}</option>
							{{/.ParameterConstraints.AllowedValues}}
						</select>
					{{else}}
						<input type="text" value="{{.ParameterValue}}" style="width: 100%;padding: 10px;">
					{{/if}}
				</div>
				{{/newstack.Parameters}}

					</div>
				</div>

				<div style="max-width: 800px;">
					<a class="btn btn-warning {{#if newstack.StackName === '' }}disabled{{/if}} pull-right" on-click="goto-confirm">Next</a>
				</div>

			{{/if}}


			{{#if page === 'confirm'}}
				<div style="position: absolute;top: 0px;left: 0px;right:0px;overflow: auto;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;">
					<div style="padding: 30px;">
						<a class="btn btn-warning" on-click="create">Create</a>
					</div>
				</div>
			{{/if}}

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
						ractive.set('newstack.StackName', file.name.split('.yaml').join('').split('.json').join('') )
						ractive.set('newstack.TemplateBody', reader.result)
					}
					reader.readAsBinaryString(file);
				},
			})
		});
		ractive.on('goto-parameters', function() {

			var params = {
				TemplateBody: ractive.get('newstack.TemplateBody'),
			};
			cloudformation.getTemplateSummary(params, function(err, data) {
				if (err)
					return alert('Template failed to parse')

				ractive.set('newstack.Parameters', data.Parameters.map(function(template_parameter) {
					if (template_parameter.DefaultValue)
						template_parameter.ParameterValue = template_parameter.DefaultValue
					return template_parameter
				}) )
				ractive.set('newstack.ResourceTypes',  data.ResourceTypes )

				//console.log(err,data)
				ractive.set('page','parameters')
			});


		})
		ractive.on('goto-confirm', function() {
			ractive.set('page','confirm')
		})
		ractive.on('create', function() {

			var params = ractive.get('newstack');
			params.Parameters = params.Parameters.map(function(p){ return {
				ParameterKey: p.ParameterKey,
				ParameterValue: p.ParameterValue,
			}});
			cloudformation.createStack(params, function(err, data) {

				if (err)
					return alert('create failed')

				setTimeout(function() {
					ractive.root.findComponent('cftabs').command('stacklist' )
				}, 1500)

			});
		})
	}
});

;
Ractive.components.stackdetailtabs = Ractive.extend({
	isolated: true,
	template:
		`
		<tabhead>
			<tab class='{{#if active_id === "exports" }}active{{/if}}' on-click='@this.fire("activetab", "exports")'>Outputs</tab>
			<tab class='{{#if active_id === "resources" }}active{{/if}}' on-click='@this.fire("activetab", "resources")'>Resources</tab>
			<tab class='{{#if active_id === "events" }}active{{/if}}' on-click='@this.fire("activetab", "events")'>Events</tab>
			<tab class='{{#if active_id === "template" }}active{{/if}}'   on-click='@this.fire("activetab", "template")'>Template</tab>
			<tab class='{{#if active_id === "parameters" }}active{{/if}}' on-click='@this.fire("activetab", "parameters")'>Parameters</tab>
		</tabhead>
		<tabcontent>
			{{#if active_id === "template" }}
				<stackdetailstemplate StackName="{{StackName}}">
			{{/if}}
			{{#if active_id === "parameters" }}
				<stackdetailsparameters StackName="{{StackName}}">
			{{/if}}
			{{#if active_id === "resources" }}
				<stackdetailsresources StackName="{{StackName}}">
			{{/if}}
			{{#if active_id === "events" }}
				<stackdetailsevents StackName="{{StackName}}">
			{{/if}}
			{{#if active_id === "exports" }}
				<stackdetailsexports StackName="{{StackName}}">
			{{/if}}
		</tabcontent>
	`,
	data: function() {
		return {
			active_id: 'resources',
		}
	},
	// active_cache: [],
	// activetabcontent: function() {
	// 	var ractive = this
	// 	ractive.active_cache.push(ractive.get('active_id'))
	// 	ractive.findAllComponents('tabletab').map(function( tableview_c ) {
	// 		tableview_c.set('active', tableview_c.get('table.id') === ractive.get('active_id') )
	// 	})
	// },
	// newtab: function(component_name, param1 ) {
	// 	var id=Math.random()
	// 	this.set('active_id', id )
	// 	this.push('tabs', {
	// 		id: id,
	//
	// 		name: param1,
	// 		type: component_name,
	//
	// 	} )
	// 	this.activetabcontent()
	// },
	oninit: function() {
		var ractive = this


		// this.observe('active_id', function(newvalue, oldvalue, keypath ) {
		// 	ractive.activetabcontent()
		// })

		this.on('activetab', function(e, id) {
			this.set('active_id', id )
			return false;
		})
	},
})
;
Ractive.components.stackdetails = Ractive.extend({
	isolated: true,
	template: `
		<stackdetailtabs StackName="{{stack}}" />
	`,

})

;
Ractive.components.stackdetailstemplate = Ractive.extend({
	template: `
		<div style="position: absolute;top: 0px;left:0px;right: 0px;bottom: 0px;overflow: auto;white-space: pre;font-family: monospace;padding: 15px;">
		{{TemplateBody}}
		</div>
	`,

	oninit: function() {
		var ractive=this;

		var params = {
			StackName: this.get('StackName'),
			//TemplateStage: Original | Processed
		};
		cloudformation.getTemplate(params, function(err, data) {
			if (err)
				return alert('failed getting stack template')

			ractive.set('TemplateBody',data.TemplateBody)
		});

	}
})
;
Ractive.components.stackdetailsparameters = Ractive.extend({
	template: `
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 10px;' />
	`,
	oninit: function() {
		var ractive=this;

		ractive.set('columns', [ '', 'Key', 'Value', 'Resolved Value'])
		ractive.set('rows', [] )

		var params = {
			StackName: this.get('StackName'),
			//TemplateStage: Original | Processed
		};
		cloudformation.describeStacks(params, function(err, data) {
			if (err)
				return alert('failed describing stack')

			console.log(data.Stacks[0])


			ractive.set('stack',data.Stacks[0])

			ractive.set('rows',
				data.Stacks[0].Parameters.map(function(p) {
					return [
						{ S: '' },
						{ S: p.ParameterKey },
						{ S: p.ParameterValue },
						{ S: '' },
					]
				})
			)

		});

	}
});
Ractive.components.stackdetailsresources = Ractive.extend({
	template: `
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 10px;' />
	`,
	oninit: function() {
		var ractive=this;

		ractive.set('columns', [ '', 'Logical ID', 'Phisical ID', 'Type', 'Drift Status', 'Status', 'Status Reason'])
		ractive.set('rows', [] )

		var params = {
			StackName: this.get('StackName'),
		};
		cloudformation.listStackResources(params, function(err, data) {
			if (err)
				return alert('get stack resources failed')

			console.log(data)


			ractive.set('rows',
				data.StackResourceSummaries.map(function(r) {
					return [
						{ S: '' },
						{ S: r.LogicalResourceId },
						{ S: r.PhysicalResourceId },
						{ S: r.ResourceType },
						{ S: r.DriftInformation.StackResourceDriftStatus },
						{ S: r.ResourceStatus },
						{ S: '' },
					]
				})
			)

		});

	}
});
Ractive.components.stackdetailsevents = Ractive.extend({
	template: `
		<div style="padding: 15px;">Events Not Implemented</div>
	`,
});
Ractive.components.stackdetailsexports = Ractive.extend({
	template: `
		<div style="padding: 15px;">Exports Not Implemented</div>
	`,
});
