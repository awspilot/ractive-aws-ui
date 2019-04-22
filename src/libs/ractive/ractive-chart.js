;

Ractive.components.chart = Ractive.extend({
	
	// <polyline fill="none" stroke="#0074d9" stroke-width="2" points=" 00,11 22,33 33,44 55,66" />
	
	template: `
		<div id="{{id}}" class="{{class}}" style="{{style}};display: inline-block;" on-resize="resize">
			<style>
				.bar:hover {
					fill: darkblue;
				}
				.tooltip {
					background: cornsilk;
					border: 1px solid black;
					border-radius: 5px;
					padding: 5px;
				}
			</style>

			{{#if width && height }}
				<div class="tooltip" style="position: absolute; display: none;"></div>
				
				<svg width="{{width}}" height="{{height}}" viewBox="0 0 {{width}} {{height}}">


					<rect x="0" y="0" width="{{width}}" height="{{height}}" fill="#f0f0f0"></rect>
					<rect x="{{marginLeft}}" y="0" width="{{ width - marginLeft }}" height="{{ height - marginBottom }}" fill="#f0f0f0"></rect>


					<g class="grid">
						<!-- x axis -->
						<line x1="{{marginLeft + (70 * 0) }}" y1="{{ marginTop +2 }}" x2="{{marginLeft + (70 * 0) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 1) }}" y1="{{ marginTop +2 }}" x2="{{marginLeft + (70 * 1) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 2) }}" y1="{{ marginTop +2 }}" x2="{{marginLeft + (70 * 2) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						<line x1="{{marginLeft + (70 * 3) }}" y1="{{ marginTop +2 }}" x2="{{marginLeft + (70 * 3) }}" y2="{{ height - marginBottom }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>



						<!-- y axis -->
						{{#each Array( 6 ):i }}
							<line x1="{{marginLeft}}" y1="{{height - marginBottom - (yAxis_tickInterval() * i ) }}" x2="{{width - marginRight }}" y2="{{height - marginBottom - (yAxis_tickInterval() * i ) }}" fill="none" shape-rendering="crispEdges" stroke="#ccc" stroke-dasharray="5,2" stroke-width="1"></line>
						{{/each}}

					</g>


					<g class="axes">
						<polyline points="{{marginLeft}},{{marginTop +2 }} {{marginLeft}},{{height - marginBottom}} " fill="none" shape-rendering="crispEdges" stroke="#bbb" stroke-width="1"></polyline>
						<polyline points="{{marginLeft}},{{height - marginBottom}} {{width - marginRight}}, {{height - marginBottom}}" fill="none" shape-rendering="crispEdges" stroke="#bbb" stroke-width="1"></polyline>
					</g>

					{{#if disabled}}
						<text x="50%" y="50%" fill="#999" dominant-baseline="middle" text-anchor="middle">{{ disabled }}</text>
					{{/if}}
					{{#if series.length}}
						{{#series.0.data:i}}
							<rect class="bar" fill="#7cb5ec" x="{{ ~/marginLeft + ( (~/bar_width() || 10) * i ) + ((i+1)*1)  }}" width="{{ ~/bar_width() }}" y="{{ ~/height - ~/marginBottom - ( ~/pixels_per_unit() * .[1] ) -1 }}" height="{{ ~/pixels_per_unit() * .[1] }}" on-mousemove="showTooltip" on-onmouseout="hideTooltip"></rect>
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
			canvas_height: function() {
				var canvas_height = ((this.get('height') - this.get('marginBottom') - this.get('marginTop') )* 100)/100    - 2;
				//if (this.get('debug')) console.log("canvas_height", canvas_height )
				return  canvas_height; // biggest should go to up-to 100
			},
			max_value: function() {
				var series = this.get('series');
				var max = 0;
				((series[0] || {}).data || []).map(function(d) {
					max = Math.max(d[1], max)
				});
				//if (this.get('debug')) console.log("max_value", max )
				return max;
			},
			bar_height: function( value ) {

				var max = this.get('max_value')()

				var canvas_height = this.get('canvas_height')()

				var bar_height = (value[1] * canvas_height)/max
				
				
				
				return bar_height;
			},
			
			pixels_per_unit: function() {

				var canvas_height = this.get('canvas_height')()
				var limits_arr = Array(5).fill().map(function(k, i) { return Math.pow(10, i) })
								.concat(Array(5).fill().map(function(k, i) { return 2 * (( Math.pow(10, i) ) || 1) }))
								.concat(Array(5).fill().map(function(k, i) { return 5 * (( Math.pow(10, i) ) || 1) }))
								.sort(function(a,b) { return a > b ? -1 : 1})
								.filter(function(v) { return v > 4});

				var max = this.get('max_value')()

				var top_limit = limits_arr[0];
				limits_arr.map(function(limit) { if ( max < limit ) top_limit = limit; })

				//console.log("top_limit=", top_limit )

				var pixels_per_unit = canvas_height / top_limit
				//console.log("pixels_per_unit=", pixels_per_unit )

				return pixels_per_unit
			},
			
			yAxis_tickInterval: function() {
				// if (this.get('yAxis.tickInterval'))
				// 	return this.get('yAxis.tickInterval');
				

				var canvas_height = this.get('canvas_height')()

				// console.log("top_limit=", top_limit )
				// var number_of_bars = 6;
				// var units_per_bar = top_limit / 5;


				var limits_arr = Array(5).fill().map(function(k, i) { return Math.pow(10, i) })
								.concat(Array(5).fill().map(function(k, i) { return 2 * (( Math.pow(10, i) ) || 1) }))
								.concat(Array(5).fill().map(function(k, i) { return 5 * (( Math.pow(10, i) ) || 1) }))
								.sort(function(a,b) { return a > b ? -1 : 1})
								.filter(function(v) { return v > 4});

				var series = this.get('series');
				var max = 0;
				((series[0] || {}).data || []).map(function(d) {
					max = Math.max(d[1], max)
				})

				//console.log("max=", max )
				
				var top_limit = limits_arr[0];
				limits_arr.map(function(limit) { if ( max < limit ) top_limit = limit; })
				
				//console.log("top_limit=", top_limit )

				var pixels_per_unit = canvas_height / top_limit
				//console.log("pixels_per_unit=", pixels_per_unit )

				return canvas_height / 5;


			},
			
			yAxis: {
				//tickInterval: 10,
			},
			yTicks: function() {
				return 5;
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
			

			//console.log('resize', e.width, e.height )
		})

		ractive.on('showTooltip', function(e) {
			// let tooltip = e.node.parentNode.parentNode.getElementsByClassName('tooltip')[0]
			// tooltip.innerHTML = 'this is tooltip';
			// tooltip.style.display = "block";
			// tooltip.style.left = e.original.offsetX + 10 + 'px';
			// tooltip.style.top = e.original.offsetY + 10 + 'px';
		})
		ractive.on('hideTooltip', function(e) {
			// let tooltip = e.node.parentNode.parentNode.getElementsByClassName('tooltip')[0]
			// tooltip.style.display = "none";
		})

	}
})
;
