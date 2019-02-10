;
var cloudformation = null;
;
Ractive.components.cloudformationui = Ractive.extend({
	template:
		`
			<hsplit style='top: 56px;'>
				<left>
					<div style="display: block;height: 28px;line-height: 28px;font-size: 12px;padding-left: 10px;background: linear-gradient(#eee, #e0e0e0);border: 1px solid #b9b8b6;border-top: 1px solid #fff;border-bottom: 1px solid #ccc;">Cloudformation</div>
					<div style="position: absolute;bottom: 0px;top: 29px;left: 0px;right: 0px;border: 1px solid #b9b8b6;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 10px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;cursor: pointer;border-bottom: 1px solid #e0e0e0;color: #146eb4;">Stacks</div>
					</div>
				</left>
				<content>
					<tabhead>
						<tab class="active">Stacks</tab>
					</tabhead>
					<tabcontent>
						<stacklist region="{{region}}"/>
					</tabcontent>
				</content>
			</hsplit>
	`,
	oninit: function() {
		var ractive=this;

		cloudformation = new AWS.CloudFormation({
			endpoint: location.protocol + '//' + location.hostname + ':10001' + '/' + ractive.get('region'),

			// region is required by aws-sdk to build the endpoint host when endpoint is not passwd
			// we passed an endpoint so it does not really matter what we write in region
			region: 'xyz',

			accessKeyId: "myKeyId",
			secretAccessKey: "secretKey",
		});

	}
})
;
