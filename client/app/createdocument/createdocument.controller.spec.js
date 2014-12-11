'use strict';

describe('Controller: CreatedocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var CreatedocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreatedocumentCtrl = $controller('CreatedocumentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
