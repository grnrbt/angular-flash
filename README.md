## Angular Flash

[![Build Status](https://travis-ci.org/remind101/angular-flash.png?branch=master)](https://travis-ci.org/remind101/angular-flash)

Dead simple flash messages for angular.

**[Demo](http://remind101.github.com/angular-flash)**

### Installation

1. Install with bower.
2. Include the `ngFlash` module:

   ```javascript
   angular.module('app', ['ng', 'ngFlash']);
   ```
3. Add the `flashMessages` directive to your html where you want flash messages
   to appear:

   ```html
   <div flash-messages></div>
   ```

### Usage

The `ngFlash` module exposes a `$flash` service to display flash messages. Here's some
examples:

Simple flash message

```javascript
$flash('Hello World');
```

Flash message with a custom type

```javascript
$flash('Hello World', { type: 'info' });
```

Flash message that persists across a route change

```javascript
$flash('Hello World', { persist: 1 });
```

Flash message with a custom duration

```javascript
$flash('Hello World', { duration: 10000 });
```

Flash message only within the current scope

```javascript
$flash('Hello World', { scope: $scope });
```

### Configuration

**routeChangeSuccess**

Flash messages will, by default, disappear after the user navigates
(`$routeChangeSuccess`). If you're using angular-ui-router, then you should set
the event to `$stateChangeSuccess`:

```javascript
app.config(function($flashProvider) {
  $flashProvider.setRouteChangeSuccess('$stateChangeSuccess');
});
```

**Template**

You can change the template for the `flashMessages` directive by inserting a
custom template into templateCache:

```javascript
app.run(function($templateCache) {
  $templateCache.put('template/flash-messages.html', '<your template>');
});
```

### Animations

ngFlash is fully compatible with ngAnimate, all you need to do is use the
`.ng-enter` and `.ng-leave` classes.

**Example**

```css
.flash-message.ng-enter {
  animation-name: fadeIn;
  animation-duration: 1s;
}

.flash-message.ng-leave {
  animation-name: fadeOut;
  animation-duration: 1s;
}
```
