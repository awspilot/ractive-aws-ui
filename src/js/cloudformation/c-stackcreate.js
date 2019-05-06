;
Ractive.components.stackcreate = Ractive.extend({
	template: `

			{{#if page === 'upload'}}
				<h3>Create Stack</h3>
				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">

					
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Specify template</div>
					<div style="padding: 30px;">

							{{#if err}}
								<div class="err" style='color: #dc3636;background-color: #e69ca6;border: 1px solid #ec6b6b;border-radius: 3px;padding: 6px;'>{{ err.message || "Template parse failed" }}</div>
							{{/if}}


							<br>
							<h4>Specify template</h4>
							<p>
								<li>✅ .yaml or json
								<li>✅ !Ref to in-template and pseudo parameters
								<li>❌ !Ref to another resource
								<li>❌ !ImportValue, !GetAtt !Transform
								<li>❌ !Base64 !FindInMap !GetAZs !If !Join !Select !Split !Sub
								<li>✅ the only partially supported resource type is <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html" target="_blank">AWS::DynamoDB::Table</a>
								<li>❌ all other resource types are created as decoy
							</p>
							<a class="btn btn-md btn-default"  on-click='upload' >Upload Template</a>

					</div>
				</div>
				<div style="max-width: 800px;">
					<a class="btn btn-warning {{#if newstack.TemplateBody === null }}disabled{{/if}} pull-right" on-click="goto-parameters">Next</a>
				</div>
			{{/if}}

			{{#if page === 'parameters'}}
				<h3>Specify stack details</h3>

				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Stack name</div>
					<div style="padding: 30px;">
						<br>
						<div>Stack name</div>
						<input type="text" value="{{newstack.StackName}}" style="width: 100%;padding: 10px;"/>
						<small>Stack name can include letters (A-Z and a-z), numbers (0-9), and dashes (-).</small>

					</div>
				</div>
				<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">
					<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Parameters</div>
					<div style="padding: 30px;">


				{{#newstack.Parameters}}
				<br>
				<div>{{.ParameterKey}}</div>
					<div>
					{{#if .ParameterConstraints.AllowedValues}}
						<select value="{{.ParameterValue}}" style="width: 100%;padding: 10px;height: 37px;">
							{{#.ParameterConstraints.AllowedValues}}
							<option value="{{.}}">{{.}}</option>
							{{/.ParameterConstraints.AllowedValues}}
						</select>
					{{else}}
						<input type="text" value="{{.ParameterValue}}" style="width: 100%;padding: 10px;">
					{{/if}}
				</div>
				{{/newstack.Parameters}}

					</div>
				</div>

				<div style="max-width: 800px;">
					<a class="btn btn-warning {{#if newstack.StackName === '' }}disabled{{/if}} pull-right" on-click="goto-confirm">Next</a>
				</div>

			{{/if}}


			{{#if page === 'confirm'}}
				<div style="position: absolute;top: 0px;left: 0px;right:0px;overflow: auto;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;">
					<div style="padding: 30px;">

						<div class="err" style='{{#if !err}}visibility:hidden;{{/if}}color: #dc3636;background-color: #e69ca6;border: 1px solid #ec6b6b;border-radius: 3px;padding: 6px;margin-bottom: 10px;'>{{ err.message || "Create failed" }}</div>

						<a class="btn btn-warning" on-click="create">Create</a>
					</div>
				</div>
			{{/if}}

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
			ractive.set('err')
			$('body').pickafile({
				//accept: "text/csv",
				onselect: function(file){
					console.log('selected', file )
					var reader = new FileReader();
					reader.onload = function(e) {
						ractive.set('newstack.StackName', file.name.split('.yaml').join('').split('.json').join('') )
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
				if (err) {
					ractive.set('err', err )
					console.log("getTemplateSummary failed", typeof err, JSON.stringify(err), err.message )
					return;
				}

				ractive.set('newstack.Parameters', data.Parameters.map(function(template_parameter) {
					if (template_parameter.DefaultValue)
						template_parameter.ParameterValue = template_parameter.DefaultValue
					return template_parameter
				}) )
				ractive.set('newstack.ResourceTypes',  data.ResourceTypes )

				//console.log(err,data)
				ractive.set('page','parameters')
			});


		})
		ractive.on('goto-confirm', function() {
			ractive.set('err')
			ractive.set('page','confirm')
		})
		ractive.on('create', function() {


			ractive.set('err')



			var params = ractive.get('newstack');
			params.Parameters = params.Parameters.map(function(p){ return {
				ParameterKey: p.ParameterKey,
				ParameterValue: p.ParameterValue,
			}});
			cloudformation.createStack(params, function(err, data) {

				if (err) {
					ractive.set('err', err )
					return;
				}

				setTimeout(function() {
					ractive.root.findComponent('cftabs').command('stacklist' )
				}, 1500)

			});
		})
	}
});
