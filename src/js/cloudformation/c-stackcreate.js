;
Ractive.components.stackcreate = Ractive.extend({
	template: `
		<div style="padding: 30px;">
			{{#if page === 'upload'}}
				<h3>Create Stack</h3>
				<br>
				<h4>Specify template</h4>
				<p>
					<li>✅ .yaml or json
					<li>❌ no parameters, no !Ref,
					<li>❌ no !ImportValue
					<li>✅ the only partially supported resource type is <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html" target="_blank">AWS::DynamoDB::Table</a>
					<li>❌ all other resource types are created as decoy
				</p>
				<a class="btn btn-md btn-default"  on-click='upload' >Upload Template</a>
				<hr>
				<a class="btn btn-warning {{#if newstack.TemplateBody === null }}disabled{{/if}} pull-right" on-click="goto-parameters">Next</a>
			{{/if}}

			{{#if page === 'parameters'}}
				<h3>Specify stack details</h3>
				<br>
				<h4>Stack name</h4>
				<input type="text" value="{{newstack.StackName}}" />

				<h4>Parameters</h4>
				(not supported yet)

				<hr>
				<a class="btn btn-warning {{#if newstack.StackName === '' }}disabled{{/if}} pull-right" on-click="goto-confirm">Next</a>
			{{/if}}


			{{#if page === 'confirm'}}
				<a class="btn btn-warning" on-click="create">Create</a>
			{{/if}}
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


		ractive.on('upload', function(e ) {
			$('body').pickafile({
				//accept: "text/csv",
				onselect: function(file){
					console.log('selected', file )
					var reader = new FileReader();
					reader.onload = function(e) {
						ractive.set('newstack.TemplateBody', reader.result)
					}
					reader.readAsBinaryString(file);
				},
			})
		});
		ractive.on('goto-parameters', function() {
			ractive.set('page','parameters')
		})
		ractive.on('goto-confirm', function() {
			ractive.set('page','confirm')
		})
		ractive.on('create', function() {

			var params = ractive.get('newstack');
			cloudformation.createStack(params, function(err, data) {
				console.log("CreateStack",err,data)
			});
		})
	}
});
