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
					<li>✅ !Ref to template parameter with a default value
					<li>❌ !Ref to template parameter without a default value
					<li>❌ !Ref to another resource
					<li>❌ !Ref to pseudo parameters
					<li>❌ !ImportValue
					<li>❌ !GetAtt
					<li>❌ !Transform
					<li>❌ !Base64 !FindInMap !GetAZs !If !Join !Select !Split !Sub
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
				<table>
				<tr>
					<td>Stack name</td>
					<td><input type="text" value="{{newstack.StackName}}" /></td>
				</tr>
				<tr>
					<td>Parameters</td>
					<td></td>
				</tr>


				{{#newstack.Parameters}}
				<tr>
					<td>{{.ParameterKey}}</td>
					<td><input type="text" value="{{.ParameterValue}}"></td>
				</tr>
				{{/newstack.Parameters}}
				</table>

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

			var params = {
				TemplateBody: ractive.get('newstack.TemplateBody'),
			};
			cloudformation.getTemplateSummary(params, function(err, data) {
				if (err)
					return alert('Template failed to parse')

				ractive.set('newstack.Parameters', data.Parameters )
				ractive.set('newstack.ResourceTypes',  data.ResourceTypes )

				//console.log(err,data)
				ractive.set('page','parameters')
			});


		})
		ractive.on('goto-confirm', function() {
			ractive.set('page','confirm')
		})
		ractive.on('create', function() {

			var params = ractive.get('newstack');
			params.Parameters = params.Parameters.map(function(p){ return {
				ParameterKey: p.ParameterKey,
				ParameterValue: p.ParameterValue,
			}});
			cloudformation.createStack(params, function(err, data) {

				if (err)
					return alert('create failed')

				alert('stack created')
				console.log("CreateStack",err,data)
			});
		})
	}
});
