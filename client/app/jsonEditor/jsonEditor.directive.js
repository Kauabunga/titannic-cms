'use strict';

angular.module('titannicCmsApp')
  .directive('jsonEditor', function ($log, $q, Document, $timeout, Notification, $stateParams) {
    return {
      templateUrl: 'app/jsonEditor/jsonEditor.html',
      restrict: 'EAC',
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
        scope.editorValid = true;


        /**
         *
         */
        (function init(){

          //dont block TODO sort out this getDocument -> getCurrentDocument which resolves when the next getDocument call is made
          //                need a document factory
          $timeout(function(){
            var deferred = Document.getDocument($stateParams.documentId);

            deferred.finally(function(){

            });

            deferred.then(
              function success(document){

                var jsonEditorOptions = {
                  schema: document.schema,
                  theme: 'bootstrap3',
                  startval: document.content,
                  disable_properties: true,
                  disable_collapse: true,
                  disable_edit_json: true,
                  show_errors: 'always'

                };

                editor = newEditor(jsonEditorOptions);

              },
              function error(statusCode){
                if(statusCode !== 401){
                  Notification.error('Editor failed to get document', statusCode);
                }
                else{
                  $log.error('Editor failed to get document', statusCode);
                }

            });
          });

        })();


        /**
         *
         */
        function changeHandle(){
          scope.$apply(function(){

            //validate the form
            var errors = editor.validate();
            if(errors.length) {

              $log.error('Invalid json');
              $log.error(errors);
              Notification.error('Json invalid');

              scope.editorValid = false;
            }
            else{
              scope.editorValid = true;
            }

            Document.setDocumentContent($stateParams.documentId, editor.getValue());
          });
        }

        /**
         *
         * @param editor
         */
        function newEditor(options){

          var editor = new JSONEditor(element[0], options);
          editor.on('change', changeHandle);
          return editor;
        }

        /**
         *
         */
        var destroyHandle = scope.$on('$destroy', function(){

          if(editor){
            editor.off('change', changeHandle);
            editor.destroy();
          }
          destroyHandle();
        });

      }
    };
  });
