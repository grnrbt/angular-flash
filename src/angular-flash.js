(function(angular) {
  'use strict';

  var bind = function(fn, context) {
    return function() {
      return fn.apply(context, arguments);
    };
  };

  var templateUrl = 'template/flash-messages.html';

  var module = angular.module('ngFlash', ['ng', 'ngSanitize']);

  module.provider('$flash', function() {
    // How long to wait before removing the flash message.
    var defaultDuration = 5000;
    this.setDefaultDuration = function(duration) {
      defaultDuration = duration;
    };

    // The type of message.
    var defaultType = 'alert';
    this.setDefaultType = function(type) {
      defaultType = type;
    };

    // Flash messages will not persist across route change events unless
    // explicitly specified.
    var routeChangeSuccess = '$routeChangeSuccess';
    this.setRouteChangeSuccess = function(event) {
      routeChangeSuccess = event;
    };

    this.$get = function($rootScope, $timeout) {
      var flash;

      var rootScope = $rootScope;

      /**
       * Flash that represents a flash message.
       */
      function FlashMessage(message, options) {
        options = options || {};

        this.message  = message;
        this.duration = options.duration || defaultDuration;
        this.type     = options.type || defaultType;
        this.persist  = options.persist;
        this.unique   = true;
        this.scope    = options.scope || rootScope;

        if (!this.scope.hasOwnProperty('_flash')) {
          this.scope._flash = { messages: [] };
        }
      }

      FlashMessage.prototype.messages = function() {
        return this.scope._flash.messages;
      };

      FlashMessage.prototype.findExisting = function(message) {
        var found;

        angular.forEach(this.messages(), function(flashMessage) {
          if (flashMessage.message === message) {
            found = flashMessage;
          }
        });

        return found;
      };

      /**
       * Init and add this flash message.
       */
      FlashMessage.prototype.add = function() {
        var existing = this.findExisting(this.message);

        if (existing) {
          existing.remove();
        }

        this.messages().push(this.init());

        return this;
      };

      /**
       * Remove this flash message.
       */
      FlashMessage.prototype.remove = function() {
        this.cancelTimeout();
        this.messages().splice(this.messages().indexOf(this), 1);

        // If there are no more scoped messages, fall back to the higher scope
        if (this.scope != rootScope && this.messages().length == 0) {
          delete this.scope._flash;
        }
      };

      /**
       * Starts the timeout to remove this message. Cancels the existing
       * timeout if it's present.
       */
      FlashMessage.prototype.startTimeout = function() {
        this.cancelTimeout();
        this.timeout = $timeout(bind(this.remove, this), this.duration);
        return this.timeout;
      };

      /**
       * Cancel a previous timeout.
       */
      FlashMessage.prototype.cancelTimeout = function() {
        if (this.timeout) {
          $timeout.cancel(this.timeout);
        }
      };

      /**
       * Initialize timeouts.
       */
      FlashMessage.prototype.init = function() {
        var remove = bind(this.remove, this);

        this.startTimeout();

        // Remove the flash message when the user navigates.
        if (this.persist) {
          var _this = this;

          /**
           * Only runs `func` after the function has been executed `times` times. Each time that `func` is not run,
           * it will restart the timeout to remove this message.
           *
           * See
           * https://github.com/jashkenas/underscore/blob/2c709d72c89a1ae9e06c56fc256c14435bfa7893/underscore.js#L770
           */
          var after = function(times, func) {
            return function() {
              if (--times < 1) {
                return func.apply(this, arguments);
              } else {
                _this.startTimeout();
              }
            };
          };

          $rootScope.$on(routeChangeSuccess, after(this.persist + 1, remove));
        } else {
          $rootScope.$on(routeChangeSuccess, remove);
        }

        return this;
      };

      /**
       * Add a flash message.
       *
       * @param {String} message - The flash message to display.
       *
       * @return {Object} The flash message that was added.
       */
      flash = function(message, options) {
        return new FlashMessage(message, options).add();
      };

      /**
       * Reset the flash messages
       */
      flash.reset = function(scope) {
        scope = scope || rootScope;
        scope._flash.messages.length = 0;
      };

      return flash;
    };
  });

  module.directive('flashMessages', function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: templateUrl
    };
  });

  module.run(function($templateCache) {
    if (!$templateCache.get(templateUrl)) {
      $templateCache.put(templateUrl,
        '<div class="flash-messages">' +
          '<div class="flash-message {{message.type}}" ng-repeat="message in _flash.messages">' +
            '<a href="" class="close" ng-click="message.remove()"></a>' +
            '<span class="flash-content" ng-bind-html="message.message"></span>' +
          '</div>' +
        '</div>');
    }
  });

})(angular);
