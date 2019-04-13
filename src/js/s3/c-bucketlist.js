;
Ractive.components.bucketlist = Ractive.extend({
	template: `
		<div class="" style="padding: 7px;">
			<a class="btn btn-xs btn-primary" on-click="create-bucket"><i class="icon zmdi zmdi-plus"></i> CREATE BUCKET </a>
			<a class="btn btn-xs btn-default {{#if selection_length > 0}}{{else}}disabled{{/if}}" on-click='delete' as-tooltip=' \" Delete bucket \" '><i class="icon zmdi zmdi-delete"></i> Delete </a>
			<a class="btn btn-xs btn-default pull-right" on-click="refresh"><i class="icon zmdi zmdi-refresh"></i></a>
		</div>


		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 38px;' />

	`,
	bucket_list: function(cb) {
		var ractive=this;
		ractive.set('selection_length')
		ractive.set('rows', [] )

		s3.listBuckets({
		}, function(err, data) {


			if (err) {
				if (cb) cb(err)
				return alert('Failed listening buckets');
			}

			ractive.set('rows',
				data.Buckets.map(function(b) {
					return [
						{ KEY: true },
						{ S: b.Name },
						{ S: '' },
						{ S: '' },
						{ S: b.CreationDate }
					]
				})
			);
			
			// async.each(data.Buckets, function(b,cb) {
			// 	s3.getBucketLocation({ Bucket: b.Name }, function(err, data) {
			// 		if (err)
			// 			return cb()
			// 
			// 		console.log(data)
			// 	});
			// }, function() {
			// 
			// })
	

	
	
			if (cb) cb(err,data)
		});
	},
	oninit: function() {
		var ractive=this;
		ractive.set('columns', [ null, 'Bucket name', 'Access', 'Region','Date created'])
		
		ractive.on('tabledata.selectrow', function(context) {
			var keypath = context.resolve()
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected') )
		
			ractive.set('selection_length',
				ractive.get('rows').filter(function(r) { return r[0].selected === true } ).length
			)
		})

		// ractive.observe('selection_length', function(n) {
		// 
		// 	var param1 = n === 1 ?
		// 		ractive.get('rows').filter(function(r) { return r[0].selected === true } )[0][1].S
		// 		:
		// 		undefined;
		// 
		// 	ractive.root.findComponent('cftabs').command( n === 1 ? 'stackdetails' : 'stacklist', param1 )
		// })
		// 
		ractive.on('refresh', function() {
			ractive.bucket_list(function() {})
		})
		
		ractive.on('create-bucket', function() {
			ractive.root.findComponent('cftabs').command('bucketcreate', 'Create Bucket' )
		})

		ractive.on('delete', function() {
			var selected = ractive.get('rows').filter(function(r) { return r[0].selected === true } );
		
			if ( selected.length === 0 )
				return alert('Please select a bucket to delete')
		
			if ( selected.length > 1 )
				return alert('Please select one bucket at a time')
		
			var bucketname = selected[0][1].S
		
			if (confirm('Are you sure you want to delete bucket ' + bucketname )) {
		
				s3.deleteBucket({ Bucket: bucketname, }, function(err, data) {
					if (err)
						alert('delete bucket failed')

					setTimeout(function(){
						ractive.bucket_list(function() {})
					}, 1500)
		
				});
			}
		
		})
		ractive.bucket_list(function() {})
	},
});
