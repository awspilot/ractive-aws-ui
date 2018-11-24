


function positionTooltip(event, anchor, tooltip) {
	var mousePos = {x: event.pageX, y: event.pageY};

	var tooltipWidth = tooltip.offsetWidth;
	var tooltipHeight = tooltip.offsetHeight;

	var top = mousePos.y - tooltip.offsetHeight - 5;
	var left = mousePos.x - 5;

	//if(mousePos.x > window.innerWidth*0.75)
		//left -= tooltipWidth;

	// account for the edges of the screen, no need to do left
	var topClip = top - tooltipHeight - 5;
	var rightClip = left + tooltipWidth - window.innerWidth;

	if(rightClip > 0)
		left -= tooltipWidth - 5;

	if(topClip < 0)
		top += tooltipHeight*2 - 5;

	tooltip.style.left = left + 'px';
	tooltip.style.top =  top + 'px';
}



Ractive.decorators.tooltip =  function ( node, content ) {



	var tooltip, handlers, eventName;

	var start = function(event) {

		if(!content || content.length === 0)
			return;

		if(!tooltip)
		{
			tooltip = window.document.createElement('div');
			tooltip.className = 'ractive-tooltip';
			tooltip.innerHTML = content;
		}

		positionTooltip(event, node, tooltip);

		window.document.body.appendChild(tooltip);
	},

	move = function(event) {
		if(!tooltip) {
			start(event);
			return;
		}
		positionTooltip(event, node, tooltip);
	},

	end = function(event) {
		if(!tooltip || !tooltip.parentNode)
			return;

		tooltip.parentNode.removeChild(tooltip);
	};

	handlers = {
		mouseenter: start,
		touchstart: start,
		mousemove: move,
		touchmove: move,
		mouseleave: end,
		touchend: end
	};


	for(eventName in handlers) {
		if(handlers.hasOwnProperty(eventName)) {
			node.addEventListener(eventName, handlers[eventName], false);
		}
	}


	return {
		update: function(newContent) {

			content = newContent;

			if(tooltip)
				tooltip.innerHTML = content;

			if((!content || content.length === 0) && tooltip && tooltip.parentNode)
				tooltip.parentNode.removeChild(tooltip);
		},

		teardown: function() {

			if( tooltip && tooltip.parentNode ) {
				tooltip.parentNode.removeChild(tooltip);
				tooltip = null;
			}

			for(eventName in handlers) {
				if(handlers.hasOwnProperty(eventName)) {
					node.removeEventListener(eventName, handlers[eventName], false);
				}
			}

		}
	};
}

;
