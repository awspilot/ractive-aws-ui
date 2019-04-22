
;

Ractive.components.DynamoMetrics = Ractive.extend({
	template: `
	
		<chart style="width: 100%;height: 216px;" series="{{metrics.table.read.series}}" debug="{{debug}}"/>
	`,
	load_graph_data: function() {
		var ractive=this;

		var period = 60;
		var interval = ractive.get('interval');
		switch (interval) {
			case '1':
				period = 60;  // 60 per minute
				break;
			case '3':
				period = 300; // 20 per minute, 60 per total
				break;
			case '6':
				period = 300; // should be at 5 min ?
				break;
			case '12':
				period = 60*60; // one per minute, 12 per total
				break;
			case '24':
				period = 60*60; // one per minute, 24 per total
				break;
			case '72':
				period = 60*60; //
				break;
			case '168':
				period = 60*60; // shoul be daily
				break;
			case '336':
				period = 60*60; // should be daily
				break;
		}

		cloudwatch.getMetricStatistics({
			StartTime: new Date( new Date().getTime() - (1000*60*60*interval) ),
			EndTime:   new Date(  ),
			Namespace: 'AWS/DynamoDB',
			MetricName: ractive.get('metric'),
			Period: period, 
			Statistics: [ 'Sum' ], 
			Dimensions: [
				{
					Name: 'TableName',
					Value: ractive.get('table')
				},
			],
		}, function( err, data ) {
			if (err)
				return ractive.set('disabled','Failed')

			var series = [{ data: data.Datapoints.map(function(dp) { return ['', dp.Sum ] }) }];
			ractive.set('metrics.table.read.series', series )
			console.log('series', series)
			console.log('series', ractive.get('series') )

			ractive.set('disabled')
			
		} )
	},
	oninit: function() {
		var ractive=this;


		ractive.load_graph_data()
	
		ractive.observe('interval', function() {
			ractive.load_graph_data()
		})
	},
	data: function() {

		return {
			debug: true,
			metrics: {
				table: {
					read: {
						series: [
							{
								//name
								data: []
							}
						]
					}
				}
			},
		}
	},
});

Ractive.components.tablemetrics = Ractive.extend({
	template: `
		<div style='padding: 30px'>
			<h3>
				Metrics
			
				<div style="float:right">
					<select value="{{interval}}">
						<option value="1">Last hour</option>
						<option value="3">Last 3 hours</option>
						<option value="6">Last 6 hours</option>
						<option value="12">Last 12 hours</option>
						<option value="24">Last 24 hours</option>

						<option value="72">Last 3 days</option>
						<option value="168">Last 1 week</option>
						<option value="336">Last 2 weeks</option>

					</select>
				</div>
			</h3>
			<hr>
			
			<h4>Capacity: table</h4>
			<hr>

			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Read capacity</b> Units/Minute</div>
				<DynamoMetrics table="{{ describeTable.TableName }}" disabled="Loading..." metric="ConsumedReadCapacityUnits" interval="{{interval}}" period="{{period}}" color="#f7a35c" namespace="AWS/DynamoDB" />
			</div>
			
			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Throttled read requests</b> Count</div>
				<chart style="width: 100%;height: 216px;" disabled="Not Tracked" />
			</div>
			
			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Throttled read events</b> Count</div>
				<chart style="width: 100%;height: 216px;" disabled="Not Tracked" />
			</div>
			
			<div style="clear:both;padding: 20px;"></div>

			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Write capacity</b> Units/Second</div>
				<DynamoMetrics table="{{ describeTable.TableName }}" disabled="Loading..." metric="ConsumedWriteCapacityUnits" interval="{{interval}}" period="{{period}}" color="#f7a35c" namespace="AWS/DynamoDB" />
			</div>
			
			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Throttled write requests</b> Count</div>
				<chart style="width: 100%;height: 216px;" disabled="Not Tracked" />
			</div>
			
			<div style="float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;">
				<div><b>Throttled write events</b> Count</div>
				<chart style="width: 100%;height: 216px;" disabled="Not Tracked" />
			</div>
			
		</div>
	`,
	oninit: function() {
		var ractive=this;
		console.log('init metrics with', ractive.get() )
	},
	data: function() {
		return {
			interval: 1,
		}
	}
	
})
