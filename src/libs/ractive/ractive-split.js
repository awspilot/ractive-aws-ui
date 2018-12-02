Ractive.components.hsplit = Ractive.extend({
	isolated: false,
	data: {
		direction: 'horizontal'
	},
	template: '<div class="hsplit {{class}} " style="{{style}}">{{yield}}</div>',
	oncomplete: function() {
		//var children = this.find('div').children;
		//children = Array.prototype.slice.call( children ); // HTMLCollection -> Array
		//console.log(children);
		//Split(children, {
		//	direction: this.get('direction'),
		//	sizes: this.get('sizes'),
		//	elementStyle: function (dimension, size, gutterSize) {
		//		return {
		//			'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
		//		}
		//	},
		//	gutterStyle: function (dimension, gutterSize) {
		//		return {
		//			'flex-basis':  gutterSize + 'px'
		//		}
		//	}
		//})
	}
})
