/**
 * Ready state for document to load api and other jQuery components
 */
var cart;
$(document).ready(function () {
  var
    // This tracks if the user is on a mobile browser
    isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),

    // The event to track to determine click state
    btnEvent = isMobile ? 'touchstart' : 'click',

    // Use whatever function to display a modal
    showModal = function (modalContents, onClose) {
      // In this case, we're using a sliding drawer
      
      // put the contents in the drawer
      $('.drawerContents').html(modalContents).show();

      // Fade the page
      $('#contentOverlay').show().velocity({opacity:1}, 500);

      // Slide the drawer
      $('.drawer').velocity({height: window.innerHeight * 0.99}, {
        duration: 500,
        easing:   'slideUpIn',
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
     * Render a social interaction page
     * 
     * @param String system The identifier for the social site
     * 
     * @return void
     */
    getSocial = function (system) {
      console.log('render social:', system);
      // Based on the system, do whatever the window calls for
      switch (system) {
        case 'facebook':
          return $(".facebook.socialModule").html()
          break;
      }

    },

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
    }),

  // Start the apiClient with all the options set that need to be configured
    pageClient = apiClient({
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
          $('.addButton').off().on(btnEvent, function() {
            simpleCart.add($.extend({}, $(this).data(), {quantity: 1}));
          });

          // attach the add button click to the thumbnail
          $('.itemThumb').off().on(btnEvent, function() {
            console.log($(this).parent());
            $(this).parent().parent().children('.addButton').trigger(btnEvent);
          });
        } else {
          // There was no cart to attach to
          console.log('no cart', simpleCart);
        }
      },

      // Callback function for apiClient events which executes after render
      onRender: function() {
        // A holder for the timer's reference
        var previewTimer = null,

        // Number the number of ms the preview should be active
        previewTimeout = 5000,

        // A function to hide the preview
        hidePreview = function (callback) {
          $('#previewOverlay').finish();
          $('#preview').stop(true);
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
         * And one to do the preview
         * @param String previewImg the url for the preview image
         * 
         * @return void
         */
        doPreview = function (previewImg, callback) {
          if ($('#preview').css('background').indexOf(previewImg) === -1) {
            // clear the timeout and set it again
            if (previewTimer) {
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
          } else {
            // console.log($('#preview').css('background-image').indexOf(previewImg),$('#preview').css('background-image'), previewImg);
          }
        };

        // Attach a preview to the items with preview image data
        $('.menuItem[data-preview]').off().on('mouseover', function () {
          doPreview($(this).data('preview'));
        }).on(btnEvent, function () {
          // Also attach to the interaction event
          doPreview($(this).data('preview'));
        });

        // Do the resizer when the render runs
        resizer();
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
      $(document.getElementById('content')).innerHeight(window.innerHeight * .9);
    };

  window.onscroll = function () {
    window.scrollTo(0, 0);
  }

  window.onresize = function () {
    resizer();
  }
  resizer();
});
