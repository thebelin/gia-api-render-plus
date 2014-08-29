$(document).ready(function () {
  // Start the apiClient with all the options set that need to be configured
  var
    pageClient = new apiClient({
      pollInterval: 10000,
      memoField: 'menuHash',
      mode: 'dev',
      apiUrl: 'https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec',
      devUrl: 'https://script.google.com/macros/s/AKfycbwqjwmqASwN0-g0p7dLx_fsqHVc2mpO-e3M00BY8oBB/dev'
    }),

    // Start the shoppingCart with all the options set
    cart = simpleCart({
      checkout: {
        type: "PayPal" ,
        email: "thebelin@thebelin.com"
      }
    }),

    // This is a function for making the app responsive
    resizer = function() {
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

  window.onresize = function () {
    resizer();
  }
  resizer();
});
