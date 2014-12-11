'use strict';

describe('Controller: EditdocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var EditdocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditdocumentCtrl = $controller('EditdocumentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
