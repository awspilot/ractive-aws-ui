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
						{{#if .type === 'tabletab' }}
							<tabletab table={{.}}  />
						{{/if}}
						{{#if .type === 'tablecreate' }}
							<tablecreate />
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

			sql: "\nSCAN * FROM `" + param1 + "` LIMIT 100\n",
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
