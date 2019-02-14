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
				<div style="position: absolute;top: 0px;left: 0px;right:0px;overflow: auto;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;">
					<stackcreate />
				</div>
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
