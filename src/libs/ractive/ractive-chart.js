;

Ractive.components.chart = Ractive.extend({
	
	// <polyline fill="none" stroke="#0074d9" stroke-width="2" points=" 00,11 22,33 33,44 55,66" />
	
	template: `
		<div id="{{id}}" class="{{class}}" style="{{style}};display: inline-block;" on-resize="resize">
		

			{{#if width && height }}

				<svg width="{{width}}" height="{{height}}" viewBox="0 0 {{width}} {{height}}">

					<rect x="0" y="0" width="{{width}}" height="{{height}}" fill="#f0f0f0"></rect>
					<rect x="{{marginLeft}}" y="0" width="{{ width - marginLeft }}" height="{{ height - marginBottom }}" fill="#f0f0f0"></rect>

					<g class="grid">
						<!-- x axis -->
						<line x1="{{marginLeft + (70 * 0) }}" y1="{{ marginTop }}" x2="{{marginLeft + (70 * 0) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 1) }}" y1="{{ marginTop }}" x2="{{marginLeft + (70 * 1) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 2) }}" y1="{{ marginTop }}" x2="{{marginLeft + (70 * 2) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 3) }}" y1="{{ marginTop }}" x2="{{marginLeft + (70 * 3) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>



						<!-- y axis -->
						<line x1="{{marginLeft}}" y1="{{height - marginBottom - (70 * 1 ) }}" x2="{{width - marginRight }}" y2="{{height - marginBottom - (70 * 1 ) }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft}}" y1="{{height - marginBottom - (70 * 2 ) }}" x2="{{width - marginRight }}" y2="{{height - marginBottom - (70 * 2 ) }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>



					</g>

					<g class="axes">
						<polyline points="{{marginLeft}},{{marginTop}} {{marginLeft}},{{height - marginBottom}} " fill="none" shape-rendering="crispEdges" stroke="#bbb" stroke-width="1"></polyline>
						<polyline points="{{marginLeft}},{{height - marginBottom}} {{width - marginRight}}, {{height - marginBottom}}" fill="none" shape-rendering="crispEdges" stroke="#bbb" stroke-width="1"></polyline>
					</g>

					{{#if disabled}}
						<text x="50%" y="50%" fill="#999" dominant-baseline="middle" text-anchor="middle">{{ disabled }}</text>
					{{/if}}
					{{#if series.length}}
						{{#series.0.data:i}}
							<rect class="bar" fill="#7cb5ec" x="{{ ~/marginLeft + ( (~/bar_width() || 10) * i ) + ((i+1)*1)  }}" width="{{ ~/bar_width() }}" y="{{ ~/height - ~/marginBottom - ~/bar_height( . ) -1 }}" height="{{ ~/bar_height( . ) }}"></rect>
						{{/}}
					{{/if}}

				</svg>
			{{/if}}

		</div>
	`,
	events: {
		resize: function (node, fire) {
			var active = true;
			var width = node.clientWidth;
			var height = node.clientHeight;
			
			var onFrame = function() {
			
				if (!active) return;
			
				var oldWidth = width;
				var oldHeight = height;
				var triggerWidth = width != node.clientWidth;
				var triggerHeight = height != node.clientHeight;
			
				width = node.clientWidth;
				height = node.clientHeight;
			
				if ((triggerWidth) || (triggerHeight)) {
					fire( { 
						node: node,
						width: width, 
						height: height,
						oldWidth: oldWidth, 
						oldHeight: oldHeight, 
					});
				}
			
				window.requestAnimationFrame(onFrame);
			
			}

			window.requestAnimationFrame(onFrame);

			fire( { 
				node: node,
				width: width, 
				height: height,
			});
			
			return {
				teardown() {
					active = false;
				}
			}

		}

	},
	data: function() {
		return {
			type: 'bar',
			bar_width: function( value ) {
				return ((this.get('width') - this.get('marginLeft') - this.get('marginRight') ) / (((this.get('series') || {})[0] || {}).data || []).length)-1;
			},
			bar_height: function( value ) {

				var series = this.get('series');
				var max = 0;
				((series[0] || {}).data || []).map(function(d) {
					max = Math.max(d[1], max)
				})

				var canvas_height = ((this.get('height') - this.get('marginBottom') - this.get('marginTop') )* 80)/100    - 2; // biggest should go to up-to 100


				var bar_height = (value[1] * canvas_height)/max
				
				
				
				return bar_height;
			},
			
			
			// defaults
			marginTop: 20,
			marginLeft: 20,
			marginBottom: 20,
			marginRight: 20,
		}
	},
	oninit: function() {
		var ractive=this;
		ractive.on('resize', function(e) {
			ractive.set('width', e.width)
			ractive.set('height', e.height)
			console.log('resize', e.width, e.height )
		})
	}
})
;
