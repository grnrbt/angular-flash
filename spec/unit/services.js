describe('$flash', function() {
  var clock, messages;

  beforeEach(module('ngFlash'));

  beforeEach(inject(function($rootScope) {
    messages = function() {
      return $rootScope._flash.messages;
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
  });
});
