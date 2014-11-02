/**
 * Ready state for document to load api and other jQuery components
 * 
 * note that animations in this page require velocity.js library
 */
$(document).ready(function () {
  var
    // This can be set to false to disable debugging
    debug = '#pageReady -- ',

    // This tracks if the user is on a mobile browser
    isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),

    // The event to track to determine click state
    btnEvent = isMobile ? 'touchstart' : 'click',

    // The current display mode (list or grid)
    displayMode = 'list',

    // Use whatever function to display a modal
    showModal = function (modalContents, onClose) {
      // In this case, we're using a sliding drawer
      
      // put the contents in the drawer
      // If the content is a jQuery selector, append that DOM item to the drawer contents
      if ($(modalContents).length) {
        $('.drawerContents').empty().append($(modalContents)).show();
      } else {
        $('.drawerContents').html(modalContents).show();
      }

      // Fade the page
      $('#contentOverlay').show().velocity({opacity:1}, 500);

      // Slide the drawer
      $('.drawer').velocity({height: window.innerHeight * 0.99}, {
        duration: 800,
        easing:   'easeInOutQuint',
        complete: function() {
          // show the exit button and make it function
          $('.exitDrawer').off().on(btnEvent, function() {
            $('.exitDrawer').hide(300);
            $('#contentOverlay').velocity({opacity:0}, 300).hide();
            $('.drawer').velocity({height: '4em'}, 300);
            if (onClose && typeof onClose === 'function') {
              onClose.call(this);
            }
          }).show(500);
        }
      });
    },

    /**
     * Support the selection of a type of payment according to what
     * payment button is clicked
     *
     * @param String buttonDom A reference to the button clicked upon
     * 
     * @return void
     */
    selectPayment = function (buttonDom) {
      // Different payment mechanisms mean setting different attributes
      // use the ones directly provided by the data attribute of the button
      var cartOptions = {
        checkout: $.extend(
          {},
          $(buttonDom).data(),
          {merchantID: $(buttonDom).data('merchantid')}
        )
      };
      debug && console.log(debug + 'doing payment system: cartOptions', cartOptions);
      simpleCart(cartOptions);
      simpleCart.checkout();
    },

    /**
     * Render a social interaction page
     * 
     * @param String system The identifier for the social site
     * 
     * @return void
     *
     * @todo This method needs additional handlers for other social tabs
     * @todo Find a social integration js module and use that for social tabs
     */
    getSocial = function (system) {
      debug && console.log(debug + 'render social:', system);
      // Based on the system, do whatever the window calls for
      switch (system) {
        case 'facebook':
          return $(".facebook.socialModule").html()
          break;
      }
    },

    // This is a function for making the app design responsive to the host system
    resizer = function() {
      var zoomTo = 800;
        if (isMobile) {
          zoomTo = 400;
        }

      // format for landscape display
      var fontObj = {'font-size': Math.floor((window.innerHeight / zoomTo) * 100) / 100 + 'em'};
      if (window.innerHeight > window.innerWidth) {
        // Portrait display
        fontObj = {'font-size': Math.floor((window.innerWidth / zoomTo) * 100) / 100 + 'em'};
      }
      $('body').css(fontObj);
      $(document.getElementById('content')).innerHeight(window.innerHeight * .9);
    };

  window.onscroll = function () {
    window.scrollTo(0, 0);
  }

  window.onresize = function () {
    resizer();
  }

  /**
   * Start the apiClient with all the options set that need to be configured
   * Create a GIA instance 
   * this is a data source interpreter
   */
  apiClient({
    pollInterval: 10000,
    localDataDom: 'ImaginaryEats',
    memoField:    'menuHash',
    mode:         'live',
    apiUrl:       'https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec',
    devUrl:       'https://script.google.com/macros/s/AKfycbwqjwmqASwN0-g0p7dLx_fsqHVc2mpO-e3M00BY8oBB/dev',

    // Callback function for apiClient button init which executes after render
    initButtons: function() {
      // Init the social buttons
      $('.socialButton').off().on(btnEvent, function () {
        $('.socialButton').removeClass('socialSelected');
        $(this).addClass('socialSelected');
        showModal(getSocial($(this).data('system')), function() {
          $('.socialButton').removeClass('socialSelected');
        });
      });

      // Init the close details button
      $('.closeDetails').off().on(btnEvent, function () {
        $('.details').hide(300);
        $('.mapLink').show(500);
        $('.mapLink').off().on(btnEvent, function () {
          $('.details').show(300);
          $('.mapLink').hide();
        });
      });

      if (simpleCart && typeof simpleCart.add === 'function') {
        // Attach the add button event to adding the item to the cart
        $('.addButton').off().on(btnEvent, function () {
          simpleCart.add($.extend({}, $(this).data(), {quantity: 1}));
        });

      } else {
        // There was no cart to attach to
        debug && console.log(debug + 'no cart', simpleCart);
      }

      // Init the payment options buttons
      $('.paymentOption').off().on(btnEvent, function () {
        selectPayment(this);
        simpleCart.checkout();
      });

      // init the list format buttons
      $('.cartFormat[data-view="list"]').off().on(btnEvent, function () {
        displayMode = 'list';
        $('.menuItem').removeClass('menuItemGrid').addClass('menuItemList');
        $(this).hide(200, function () {
          $('.cartFormat[data-view="grid"]').show(500);
        });
      });
      $('.cartFormat[data-view="grid"]').off().on(btnEvent, function () {
        displayMode = 'grid';
        $('.menuItem').removeClass('menuItemList').addClass('menuItemGrid');
        $(this).hide(200, function () {
          $('.cartFormat[data-view="list"]').show(500);
        });
      });

      /**
       * Init for item option selection
       * This is a generic way to keep track of item options, attaching them to the add button
       * on the interface as data elements.  When any item is added to the basket, the data values
       * attached to the add button are passed to the item specification.
       */
      // Mobile select handler
      $('.selectOption').off().on('touchstart', function () {
        $(this).toggleClass('selectOptionOpen');
      });
      // Desktop select handler
      $('.selectOption').hover(
        function () {
          $(this).toggleClass('selectOptionOpen');
        }
      );

      $('.optionValue').off().on(btnEvent, function () {
        // Only proceed if the options list is open to being selected from
        if (!$(this).parent().hasClass('selectOptionOpen')) {
          console.log('select Not open');
          return;
        }
        // note that "this" now refers to the element which was interacted with
        // The current option name
        var thisOption = $(this).data('option'),
          optionText = '',
        // Build the optionObject data object
          optionObject = $(this).parent().parent().parent().data();
          
        // Set the optionObject data key for this option to the value selected
        optionObject[thisOption] = $(this).data('value');

        debug && console.log('optionObject', $(this).parent().parent().parent(), JSON.stringify(optionObject));
        

        // Set the name key of the add Button data to include the selected options
        // If the item is added to the cart, it will have this name in the cart
        for (var dataKey in optionObject) {
          if (!(dataKey in {name:1,limit:1,description:1,price:1,quantity:1,preview:1,options:1})) {
            debug && console.log(dataKey);
            optionText += ' ' + optionObject[dataKey];
          }
        }
        optionObject['options'] = optionText;

        // Remove the selection class from ALL elements
        $(this).parent().data('value', thisOption)
          .children().removeClass('selectedOption');

        // Add selection class to selected element
        $(this).addClass('selectedOption');

        // Cause the parent to scroll to the top of the list so the selected item is shown
        // Scroll functions don't return the parent reference, so break the jQuery chain
        $(this).parent().scrollTop(0);

        // Move the selected item to the top of this list
        $(this).parent().prepend($(this));

        // Set the option data value for this option on the parent element's add button
        $(this).parent().parent().parent().children('.addButton').data(optionObject);
      });
    },

    // Callback function for apiClient events which executes after render
    onRender: function(data) {
      debug && console.log(debug + 'onRender', data);
      // A holder for the timer's reference
      var previewTimer = null,

      // Number the number of ms the preview should be active
      previewTimeout = 5000,

      // A function to hide the preview
      hidePreview = function (callback) {
        $('#previewOverlay, #preview').finish();
        $('#previewOverlay').velocity({opacity: 1}, 200, function () {
          // change the preview to no image
          $('#preview').css({opacity: 0, background: ''});
          
          // reveal the background
          $('#previewOverlay').velocity({opacity: 0}, 200, function(){
            if (typeof callback === 'function') {
              callback.call();
            }
          });
        });
      },

      /**
       * The preview fades in an Overlay,
       * then replaces the image in the preview area
       * then fades out the overlay
       * 
       * @param String   previewImg The url for the preview image
       * @param Function callback   A function to call when the preview completes
       */
      doPreview = function (previewImg, callback) {
        if ($('#preview').css('background').indexOf(previewImg) === -1) {
          // clear the timeout and set it again
          if (previewTimeout && previewTimer) {
            // finish all existing animation sequences
            $('#previewOverlay').finish().css({opacity:1});
            clearTimeout(previewTimer);
          }
          previewTimer = setTimeout( function () {
            previewTimer = null;
            hidePreview();
          }, previewTimeout);
          
          // cover the existing preview by making the mask opacity 1
          $('#previewOverlay').velocity({opacity: 1}, 200, function () {
            // change the preview to the new image source from the data element
            $('#preview').css({opacity: 1, 'background-image': 'url("' + previewImg + '")'});
            
            // display the preview
            $('#previewOverlay').velocity({opacity: 0}, 200, function(){
              if (typeof callback === 'function') {
                callback.call();
              }
            });
          });
        }
      };

      // Attach a preview to the items with preview image data
      $('.itemThumb,.itemName').off().on(btnEvent, function () {
        // Show the selected item in list view
        $('.menuItem').removeClass('menuItemList');
        if (displayMode === 'list') {
          // Already in list mode
        } else {
          // Re-apply grid mode to the previously listed item
          $('.menuItem').addClass('menuItemGrid');
          // Open the selected item back into list mode
          $(this).parent().removeClass('menuItemGrid').addClass('menuItemList');
        }
        // This shows the main image in the background
        doPreview($(this).parent().data('preview'));
      });

      // Do the resizer when the render runs
      resizer();
    }
  });

  // Start the shoppingCart with all the options set
  simpleCart({
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
      { attr: "options",   label: "Options" },
      { view: "decrement", label: false },
      { attr: "total",     label: "SubTotal", view: 'currency' },
      { view: "increment", label: false }
    ],

    // event callbacks 
    beforeAdd               : null,
    afterAdd                : null,
    load                    : null,
    beforeSave              : null,
    afterSave               : null,
    update                  : null,
    ready                   : null,

    // Checkout events
    checkoutSuccess         : null,
    checkoutFail            : null,
    beforeCheckout          : null
  });

  // Firt time through, run the resizer
  resizer();
});
