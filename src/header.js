
export default Ractive.extend({
	template: `
		<header>
				<div class="dropdown services-dropdown pull-left" style="margin-left: 100px;">
					<a on-click="@this.toggle('show_services_dropdown')">
						Services
						<i class="icon zmdi {{#if show_services_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>
					</a>
					<div class="dropdown-menu {{#if show_services_dropdown}}show{{/if}}">
						<li><a class="dropdown-item" href="/cloudformation/?region={{region}}">Cloudformation</a>
						<li><a class="dropdown-item" href="/dynamodb/?region={{region}}">DynamoDB</a>
						<li><a class="dropdown-item" href="/s3/?region={{region}}">S3</a>
					</div>
				</div>

				<div class="dropdown region-dropdown pull-right">
					<a on-click="@this.toggle('show_region_dropdown')">
						{{#regions}}{{#if region === .id }}{{.name}}{{/if}}{{/regions}}
						<i class="icon zmdi {{#if show_region_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>
					</a>
					<div class="dropdown-menu {{#if show_region_dropdown}}show{{/if}}">
						{{#regions}}
							<li class="{{#if region === .id }}active{{/if}}"><a class="dropdown-item" href="?region={{.id}}">{{.name}}</a>
						{{/regions}}
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
		}
	},
})
