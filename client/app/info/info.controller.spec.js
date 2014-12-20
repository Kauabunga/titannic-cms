'use strict';

describe('Controller: InfoCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var InfoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InfoCtrl = $controller('InfoCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
