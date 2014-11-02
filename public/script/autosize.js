// Change the font size depending on the target device
$(document).ready(function() {
	var resizer = function() {
		var zoomTo = 800;
	    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
	    	// Double size of objects on mobile
	    	zoomTo = 400;
	    }

		// format for landscape display
		var fontObj = {'font-size': Math.floor((window.innerHeight / zoomTo) * 100) / 100 + 'em'};
		if (window.innerHeight > window.innerWidth) {
			// Portrait display
			fontObj = {'font-size': Math.floor((window.innerWidth / zoomTo) * 100) / 100 + 'em'};
		}
		$('body').css(fontObj);
	};
	// Attach the window resize event to the resizer process
	window.onresize = function(){resizer();};
	// Run the resizer
	resizer();
});
