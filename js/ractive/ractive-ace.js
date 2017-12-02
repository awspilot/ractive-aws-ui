Ractive.components['ace'] = Ractive.extend({
	template: "<div style='{{style}}' class='{{class}}'></div>",
	isolated: true,
	data: {
		style: "height:100%",
		value: "",
		mode: "html",
		theme: null
	},
	oncomplete: function () {
		var self = this
		var div = this.find('div')
		var updating = false; // a flag to avoid recursive calls between ace and the change observer
		var editor = ace.edit(div);
		editor.$blockScrolling = Infinity;

		editor.getSession().on('change', function() {
			if( updating )
				return
			updating = true
			self.set('value', editor.getValue())
			updating = false
		})

		this.observe('value', function(val, old, kp) {
			if( updating )
				return
			updating = true
			if( !val && typeof(val) !== 'string' )
				val = ''
			editor.setValue( val, -1 )
			updating = false
		})

		this.observe('mode', function(val, old, kp) {
			if(val)
				editor.getSession().setMode( "ace/mode/" + val);
		})
		this.observe('theme', function(val, old, kp) {
			if(val)
				editor.setTheme("ace/theme/" + val);
			else
				editor.setTheme(null)
		})
	}
})
