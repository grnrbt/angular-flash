describe('flashMessages', function() {
  var elem, scope, flash;

  beforeEach(module('ngFlash'));

  beforeEach(inject(function($rootScope, $compile, $flash) {
    elem = angular.element('<div flash-messages></div>');
    scope = $rootScope.$new();

    $compile(elem)(scope);
    scope.$digest();

    flash = function() {
      $flash.apply($flash, arguments);
      scope.$digest();
    };
  }));

  it('is empty by default', function() {
    expect(elem).to.be.empty;
  });

  it('displays flash messages when added', function() {
    flash('Hello World');

    expect(elem.find('.alert')).to.have.text('Hello World');
  });

  it('hides the flash messages', inject(function($timeout) {
    flash('Hello World');
    $timeout.flush();

    expect(elem.find('.alert')).to.not.exist;
  }));

  it('adds the appropriate class', function() {
    flash('Hello World', { type: 'info' });
    expect(elem.find('.info')).to.exist;
  });

  it('sanitizes the input', function() {
    flash('<p>Test <script src="malicious.js"/></p>');
    expect(elem.find('.flash-content')).to.have.html('<p>Test </p>');
  });

  describe('scoped flash messages', function() {
    var scopedElem, innerScope;

    beforeEach(inject(function($compile) {
      scopedElem = angular.element('<div flash-messages></div>');
      innerScope = scope.$new();
      $compile(scopedElem)(innerScope);
    }));

    it('scopes the flash messages', function() {
      flash('Scoped flash message', {scope: innerScope});

      expect(elem).to.be.empty;
      expect(scopedElem.find('.alert')).to.have.text('Scoped flash message');
    });

    it('handles multiple messages', function() {
      flash('First Scoped message.', {scope: innerScope});
      flash('Second Scoped message.', {scope: innerScope});

      expect(scopedElem.find('.alert')).to.have.text('First Scoped message.Second Scoped message.');
    });

    it('overrides global messages with scoped messages', function() {
      flash('Global flash message');

      expect(elem.find('.alert')).to.have.text('Global flash message');
      expect(scopedElem.find('.alert')).to.have.text('Global flash message');

      flash('Scoped flash message', {scope: innerScope});

      expect(elem.find('.alert')).to.have.text('Global flash message');
      expect(scopedElem.find('.alert')).to.have.text('Scoped flash message');
    });

    it('shows global messages when there are no more scoped messages', inject(function($timeout) {
      flash('Scoped flash message', {scope: innerScope});
      $timeout.flush();
      flash('Global flash message');

      expect(elem.find('.alert')).to.have.text('Global flash message');
      expect(scopedElem.find('.alert')).to.have.text('Global flash message');
    }));
  });
});
