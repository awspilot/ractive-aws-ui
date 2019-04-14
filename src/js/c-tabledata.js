Ractive.components.tabledata = Ractive.extend({
	isolated: true,
	template:
		`
		<div class='tabledata' style='{{style}}'>
			<div class='tabledatahead'>
				{{#columns:i}}
					<div style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>{{.}}</div>
				{{/columns}}
			</div>
			<div class='tabledatacontent'>

				{{#if rows.length === 0}}
					<br><small>Empty</small>
				{{/if}}
				{{#if rows === null }}
					<br><small>Loading...</small>
				{{/if}}


				{{#rows:row}}
				<div class='tabledatarow {{#if .[0].selected}}selected{{/if}}' on-click='selectrow'>
					{{#each .:i}}
					<div class='tabledatacell
						{{#if .KEY}}t-K{{/if}}
						{{#if .HASH}}t-HASH{{/if}}
						{{#if .S}}t-S{{/if}}
						{{#if .N}}t-N{{/if}}
						{{#if .BOOL}}t-BOOL{{/if}}
						{{#if .NULL}}t-NULL{{/if}}
						{{#if .L}}t-L{{/if}}
						{{#if .M}}t-M{{/if}}
						{{#if .U}}t-U{{/if}}
						' style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '
						{{#if .HASH}}on-click='cellclick'{{/if}}
						>
						{{#if .KEY}}
							{{#if .selected}}
								<i class='zmdi selectrow zmdi-hc-fw zmdi-check-square'></i>
							{{else}}
								<i class='zmdi selectrow zmdi-hc-fw zmdi-square-o'></i>
							{{/if}}
						{{/if}}
						{{#if .HASH}}<a>{{.HASH}}</a>{{/if}}
						{{#if .S}}{{.S}}{{/if}}
						{{#if .N}}{{.N}}{{else}}{{#if .N === 0}}0{{/if}}{{/if}}
						{{#if .BOOL}}{{.BOOL}}{{/if}}
						{{#if .NULL}}NULL{{/if}}
						{{#if .L}}[...]{{/if}}
						{{#if .M}}{...}{{/if}}
					</div>
					{{/each}}
				</div>
				{{/rows}}
			</div>
		</div>
		`,
	data: function() { return {} },
	oninit: function() {
		this.on('cellclick', function( e ) {
			var col = this.get( e.resolve() )
			this.fire('colclick', undefined, col.item )
		})
	}
})
