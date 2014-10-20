describe('$flash', function() {
  var messages;

  beforeEach(module('ngFlash'));

  beforeEach(inject(function($rootScope) {
    messages = function(scope) {
      scope = scope || $rootScope;
      return scope._flash.messages;
    }
  }));

  it('adds messages', inject(function($flash) {
    $flash('Hello World');

    expect(messages()[0].message).to.eq('Hello World');
  }));

  it('removes messages after the timeout', inject(function($flash, $timeout) {
    $flash('Hello World');

    $timeout.flush(5001);
    expect(messages()).to.be.empty;
  }));

  it('allows a custom duration to be specified', inject(function($flash, $timeout) {
    $flash('Hello World', { duration: 1000 });

    $timeout.flush(999);
    expect(messages().length).to.eq(1);

    $timeout.flush(1);
    expect(messages()).to.be.empty;
  }));

  it('cancels the timeout when the message is added twice', inject(function($flash, $timeout) {
    var message = 'Hello World';

    $flash(message);
    $timeout.flush(2500);
    expect(messages().length).to.eq(1);

    $flash(message);
    $timeout.flush(2501);
    expect(messages().length).to.eq(1);

    expect(messages()).to.not.be.empty;

    $timeout.flush(2500);
    expect(messages()).to.be.empty;
  }));

  it('removes the flash message on route change events', inject(function($rootScope, $flash) {
    $flash('Hello World');

    $rootScope.$emit('$routeChangeSuccess');

    expect(messages()).to.be.empty;
  }));

  it('allows messages to persist across route change events', inject(function($rootScope, $flash, $timeout) {
    $flash('Hello World', { persist: 1 });

    $rootScope.$emit('$routeChangeSuccess');
    expect(messages().length).to.eq(1);

    $rootScope.$emit('$routeChangeSuccess');
    expect(messages()).to.be.empty;
  }));

  it('scopes the messages', inject(function($flash, $timeout, $rootScope) {
    var innerScope = $rootScope.$new();
    $flash('Global');
    $flash('Scoped', { scope: innerScope, duration: 10000 });

    expect(messages()[0].message).to.eq("Global");
    expect(messages(innerScope)[0].message).to.eq("Scoped");

    $timeout.flush(5001);

    expect(messages()).to.be.empty;
    expect(messages(innerScope).length).to.eq(1);

    $timeout.flush(5001);
    expect(messages(innerScope).length).to.be.empty;
  }));

  it('does not reset scope when adding a duplicate message', inject(function($flash, $timeout, $rootScope) {
    var innerScope = $rootScope.$new();
    $flash('Scoped', { scope: innerScope });
    $flash('Scoped', { scope: innerScope, duration: 100 });

    expect(messages(innerScope)[0].message).to.eq("Scoped");
    expect(messages(innerScope)[0].scope).to.eq(innerScope);

    // Default timeout was overridden and local scope was reset
    $timeout.flush(101);
    expect(innerScope._flash).to.be.undefined;
  }));

  describe('FlashMessage', function() {
    var flashMessage;

    beforeEach(inject(function($flash) {
      flashMessage = $flash('Hello World');
    }));

    describe('#remove', function() {
      it('removes the message', inject(function($flash) {
        flashMessage.remove();

        expect(messages()).to.be.empty;
      }));
    });
  });

  describe('.reset', function() {
    it('resets the messages', inject(function($flash) {
      $flash('Hello World');

      $flash.reset();
      expect(messages()).to.be.empty;
    }));

    it('resets scoped messages', inject(function($flash, $rootScope) {
      var innerScope = $rootScope.$new();
      $flash('Hello World');
      $flash('Scoped Hello World', { scope: innerScope });

      $flash.reset();
      expect(messages()).to.be.empty;
      expect(messages(innerScope).length).to.eq(1);

      $flash.reset(innerScope);
      expect(messages(innerScope).length).to.be.empty;
    }));
  });
});
