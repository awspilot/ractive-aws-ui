Ractive.components.tabledata = Ractive.extend({
	//isolated: true,
	template:
		"\
		<div class='tabledata' style='{{style}}'>\
			<div class='tabledatahead'>\
				{{#columns:i}}\
					<div style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>{{.}}</div>\
				{{/columns}}\
			</div>\
			<div class='tabledatacontent'>\
				{{#rows:row}}\
				<div class='tabledatarow {{#if .[0].selected}}selected{{/if}}' on-click='selectrow'>\
					{{#each .:i}}\
					<div class='tabledatacell\
						{{#if .KEY}}t-K{{/if}}\
						{{#if .S}}t-S{{/if}}\
						{{#if .N}}t-N{{/if}}\
						{{#if .BOOL}}t-BOOL{{/if}}\
						{{#if .NULL}}t-NULL{{/if}}\
						{{#if .L}}t-L{{/if}}\
						{{#if .M}}t-M{{/if}}\
						{{#if .U}}t-U{{/if}}\
						' style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>\
						{{#if .KEY}}\
							{{#if .selected}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-check-square'></i>\
							{{else}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-square-o'></i>\
							{{/if}}\
						{{/if}}\
						{{#if .S}}{{.S}}{{/if}}\
						{{#if .N}}{{.N}}{{/if}}\
						{{#if .BOOL}}{{.BOOL}}{{/if}}\
						{{#if .NULL}}NULL{{/if}}\
						{{#if .L}}[...]{{/if}}\
						{{#if .M}}{...}{{/if}}\
					</div>\
					{{/each}}\
				</div>\
				{{/rows}}\
			</div>\
		</div>\
		",
	data: function() { return {} },
	oninit: function() {
	}
})
