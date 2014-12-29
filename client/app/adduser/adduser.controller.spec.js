'use strict';

describe('Controller: AdduserCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var AdduserCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdduserCtrl = $controller('AdduserCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
