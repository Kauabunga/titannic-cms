'use strict';

describe('Controller: EditschemaCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var EditschemaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditschemaCtrl = $controller('EditschemaCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
