/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';


var q = require('q');
var User = require('../api/user/user.model');
var Document = require('../api/document/document.model');
var Schema = require('../api/schema/schema.model');



var schemas = [
  {
    schema: {
      name : 'Nav dev schema',
      info : 'Nav dev json schema',
      googleDocSchemaId: '0B84YdCmz0nrQWjc5SzdDVEYwWXM'
    },
    documents: [
      {
        name : 'Nav dev content',
        info : 'Nav dev json content',
        googleDocContentId: '0B84YdCmz0nrQamtJTUJUVlpBOU0'
      },
      {
        name : 'Nav live content',
        info : 'Nav live json content',
        googleDocContentId: '0B84YdCmz0nrQZUtVODBYNkJFTVE'
      }
    ]
  }

];




/**
 *
 */
Schema.find({}).remove(function() {
  Document.find({}).remove(function() {

    var i;

    for(i = 0; i < schemas.length; i++){
      var currentSchema = schemas[i];

      Schema.create(currentSchema.schema, function(event, schemaMongo){

        console.log('seeded schema ' + currentSchema.schema.name);

        var j;
        for(j = 0; j < currentSchema.documents.length; j++){
          var currentDocument = currentSchema.documents[j];
          currentDocument.schemaId = schemaMongo._id;

          Document.create(currentDocument, function(){
            console.log('seeded document ' + currentDocument.name);
          });
        }

      });

    }

  });

});

/**
 *
 */
User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});
