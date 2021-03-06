






	import "./less/style.less";

	import Ractive from 'ractive';
	import dynamodbui from '@awspilot/ractive-dynamodb-ui';
	import cloudformationui from '@awspilot/ractive-cloudformation-ui';
	import s3ui from '@awspilot/ractive-s3-ui';
	import header from './header'



	export default Ractive.extend({
		template: `
		<div class="awspilot-ractive-aws-ui">

			<header region={{region}} theme={{theme}} />


			<div style="position: absolute;top: 41px;left:0px;right:0px;bottom:0px;overflow:hidden">
				{{#if service === 'dynamodb'}}
					<dynamodbui region={{region}} accessKeyId="myKeyId" secretAccessKey="y" endpoint={{dynamodb_endpoint}} cwendpoint={{cloudwatch_endpoint}} theme={{theme}} />
				{{/if}}
				{{#if service === 'cloudformation'}}
					<cloudformationui region={{region}} accessKeyId="myKeyId" secretAccessKey="y" endpoint={{cloudformation_endpoint}} theme={{theme}} />
				{{/if}}
				{{#if service === 's3'}}
					<s3ui region={{region}} accessKeyId="myKeyId" secretAccessKey="y" endpoint={{s3_endpoint}} theme={{theme}} />
				{{/if}}
			</div>
		</div>
		`,
		components: {
			dynamodbui: dynamodbui,
			cloudformationui: cloudformationui,
			s3ui: s3ui,
			header: header,
		},



		data: function() {

			var theme='aws';
			try {
				if (window.localStorage.getItem('theme'))
					theme = window.localStorage.getItem('theme')
			} catch (e) {}

			return {
				region: this.deparam( location.href ).region || 'us-east-1',
				theme:  this.deparam( location.href ).theme || theme,

				dynamodb_endpoint: location.protocol + '//' + location.host + '/v1/dynamodb',
				//dynamodb_endpoint: 'https://djaorxfotj9hr.cloudfront.net/v1/dynamodb',

				cloudwatch_endpoint: location.protocol + '//' + location.host + '/v1/cloudwatch', // https://djaorxfotj9hr.cloudfront.net/v1/cloudwatch

				cloudformation_endpoint: location.protocol + '//' + location.host + '/v1/cloudformation',
				//cloudformation_endpoint: 'https://djaorxfotj9hr.cloudfront.net/v1/cloudformation',

				s3_endpoint: location.protocol + '//' + location.host + '/v1/s3',
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
		},
		set_theme( theme ) {
			this.set({theme:theme})
		}

	});
