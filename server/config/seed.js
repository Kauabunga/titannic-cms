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
      name : 'Nav schema',
      info : 'Nav schema',
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
  },
  {
    schema: {
      name : 'Careers schema',
      info : 'Careers schema',
      googleDocSchemaId: '0B84YdCmz0nrQWjBrWERhVlhJNDg'
    },
    documents: [
      {
        name : 'Careers dev content',
        info : 'Careers dev json content',
        googleDocContentId: '0B84YdCmz0nrQcXlrQjQ2MlVqUVU'
      },
      {
        name : 'Careers live content',
        info : 'Careers live json content',
        googleDocContentId: '0B84YdCmz0nrQYVBZcHVkTVNTQjg'
      }
    ]
  },
  {
    schema: {
      name : 'About us schema',
      info : 'About us schema',
      googleDocSchemaId: '0B84YdCmz0nrQSEdrdXMzbDhhMm8'
    },
    documents: [
      {
        name : 'About us dev content',
        info : 'About us dev json content',
        googleDocContentId: '0B84YdCmz0nrQal9TRjhMMHZhTVk'
      },
      {
        name : 'About us live content',
        info : 'About us live json content',
        googleDocContentId: '0B84YdCmz0nrQck5TWG9TZC1jTGs'
      }
    ]
  }

];

/**
 *
 * @param document
 */
function createDocument(document){

  Document.create(document, function(){
    console.log('seeded document ' + document.name);
  });
}

/**
 *
 * @param currentSchema
 */
function createSchema(currentSchema){

  Schema.create(currentSchema.schema, function(event, schemaMongo){

    console.log('seeded schema ' + currentSchema.schema.name);

    var j;
    for(j = 0; j < currentSchema.documents.length; j++){
      var currentDocument = currentSchema.documents[j];
      currentDocument.schemaId = schemaMongo._id;
      createDocument(currentDocument);
    }

  });
}

/**
 *
 */
Schema.find({}).remove(function() {
  Document.find({}).remove(function() {

    var i;

    for(i = 0; i < schemas.length; i++){
      var currentSchema = schemas[i];
      createSchema(currentSchema);

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
