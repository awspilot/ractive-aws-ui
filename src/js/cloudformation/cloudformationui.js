;
Ractive.components.cloudformationui = Ractive.extend({
	template:
		`
			<hsplit style='top: 56px;'>
				<left>
					<div style="display: block;height: 28px;line-height: 28px;font-size: 12px;padding-left: 10px;background: linear-gradient(#eee, #e0e0e0);border: 1px solid #b9b8b6;border-top: 1px solid #fff;border-bottom: 1px solid #ccc;">Cloudformation</div>
					<div style="position: absolute;bottom: 0px;top: 29px;left: 0px;right: 0px;border: 1px solid #b9b8b6;">
						<div style="display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 10px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;cursor: pointer;border-bottom: 1px solid #e0e0e0;color: #146eb4;">Stacks</div>
					</div>
				</left>
				<content>
					<div style="position: absolute;top: 0px;left: 0px;right: 0px;height: 28px;overflow: hidden;font-size: 0px;background-color: #ececec;background: linear-gradient(#eee, #e0e0e0);">
						<div style="display: inline-block;height: 28px;line-height: 28px;padding: 0px 10px;cursor: pointer;font-size: 14px;border-right: 1px solid #cccccc;background-color: #ffffff;color: #000000;">
							Stacks
						</div>
					</div>
				</content>
			</hsplit>
	`,
	oninit: function() {
		console.log("cloudformation ui loading")
	}
})
;
