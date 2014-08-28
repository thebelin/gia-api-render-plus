// Change the font size depending on the target device
$(document).ready(function() {
	var resizer = function() {
		var zoomTo = 800;
	    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
	    	zoomTo = 600;
	    }

		// format for landscape display
		var fontObj = {'font-size': Math.floor((window.innerHeight / zoomTo) * 100) / 100 + 'em'};
		if (window.innerHeight > window.innerWidth) {
			// Portrait display
			fontObj = {'font-size': Math.floor((window.innerWidth / zoomTo) * 100) / 100 + 'em'};
		}
		$('body').css(fontObj);
	};
	window.onresize= function(){resizer();};
	resizer();
});
