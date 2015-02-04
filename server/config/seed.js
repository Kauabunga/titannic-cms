/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';


var q = require('q');
var config = require('./environment');
var User = require('../api/user/user.model');
var Document = require('../api/document/document.model');
var Schema = require('../api/schema/schema.model');
var GoogleAuthModel = require('../googledrive/auth/googleauth.model');



var schemas = [
  {
    schema: {
      name : 'Easy Answers',
      info : 'Easy Answers schema',
      googleDocSchemaId: '0B84YdCmz0nrQUDhiNFJmNEhaZWM'
    },
    documents: [
      {
        name : 'ACC Levy form',
        info : 'ACC Levy form',

        //TODO the amount of env's should be configurable
        liveContentGoogleDocId: '0B84YdCmz0nrQaUJXSzNIWDZidVU',
        previewContentGoogleDocId: '0B84YdCmz0nrQdDg4QnJ5c3pXR2M',
        devContentGoogleDocId: '0B84YdCmz0nrQaUJXSzNIWDZidVU',
        previewPath: '#!/',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Navigation',
      info : 'Navigation schema',
      googleDocSchemaId: '0B84YdCmz0nrQWjc5SzdDVEYwWXM'
    },
    documents: [
      {
        name : 'Navigation',
        info : 'Navigation content',

        //TODO the amount of env's should be configurable
        liveContentGoogleDocId: '0B84YdCmz0nrQZUtVODBYNkJFTVE',
        previewContentGoogleDocId: '0B84YdCmz0nrQZTBiLUZQNGVSUTA',
        devContentGoogleDocId: '0B84YdCmz0nrQamtJTUJUVlpBOU0',
        previewPath: '#!/',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Careers',
      info : 'Careers schema',
      googleDocSchemaId: '0B84YdCmz0nrQWjBrWERhVlhJNDg'
    },
    documents: [
      {
        name : 'Careers',
        info : 'Careers content',
        liveContentGoogleDocId: '0B84YdCmz0nrQYVBZcHVkTVNTQjg',
        previewContentGoogleDocId: '0B84YdCmz0nrQb2haSmVyeFhUaEE',
        devContentGoogleDocId: '0B84YdCmz0nrQcXlrQjQ2MlVqUVU',
        previewPath: '#!/careers',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'About us',
      info : 'About us schema',
      googleDocSchemaId: '0B84YdCmz0nrQSEdrdXMzbDhhMm8'
    },
    documents: [
      {
        name : 'About us',
        info : 'About us content',
        liveContentGoogleDocId: '0B84YdCmz0nrQck5TWG9TZC1jTGs',
        previewContentGoogleDocId: '0B84YdCmz0nrQdWF4TkU3YVVadmc',
        devContentGoogleDocId: '0B84YdCmz0nrQal9TRjhMMHZhTVk',
        previewPath: '#!/aboutus',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Capabilities',
      info : 'Capabilities schema',
      googleDocSchemaId: '0B84YdCmz0nrQRFMzQjhjMy01YVU'
    },
    documents: [
      {
        name : 'Capabilities',
        info : 'Capabilities json content',
        liveContentGoogleDocId: '0B84YdCmz0nrQb093WGY3ZjZWbVk',
        previewContentGoogleDocId: '0B84YdCmz0nrQU21DOXJhRWZaNnM',
        devContentGoogleDocId: '0B84YdCmz0nrQOHhnOEJsLWY1akE',
        previewPath: '#!/services',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Clients',
      info : 'Clients schema',
      googleDocSchemaId: '0B84YdCmz0nrQR0tuaVNFX1NDVUU'
    },
    documents: [
      {
        name : 'Clients',
        info : 'Clients content',
        liveContentGoogleDocId: '0B84YdCmz0nrQaWQ3dzRWdjhkanc',
        previewContentGoogleDocId: '0B84YdCmz0nrQb3VZMWw4enhUSGM',
        devContentGoogleDocId: '0B84YdCmz0nrQbFExTXpXVjZlLW8',
        previewPath: '#!/',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Case studies',
      info : 'Case studies schema',
      googleDocSchemaId: '0B84YdCmz0nrQcmI1cXl3eFZ3SGs'
    },
    documents: [
      {
        name : 'Case studies',
        info : 'Case studies content',
        liveContentGoogleDocId: '0B84YdCmz0nrQbndockJGNDQ1WGM',
        previewContentGoogleDocId: '0B84YdCmz0nrQS0pQYmM5UHVEVnM',
        devContentGoogleDocId: '0B84YdCmz0nrQMG85NTIwQzZ0TUk',
        previewPath: '#!/casestudies',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Contact',
      info : 'Contact schema',
      googleDocSchemaId: '0B84YdCmz0nrQTnV1dTNVMGhmaWs'
    },
    documents: [
      {
        name : 'Contact',
        info : 'Contact content',
        liveContentGoogleDocId: '0B84YdCmz0nrQZTRMUkZJeXFXbHM',
        previewContentGoogleDocId: '0B84YdCmz0nrQaEZ4X182cjBrSWs',
        devContentGoogleDocId: '0B84YdCmz0nrQZi1DSmdoYURWTms',
        previewPath: '#!/contactus',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
      }
    ]
  },
  {
    schema: {
      name : 'Quotes',
      info : 'Quotes schema',
      googleDocSchemaId: '0B84YdCmz0nrQY2lOcDNkVjYwN00'
    },
    documents: [
      {
        name : 'Quotes',
        info : 'Quotes content',
        liveContentGoogleDocId: '0B84YdCmz0nrQWExzV2VKemh1Um8',
        previewContentGoogleDocId: '0B84YdCmz0nrQb1ltdDNRWU5Bcnc',
        devContentGoogleDocId: '0B84YdCmz0nrQYTNGN0MyOW9MM1E',
        previewPath: '#!/',
        viewRole: 'guest',
        editRole: 'editor',
        publishRole: 'publisher'
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
GoogleAuthModel.find({}).remove(function(){

  GoogleAuthModel.create({
    googleAccess: {
      refreshToken: config.google.refreshToken
    }
  }, function(){
    console.log('finished seeding GoogleAuthModel model');
  });

});


/**
 *
 */
User.find({}).remove(function() {
  User.create(
    {
      provider: 'local',
      name: 'Test User',
      email: 'user@user.com',
      password: 'user'
    },
    {
      provider: 'local',
      name: 'Editor',
      role: 'editor',
      email: 'editor@editor.com',
      password: 'editor'
    },
    {
      provider: 'local',
      name: 'Publisher',
      role: 'publisher',
      email: 'publisher@publisher.com',
      password: 'publisher'
    },
    {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin'
    },
    function() {
      console.log('finished populating users');
    }
  );
});
