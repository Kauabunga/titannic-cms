'use strict';

describe('Directive: jsonEditor', function () {

  // load the directive's module and view
  beforeEach(module('titannicCmsApp'));
  beforeEach(module('app/jsonEditor/jsonEditor.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<json-editor></json-editor>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the jsonEditor directive');
  }));
});