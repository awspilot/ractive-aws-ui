Ractive.components.tabletab = Ractive.extend({
	isolated: true,
	template:
		`<div class='tableview {{#if active}}active{{/if}}'>
			<div class='tableview-table-tabs'>
				<a class='btn-tableview-tab {{#if tab === "info"}}active{{/if}}'         on-click='@this.set("tab","info")'><!-- <i class='zmdi zmdi-info'></i>--> Overview </a>
				<a class='btn-tableview-tab {{#if tab === "data"}}active{{/if}}'         on-click='@this.set("tab","data")'><!--<i class='zmdi zmdi-format-list-bulleted'></i>--> Items</a>
				<a class='btn-tableview-tab {{#if tab === "metrics"}}active{{/if}}'      on-click='@this.set("tab","metrics")'><!--<i class='zmdi zmdi-chart'></i>--> Metrics</a>
				<a class='btn-tableview-tab {{#if tab === "alarms"}}active{{/if}}'       on-click='@this.set("tab","alarms")'><!--<i class='zmdi zmdi-notifications'></i>--> Alarms</a>
				<a class='btn-tableview-tab {{#if tab === "capacity"}}active{{/if}}'     on-click='@this.set("tab","capacity")'><!--<i class='zmdi zmdi-memory'></i>--> Capacity</a>
				<a class='btn-tableview-tab {{#if tab === "indexes"}}active{{/if}}'      on-click='@this.set("tab","indexes")'><!--<i class='zmdi zmdi-format-line-spacing'></i>--> Indexes</a>
				<a class='btn-tableview-tab {{#if tab === "globaltables"}}active{{/if}}' on-click='@this.set("tab","globaltables")'><!--<i class='zmdi zmdi-globe'></i>--> Global Tables</a>
				<a class='btn-tableview-tab {{#if tab === "backups"}}active{{/if}}'      on-click='@this.set("tab","backups")'><!--<i class='zmdi zmdi-card-sd'></i>--> Backups</a>
				<a class='btn-tableview-tab {{#if tab === "triggers"}}active{{/if}}'     on-click='@this.set("tab","triggers")'><!--<i class='zmdi zmdi-portable-wifi'></i>--> Triggers</a>
			</div>
			<div style='position: absolute;top: 42px;left: 30px;right: 30px;bottom: 0px;'>
				{{#if err}}
					<br> {{ err.errorMessage || err.message }}
				{{else}}
					{{#if describeTable === null }}
						<br>Loading...
					{{else}}

						{{#if tab === 'info'}}
							<tableinfo table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'data'}}
							<tableitems table='{{.table}}' describeTable="{{describeTable}}" type='{{.type}}' scan='{{.scan}}' query='{{.query}}' sql='{{.sql}}' />
						{{/if}}
						
						{{#if tab === 'metrics'}}
							<tablemetrics table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'alarms'}}
							<tablealarms table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'capacity'}}
							<tablecapacity table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'indexes'}}
							<tableindexes table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'globaltables'}}
							<tableglobal table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'backups'}}
							<tablebackup table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}
						
						{{#if tab === 'triggers'}}
							<tabletriggers table='{{.table}}' describeTable="{{describeTable}}" />
						{{/if}}

					{{/if}}
				{{/if}}

			</div>
		</div>
	`,
	data: function() {
		return {
			tab: 'info',
			describeTable: null,
		}
	},

	describe_table: function( cb ) {
		var ractive=this;
		DynamoDB.client.describeTable({ TableName: ractive.get('table.name') } , function(err, data) {
			if (err)
				return ractive.set('err', err );

			ractive.set('err')
			ractive.set('describeTable', data.Table)
			if (typeof cb === "function") cb()
		})
	},

	oninit: function() {

		var ractive = this
		ractive.observe('tab', function( tab ) {
			//console.log("tab", tab )
		})

		ractive.describe_table()

	},
})
