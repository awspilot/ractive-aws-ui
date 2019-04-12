
var s3 = null;
;
Ractive.components.s3ui = Ractive.extend({
	template:
		`
			<hsplit style='top: 41px;'>
				<left style="border: 1px solid #b9b8b6;">
					<div style="display: block;font-size: 12px;padding-left: 10px;font-size: 18px;font-weight: 700;color: #000;line-height: 2rem;padding: 12px 35px;border-bottom: 1px solid #ddd;">
						S3
					</div>
					<div style="position: absolute;bottom: 0px;top: 60px;left: 0px;right: 0px;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #ec7211;font-weight: bold;">Buckets</div>
					</div>
				</left>
				<content  style="background-color: transparent;border: 0px;">
					<cftabs active_id='stacklist' />
				</content>
			</hsplit>
	`,
	oninit: function() {
		var ractive=this;

		s3 = new AWS.S3({
			endpoint: location.protocol + '//' + location.hostname + '/v1/s3/',
			sslEnabled: false,
			s3ForcePathStyle: true,
			region: ractive.get('region'),
			credentials: {
				accessKeyId: 'S3RVER',
				secretAccessKey: 'S3RVER',
			}
		});

	}
})
;
