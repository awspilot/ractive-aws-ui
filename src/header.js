
export default Ractive.extend({
	template: `
		<header>
				<div class="dropdown services-dropdown pull-left" style="margin-left: 100px;" on-mouseenter="@this.toggle('show_services_dropdown')" on-mouseleave="@this.set('show_services_dropdown')">
					<a>
						Services

						{{#if show_services_dropdown}}
						<svg id="i-chevron-top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 20 L16 8 2 20" />
						</svg>
						{{else}}
						<svg id="i-chevron-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 12 L16 24 2 12" />
						</svg>
						{{/if}}
					</a>
					<div class="dropdown-menu {{#if show_services_dropdown}}show{{/if}}">
						<li><a class="dropdown-item" href="../cloudformation/?region={{region}}">Cloudformation</a>
						<li><a class="dropdown-item" href="../dynamodb/?region={{region}}">DynamoDB</a>
						<li><a class="dropdown-item" href="../s3/?region={{region}}">S3</a>
					</div>
				</div>




				<div class="dropdown region-dropdown pull-right" on-mouseenter="@this.toggle('show_region_dropdown')" on-mouseleave="@this.set('show_region_dropdown')">
					<a>
						{{#regions}}{{#if region === .id }}{{.name}}{{/if}}{{/regions}}

						{{#if show_region_dropdown}}
						<svg id="i-chevron-top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 20 L16 8 2 20" />
						</svg>
						{{else}}
						<svg id="i-chevron-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 12 L16 24 2 12" />
						</svg>
						{{/if}}

					</a>
					<div class="dropdown-menu right {{#if show_region_dropdown}}show{{/if}}">
						{{#regions}}
							<li class="{{#if region === .id }}active{{/if}}"><a class="dropdown-item" href="?region={{.id}}">{{.name}}</a>
						{{/regions}}
					</div>
				</div>


				<div class="dropdown region-dropdown pull-right" on-mouseenter="@this.toggle('show_theme_dropdown')" on-mouseleave="@this.set('show_theme_dropdown')">
					<a>
						{{#themes}}{{#if theme === .id }}{{.name}}{{/if}}{{/themes}}

						{{#if show_theme_dropdown}}
						<svg id="i-chevron-top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 20 L16 8 2 20" />
						</svg>
						{{else}}
						<svg id="i-chevron-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
						    <path d="M30 12 L16 24 2 12" />
						</svg>
						{{/if}}


					</a>
					<div class="dropdown-menu right {{#if show_theme_dropdown}}show{{/if}}">
						{{#themes}}
							<li class="{{#if theme === .id }}active{{/if}}"><a class="dropdown-item" on-click="set-theme">{{.name}}</a>
						{{/themes}}
					</div>
				</div>



		</header>
	`,
	data: function() {
		return {

			regions: [
				{ id: 'us-east-1',      name: 'US East (N. Virginia)'},
				{ id: 'us-east-2',      name: 'US East (Ohio)'},
				{ id: 'us-west-1',      name: 'US West (N. California)'},
				{ id: 'us-west-2',      name: 'US West (Oregon)'},
				{ id: 'ap-south-1',     name: 'Asia Pacific (Mumbai)'},
				{ id: 'ap-northeast-2', name: 'Asia Pacific (Seoul)'},
				{ id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)'},
				{ id: 'ap-southeast-2', name: 'Asia Pacific (Sydney)'},
				{ id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)'},
				{ id: 'ca-central-1',   name: 'Canada (Central)'},
				{ id: 'eu-central-1',   name: 'EU (Frankfurt)'},
				{ id: 'eu-west-1',      name: 'EU (Ireland)'},
				{ id: 'eu-west-2',      name: 'EU (London)'},
				{ id: 'eu-west-3',      name: 'EU (Paris)'},
				{ id: 'eu-north-1',     name: 'EU (Stockholm)'},
				{ id: 'sa-east-1',      name: 'South America (Sao Paulo)'},

			],

			themes: [
				{ id: 'aws', name: 'AWS (Theme)' },
				{ id: 'windows', name: 'Windows Classic (Theme)' },
				{ id: 'atomlight', name: 'Aton Light (Theme)' },
				{ id: 'atomdark', name: 'Aton Dark (Theme)' },
			]
		}
	},
	on: {
		'set-theme': function(e) {
			try {
				window.localStorage.setItem('theme', this.get(e.resolve() + '.id') );
			} catch (e) { console.log(e) }
			this.parent.set_theme(this.get(e.resolve() + '.id'))
		}
	}
})
