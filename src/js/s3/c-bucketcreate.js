;
Ractive.components.bucketcreate = Ractive.extend({
	template: `


				<h3>Create Bucket</h3>

				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Stack name</div>
					<div style="padding: 30px;">
						<br>
						<div>Bucket name</div>
						<input type="text" value="{{newbucket.Bucket}}" style="width: 100%;padding: 10px;"/>
						<small>Enter DNS-compilant bucket name</small>


						<br><br><br>
						<div>Region</div>
						<input type="text" value="N/A" disabled style="width: 100%;padding: 10px;"/>
						<small>AWS uses API host names to create buckets in different regions, This local version of S3 does not support regions yet</small>



					</div>
				</div>
				
				
				
				<div style="max-width: 800px;">
					<a class="btn btn-warning {{#if newbucket.Bucket === '' }}disabled{{/if}} pull-right" on-click="create-bucket">Create</a>
				</div>

	`,
	data: function() {
		return {
			page: 'upload',
			newstack: {
				StackName: '',
				TemplateBody: null,
			}

		}
	},
	oninit: function() {
		var ractive=this;


		ractive.on('create-bucket', function() {

			var params = ractive.get('newbucket');
			s3.createBucket(params, function(err, data) {
			
				if (err)
					return alert('Create bucket failed')

				setTimeout(function() {
					ractive.root.findComponent('cftabs').command('bucketlist' )
				}, 1500)
			
			});
		})
	}
});
