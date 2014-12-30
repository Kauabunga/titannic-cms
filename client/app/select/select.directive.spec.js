'use strict';

describe('Directive: select', function () {

  // load the directive's module and view
  beforeEach(module('titannicCmsApp'));
  beforeEach(module('app/select/select.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<select></select>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the select directive');
  }));
});