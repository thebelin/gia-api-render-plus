/**
 * A generic API client for accessing a querystring driven API
 * Part of an example set of scripts developed by
 * 
 * @author Belin Fieldson <thebelin@gmail.com>
 * @copyright  Are you kidding?
 *
 * @param Object options The key value set of options used to set the parameters
 * @return void
 */
var apiClient = function(options) {
  if (!this instanceof apiClient) {
    return new apiClient(options);
  }
  // @type Object self reference for external callback
  var self = this,

  // @type String/Boolean Set to false to disable debug, change to a string to identify
    debug        = options.debug        || "#apiClient.js -- ",

  // @type string live mode or dev mode
    mode         = options.mode         || 'dev',

  // @type String The event to attach to, this is commonly used in button logic
    eName        = options.eName        || 'click',

  // @type String The jQuery selector for buttons on the page
    buttonSel    = options.buttonSel    || '.button',

  // @type String The DOM element which will hold the render output
    containerDiv = options.containerDiv || '#content',

  // @type String The primary render template target div id
    renderTarget = options.renderTarget || '#primary',

  // @type String The url to hit for API access (include first querystring to force compatibility)
    apiUrl       = (options.apiUrl      || "") + '?z=1',
    devUrl       = (options.devUrl      || "") + '?z=1',

  // @type String The api memo field to watch for changes
    memoField    = options.memoField    || 'memo',

  // @type String The domain for the local storage items kept for this client
    localDataDom = options.localDataDom || 'localStorageDom',

  // @type Number polling interval
    pollInterval = options.pollInterval  || 0,

  // @type String The last memo retrieved from the api
    memo = '',

  // @type Function Get the current url based on the configuration of the object
    getUrl = function () {
      return mode === 'dev' ? devUrl : apiUrl;
    },

  // @type Function Init the buttons on the page with anything the init configuration wants
    initButtons = function (data) {
      if (typeof options.initButtons === 'function') {
        options.initButtons.call(data);
      } else {
        // Do a default init procedure on all the buttons
        // this will cause them to call the getData routine and post all data attributes
        $(buttonSel).off().on(eName, function () {
          getData($(this).data);
        });
      }
    },

  // @type Function Render the data on the page's primary template
    render = function (data) {
      debug && console.log(debug + 'Render data', data);

      $(containerDiv).html($.templates(renderTarget).render(data));

      // Pass the data on to the init buttons routine also
      initButtons(data);
    },

  // @type Function Get the current api data set and render it on the page
  //                This is an async call since nothing is specified for the method
    poll = function (params) {
      $.ajax({
        // Get the API URL
        url: getUrl(),

        // Add the memo as it stands to the api access parameters
        // Also, default to an "a"ction querystring value of poll
        // Add any querystring params specified in the getData event
        data: $.extend({memo: memo, action: 'poll'}, params),

        // jsonp parameters
        dataType: 'jsonp',
        jsonp: 'prefix'
      }).done(function (data) {
        // Set the local memo if it has been supplied
        if (data[memoField]) {
          debug && console.log(debug + 'memo update', data[memoField]);
          memo = data[memoField];

          // Store the data locally
          localStorage.setItem(localDataDom + '_data', JSON.stringify(data));

          // Render the data to the page's jsRender template render system
          render(data);
        } else {
          // There was no update and nothing needs to be done.
        }

      });

      // If there's a polling interval, poll for updates at that interval
      if (pollInterval) {
        window.setTimeout(
          function () {
            poll.call(self, params);
          },
          pollInterval
        );
      }
    },

  // A safe JSON parse routine
    safeParse = function (parseData) {
      try {
        return JSON.parse(parseData);
      } catch(e) {
        return parseData;
      }
    },

  // A default init function to run
    init = function (params) {
      // If there's data stored in the localstorage, render it to the page
      render(safeParse(localStorage.getItem(localDataDom + '_data')));

      // And get the new data
      poll(params);
    };

  // Get the local event Name 
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
    eName = 'touchstart';
  }
  // If an init was sent into the apiClient in the options, call it
  if (typeof options.init === 'function') {
    options.init.call(options);
  } else {
    init(options.initParams || {});
  }
}

$(document).ready(function () {
  // Start the apiClient with all the options set that need to be configured
  var pageClient = new apiClient({
    pollInterval: 10000,
    memoField: 'menuHash',
    mode: 'dev',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec',
    devUrl: 'https://script.google.com/macros/s/AKfycbwqjwmqASwN0-g0p7dLx_fsqHVc2mpO-e3M00BY8oBB/dev'
  });
})