;
var cloudformation = null;
;
Ractive.components.cloudformationui = Ractive.extend({
	template:
		`
			<hsplit style='top: 41px;'>
				<left style="border: 1px solid #b9b8b6;">
					<div style="display: block;font-size: 12px;padding-left: 10px;font-size: 18px;font-weight: 700;color: #000;line-height: 2rem;padding: 12px 35px;border-bottom: 1px solid #ddd;">
						Cloudformation
					</div>
					<div style="position: absolute;bottom: 0px;top: 60px;left: 0px;right: 0px;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #ec7211;font-weight: bold;">Stacks</div>
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;">StacksSets</div>
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;">Exports</div>
					</div>
				</left>
				<content>
					<cftabs active_id='stacklist' />
				</content>
			</hsplit>
	`,
	oninit: function() {
		var ractive=this;

		cloudformation = new AWS.CloudFormation({
			endpoint: location.protocol + '//' + location.hostname + '/v1/cloudformation?region=' + ractive.get('region'),

			// region is required by aws-sdk to build the endpoint host when endpoint is not passwd
			// we passed an endpoint so it does not really matter what we write in region
			region: 'xyz',

			accessKeyId: "myKeyId",
			secretAccessKey: "secretKey",
		});

	}
})
;
