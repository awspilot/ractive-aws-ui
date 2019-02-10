(function ( $ ) {
	$.fn.pickafile = function(options) {
		this.each(function() {
			var $target = $(this)
			var $fileinput = $('<input/>', {
				type: 'file',
				accept: options.accept || undefined,
				style: 'display: none'
			})
			$fileinput.on('change',function() {
				if ($fileinput.get(0).files.length > 1)
					return alert('Please upload one file at a time')

				options.onselect.apply( $target, [ $fileinput.get(0).files[0] ] )
			})
			$fileinput.click()

		})
		return this
	}

}( jQuery ));
