'use strict';

describe('Controller: CreateschemaCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var CreateschemaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreateschemaCtrl = $controller('CreateschemaCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
