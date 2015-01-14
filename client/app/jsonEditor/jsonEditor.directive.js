/* global JSONEditor */
/* jshint camelcase: false */

(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .directive('jsonEditor', function ($log, $q, Document, $timeout, Notification, $stateParams, $rootScope, $location) {
      return {
        templateUrl: 'app/jsonEditor/jsonEditor.html',
        restrict: 'EAC',
        scope: {
          'editorDirty': '=?',
          'editorDocument': '=',
          'editorDocumentDeferred': '=',
          'editorDocumentContent': '=',
          'editorDisableAdd': '@?',
          'editorReadOnly': '@?',
          'editorToggleOptions': '=?',
          'editorReset': '=?'
        },
        link: function (scope, element, attrs) {

          $log.debug('Directive jsonEditor link');

          /*
           ajax	//If true, JSON Editor will load external URLs in $ref via ajax.	false
           disable_array_add	//If true, remove all "add row" buttons from arrays.	false
           disable_array_delete	//If true, remove all "delete row" buttons from arrays.	false
           disable_array_reorder	//If true, remove all "move up" and "move down" buttons from arrays.	false
           disable_collapse	//If true, remove all collapse buttons from objects and arrays.	false
           disable_edit_json	//If true, remove all Edit JSON buttons from objects.	false
           disable_properties	//If true, remove all Edit Properties buttons from objects.	false
           form_name_root	//The first part of the `name` attribute of form inputs in the editor. An full example name is `root[person][name]` where "root" is the form_name_root.	root
           iconlib	//The icon library to use for the editor. See the CSS Integration section below for more info.	null
           no_additional_properties	//If true, objects can only contain properties defined with the properties keyword.	false
           refs	//An object containing schema definitions for URLs. Allows you to pre-define external schemas.	{}
           required_by_default	//If true, all schemas that don't explicitly set the required property will be required.	false
           schema //A valid JSON Schema to use for the editor. Version 3 and Version 4 of the draft specification are supported.	{}
           show_errors	//When to show validation errors in the UI. Valid values are interaction, change, always, and never.	"interaction"
           startval	//Seed the editor with an initial value. This should be valid against the editor's schema.	null
           template	//The JS template engine to use. See the Templates and Variables section below for more info.	default
           theme	//The CSS theme to use. See the CSS Integration section below for more info.	html
           */

          var editor;
          var $textareaResizeElements;
          var $changedElements = [];

          scope.editorValid = true;
          scope.optionsEnabled = false;

          scope.editorLoaded = false;
          scope.editorDirty = false;
          scope.editorDisableAdd = (scope.editorDisableAdd === 'true' || scope.editorDisableAdd === true) ? true : false;
          scope.editorReadOnly = (scope.editorReadOnly === 'true' || scope.editorReadOnly === true) ? true : false;





          $log.debug(scope.editorEnableAdd);


          scope.editorDocument = scope.editorDocument || undefined;
          scope.editorDocumentDeferred = scope.editorDocumentDeferred || undefined;


          /**
           *
           */
          (function init() {

            var initDocument = _.once(function(){

              scope.editorDocumentDeferred.finally(function(){
                $timeout(function(){
                  scope.editorLoaded = true;
                }, 50);

              });
              scope.editorDocumentDeferred.then(
                function success(document) {

                  $timeout(function(){
                    var jsonEditorOptions = getEditorOptions();

                    $timeout(function () {
                      editor = newEditor(jsonEditorOptions);

                      //TODO eeeek?
                      $timeout(function(){
                        scope.editorDirty = false;
                      });

                    });
                  });

                },
                function error(statusCode) {
                  $log.error('Editor failed to get document', statusCode);
                });
            });

            //need to wait for our fadeIn animation on the main editcontroller
            scope.$watch('editorDocumentDeferred', function(){
              if(scope.editorDocumentDeferred){
                initDocument();
              }

            });



          })();




          /**
           *
           */
          scope.resetJson = scope.editorReset = function () {


            function yesCallback() {
              $log.debug('yes callback for reset');

              Notification.success('Content reset');
              scope.$apply(function () {

                editor.setValue(scope.editorDocument.contentOriginal);

                $timeout(function(){
                  cleanEditorDirty();
                });

                scope.resetingJson = false;
              });
            }

            function noCallback() {
              scope.resetingJson = false;
              $log.debug('no callback for reset');
            }

            if( ! scope.resetingJson){
              scope.resetingJson = true;
              Notification.confirmation('Ready to reset your document?', yesCallback, noCallback, {yesText: 'Reset'});
            }

          };


          /**
           *
           */
          scope.toggleOptions = scope.editorToggleOptions = function () {
            scope.optionsEnabled = !scope.optionsEnabled;

            scope.editorLoaded = false;

            //need the timeouts here to give the animations a chance
            $timeout(function(){
              destroyEditor(editor);

              var jsonEditorOptions = getEditorOptions();
              editor = newEditor(jsonEditorOptions);

              $timeout(function(){
                scope.editorLoaded = true;
              }, 50);

            }, 50);

          };


          /**
           *
           *
           */
          function getEditorOptions() {
            return {
              schema: scope.editorDocument.schema,
              theme: 'bootstrap2',
              startval: scope.editorDocumentContent,
              disable_properties: !scope.optionsEnabled,
              disable_collapse: !scope.optionsEnabled,
              disable_edit_json: !scope.optionsEnabled,
              disable_array_add: scope.editorDisableAdd,
              disable_array_delete: !scope.optionsEnabled,
              disable_array_reorder: !scope.optionsEnabled,
              no_additional_properties: true,
              show_errors: 'always'
            };
          }

          /**
           *
           */
          function changeHandle() {
            scope.$apply(function () {

              //validate the form
              var errors = editor.validate();
              if (errors.length) {

                $log.error('Invalid json');
                $log.error(errors);

                scope.editorValid = false;
                Notification.error('Form invalid');
                element.css('background-color', 'red');
              }
              else {
                scope.editorValid = true;
                element.css('background-color', '');
              }

              scope.editorDirty = true;

              Document.setDocumentContent($stateParams.documentId, editor.getValue());
            });
          }



          /**
           *
           * @param editor
           */
          function newEditor(options) {
            var $editorAnchor = element.find('.json-editor-anchor');

            var editor = new JSONEditor($editorAnchor[0], options);
            editor.on('change', changeHandle);

            if(scope.editorReadOnly){
              var $allInputElements = $('textarea, input, select');
              $allInputElements.attr('disabled', 'true');
              $allInputElements.toggleClass('disabled', true);
            }


            //Delay non-priority bindings
            $timeout(function(){

              //bind change field
              bindChangeField();

              //bind add button -> change + autosize
              $('.json-editor-btn-add').on('click', function(){
                $timeout(function(){
                  bindChangeField();
                  bindAutoSize();
                });
              });
            });

            //bind text area auto size library
            $textareaResizeElements = $('textarea:visible').autosize();
            $('div.tabbable.tabs-left > ul > li').on('click', bindAutoSize);

            return editor;
          }

          /**
           *
           */
          function bindChangeField(){
            if(! scope.editorReadOnly){
              var $allInputElements = $('textarea:not(.change-bound), input:not(.change-bound), select:not(.change-bound)');
              $allInputElements.toggleClass('change-bound', true);
              $allInputElements.on('change', function($event){
                var $controlElement = $($event.currentTarget);
                $controlElement.toggleClass('changed', true);
                $changedElements.push($controlElement);
              });
            }
          }

          /**
           *
           */
          function bindAutoSize(){
            if($textareaResizeElements){
              $textareaResizeElements.trigger('autosize.destroy');
              $textareaResizeElements = $('textarea:visible');
              $textareaResizeElements.autosize();
            }
          }

          /**
           *
           */
          var documentUpdatedHandle = $rootScope.$on('document:updated', function(){
            cleanEditorDirty();
          });


          /**
           *
           */
          function cleanEditorDirty(){

            //remove changed states
            $('.changed').toggleClass('changed', false);

            scope.editorDirty = false;

          }


          /**
           *
           * @param editor
           */
          function destroyEditor(editor){

            if($textareaResizeElements){
              $textareaResizeElements.trigger('autosize.destroy');
            }

            editor.off('change', changeHandle);

            editor.destroy();
          }

          /**
           *
           */
          var destroyHandle = scope.$on('$destroy', function () {

            if (editor) {
              destroyEditor(editor);
            }
            destroyHandle();
            documentUpdatedHandle();
          });

        }
      };
    });

})();
