






	import "./less/style.less";

	import Ractive from 'ractive';
	import dynamodbui from '@awspilot/ractive-dynamodb-ui';
	import cloudformationui from '@awspilot/ractive-cloudformation-ui';
	import header from './header'



	export default Ractive.extend({
		template: `
		<div class="awspilot-ractive-aws-ui">
			<WindowHost />
			<header region={{region}} />


			<div style="position: absolute;top: 41px;left:0px;right:0px;bottom:0px;overflow:hidden">
				{{#if service === 'dynamodb'}}
					<dynamodbui region={{region}} accessKeyId="myKeyId" secretAccessKey="y" endpoint={{dynamodb_endpoint}} cwendpoint={{cloudwatch_endpoint}} theme="aws" />
				{{/if}}
				{{#if service === 'cloudformation'}}
					<cloudformationui region={{region}} accessKeyId="myKeyId" secretAccessKey="y" endpoint={{cloudformation_endpoint}}  />
				{{/if}}
			</div>
		</div>
		`,
		components: {
			dynamodbui: dynamodbui,
			cloudformationui: cloudformationui,
			header: header,

			Window: RactiveWindow.default.Window,
			WindowHost: RactiveWindow.default.WindowHost,
		},
		css: $CSS,


		data: function() {
			return {
				region: this.deparam( location.href ).region || 'us-east-1',

				//dynamodb_endpoint: location.protocol + '//' + location.host + '/v1/dynamodb',
				dynamodb_endpoint: 'https://djaorxfotj9hr.cloudfront.net/v1/dynamodb',

				cloudwatch_endpoint: location.protocol + '//' + location.host + '/v1/cloudwatch', // https://djaorxfotj9hr.cloudfront.net/v1/cloudwatch

				//cloudformation_endpoint: location.protocol + '//' + location.host + '/v1/cloudformation',
				cloudformation_endpoint: 'https://djaorxfotj9hr.cloudfront.net/v1/cloudformation',
			}
		},

		deparam: (function(d,x,params,pair,i) {
		return function (qs) {
			params = {};
			qs = qs.substring(qs.indexOf('?')+1).replace(x,' ').split('&');
			for (i = qs.length; i > 0;) {
				pair = qs[--i].split('=');
				params[d(pair[0])] = d(pair[1]);
			}
			return params;
		};//--  fn  deparam
		})(decodeURIComponent, /\+/g),

		on: {
			init() {
				console.log( "deparam", this.deparam( location.href ) )
			},
		}

	});
