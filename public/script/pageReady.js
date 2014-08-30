/**
 * Ready state for document to load api and other jQuery components
 */
var cart;
$(document).ready(function () {
  var
    // This tracks if the user is on a mobile browser
    isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),

    // Start the shoppingCart with all the options set
    cart = simpleCart({
      debug: true,
      checkout: {
        type: "Google" ,
        email: "thebelin@thebelin.com"
      },
      // array representing the format and columns of the cart, see 
      // the cart columns documentation
      cartColumns: [
        { attr: "quantity",  label: "Qty" },
        { attr: "name",      label: "Name" },
        { view: "decrement", label: false },
        { attr: "total",     label: "SubTotal", view: 'currency' },
        { view: "increment", label: false }
      ],

      // event callbacks 
      beforeAdd               : null,
      afterAdd                : function (data) {
        console.log('cart add', data);
      },
      load                    : function (data) {
        console.log('cart load', data);
      },
      beforeSave              : null,
      afterSave               : null,
      update                  : null,
      ready                   : function (data) {
        console.log('cart ready', data);
      },

      // Checkout events
      checkoutSuccess         : null,
      checkoutFail            : null,
      beforeCheckout          : null
    }),

  // Start the apiClient with all the options set that need to be configured
    pageClient = apiClient({
      pollInterval: 10000,
      localDataDom: 'ImaginaryEats',
      memoField:    'menuHash',
      mode:         'dev',
      apiUrl:       'https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec',
      devUrl:       'https://script.google.com/macros/s/AKfycbwqjwmqASwN0-g0p7dLx_fsqHVc2mpO-e3M00BY8oBB/dev',
      initButtons: function() {
        if (cart) { // && typeof cart.add === 'function') {
          console.log('initButtons');
          $('.addButton').off().on('click', function() {
            var item = $.extend(
              {},
              $(this).data(),
              {quantity: $(this).parent().children('.item_quantity').val()
            });
            console.log('item data', item);
            simpleCart.add(item);
          });
          //onclick = "simpleCart.add({name:'baby lion', price: 34.95,size:'tiny',thumb:'e.png'});"
        } else {
          console.log('no cart', cart);
        }
      },

      onRender: function () {

      }
    }),

    // This is a function for making the app design responsive
    resizer = function() {
      var zoomTo = 800;
        if (isMobile) {
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
