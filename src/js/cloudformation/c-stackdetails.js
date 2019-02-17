;
Ractive.components.stackdetailtabs = Ractive.extend({
	isolated: true,
	template:
		`
		<tabhead>
			<tab class='{{#if active_id === "template" }}active{{/if}}'   on-click='@this.fire("activetab", "template")'>Template</tab>
			<tab class='{{#if active_id === "parameters" }}active{{/if}}' on-click='@this.fire("activetab", "parameters")'>Parameters</tab>
			<tab class='{{#if active_id === "resources" }}active{{/if}}' on-click='@this.fire("activetab", "resources")'>Resources</tab>
			<tab class='{{#if active_id === "events" }}active{{/if}}' on-click='@this.fire("activetab", "events")'>Events</tab>
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

		</tabcontent>
	`,
	data: function() {
		return {
			active_id: 'template',
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
		Not Implemented
	`,
});
Ractive.components.stackdetailsevents = Ractive.extend({
	template: `
		Not Implemented
	`,
});
