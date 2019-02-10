;
Ractive.components.stackcreate = Ractive.extend({
	template: `
		<div style="padding: 30px;">
			<h3>Create Stack</h3>
			<br>
			<h4>Specify template</h4>

			<a class="btn btn-md btn-default"  on-click='upload' >Upload Template</a>
		</div>
	`,
	oninit: function() {
		var ractive=this;


		ractive.on('upload', function(e ) {
			$('body').pickafile({
				//accept: "text/csv",
				onselect: function(file){
					console.log('selected', file )
					var reader = new FileReader();
					reader.onload = function(e) {
						console.log(reader.result)
						// api_put('/v1/accounts/' + ractive.get('account_id') + '/prospects/uploads', {
						// 	filename: file.name,
						// 	size: file.size,
						// 	content: btoa(reader.result),
						// }, function(err,r) {
						// 	ractive.get_prospect_uploads()
						// })
					}
					reader.readAsBinaryString(file);
				},
			})
		})

	}
});
