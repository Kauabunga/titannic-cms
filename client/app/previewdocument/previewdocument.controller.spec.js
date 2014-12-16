'use strict';

describe('Controller: PreviewdocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('titannicCmsApp'));

  var PreviewdocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PreviewdocumentCtrl = $controller('PreviewdocumentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
