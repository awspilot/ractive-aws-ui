Ractive.components.CreateItem = Ractive.extend({
	//isolated: true,
	template:
		'\
		<div id="jsoneditor" style="position: absolute;top:0;left:0;bottom:40px;right:0;">\
		</div>\
		<div style="position: absolute;left: 0px;right:0px;bottom:0px;height: 40px;box-sizing: border-box;padding: 5px;">\
			<a class="btn btn-sm btn-primary pull-right" on-click="create-item">Save</a>\
		</div>\
		',
	data: function() {
		return {

		}
	},

	oninit: function() {
		var ractive = this

		ractive.on('create-item', function() {
			var json = ractive.editor.get();
			var ddb = DynamoDB
				.explain()
				.table( ractive.get('describeTable.TableName') )

			ddb = ddb.if( ractive.get('describeTable.KeySchema.0.AttributeName') ).not_exists()

			if (ractive.get('describeTable.KeySchema.1.AttributeName'))
				ddb = ddb.if( ractive.get('describeTable.KeySchema.1.AttributeName') ).not_exists()

			ddb.insert(json, function(err, data ) {
				if (err)
					return alert('Failed')


				routeCall( { method: data.method, payload: data.payload } , function(err, data) {
					if (err)
						return alert('Failed: ' + ( err.message || err.errorMessage ) );

					// close window
					ractive.fire('close-window')
				});
			})

		})


		//console.log("createItem",  )
	},
	oncomplete: function() {
		var ractive = this;
		var container = document.getElementById('jsoneditor');
		var options = {
			//statusBar
			//mainMenuBar
			history: false,
			colorPicker: false,
			//timestampTag
			autocomplete: false,
			navigationBar: false,
			search: false,
			enableSort: false,
			sortObjectKeys: false,
			enableTransform: false,

			mode: 'tree',
			modes: [
				//'code', // ace source
				// 'form', // <-- does not allow adding / deleting attributes
				'text', // without ace
				'tree', // <-- aws style
				//'view'  // <-- useless
			],

		};
		ractive.editor = new JSONEditor(container, options);

		var dt = ractive.get('describeTable')
		var json = {}
		dt.KeySchema.map(function(ks) {
			json[ks.AttributeName] = ''
		})


		ractive.editor.set(json)
	}
})
