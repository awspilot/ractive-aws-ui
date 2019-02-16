;
Ractive.components.stackdetails = Ractive.extend({
	template: `
		<div style="position: absolute;top: 0px;left:0px;right: 0px;bottom: 0px;overflow: auto;white-space: pre;font-family: monospace;padding: 15px;">
		{{TemplateBody}}
		</div>
	`,
	oninit: function() {
		var ractive=this;

		var params = {
		  StackName: this.get('stack'),
		  //TemplateStage: Original | Processed
		};
		cloudformation.getTemplate(params, function(err, data) {
			if (err)
				return alert('failed getting stack template')

			ractive.set('TemplateBody',data.TemplateBody)
		});

	}
})
