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
        name : 'Nav content',
        info : 'Nav content',

        //TODO the amount of env's should be configurable
        liveContentGoogleDocId: '0B84YdCmz0nrQZUtVODBYNkJFTVE',
        devContentGoogleDocId: '0B84YdCmz0nrQamtJTUJUVlpBOU0',
        previewPath: '#!/'
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
        name : 'Careers content',
        info : 'Careers content',
        liveContentGoogleDocId: '0B84YdCmz0nrQYVBZcHVkTVNTQjg',
        devContentGoogleDocId: '0B84YdCmz0nrQcXlrQjQ2MlVqUVU',
        previewPath: '#!/careers'
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
        name : 'About us content',
        info : 'About us content',
        liveContentGoogleDocId: '0B84YdCmz0nrQal9TRjhMMHZhTVk',
        devContentGoogleDocId: '0B84YdCmz0nrQck5TWG9TZC1jTGs',
        previewPath: '#!/aboutus'
      }
    ]
  },
  {
    schema: {
      name : 'Capabilities schema',
      info : 'Capabilities schema',
      googleDocSchemaId: '0B84YdCmz0nrQRFMzQjhjMy01YVU'
    },
    documents: [
      {
        name : 'Capabilities content',
        info : 'Capabilities json content',
        liveContentGoogleDocId: '0B84YdCmz0nrQb093WGY3ZjZWbVk',
        devContentGoogleDocId: '0B84YdCmz0nrQOHhnOEJsLWY1akE',
        previewPath: '#!/services'
      }
    ]
  },
  {
    schema: {
      name : 'Clients schema',
      info : 'Clients schema',
      googleDocSchemaId: '0B84YdCmz0nrQR0tuaVNFX1NDVUU'
    },
    documents: [
      {
        name : 'Clients content',
        info : 'Clients content',
        liveContentGoogleDocId: '0B84YdCmz0nrQaWQ3dzRWdjhkanc',
        devContentGoogleDocId: '0B84YdCmz0nrQbFExTXpXVjZlLW8',
        previewPath: '#!/'
      }
    ]
  },
  {
    schema: {
      name : 'Case studies schema',
      info : 'Case studies schema',
      googleDocSchemaId: '0B84YdCmz0nrQcmI1cXl3eFZ3SGs'
    },
    documents: [
      {
        name : 'Case studies content',
        info : 'Case studies content',
        liveContentGoogleDocId: '0B84YdCmz0nrQbndockJGNDQ1WGM',
        devContentGoogleDocId: '0B84YdCmz0nrQMG85NTIwQzZ0TUk',
        previewPath: '#!/casestudies'
      }
    ]
  },
  {
    schema: {
      name : 'Contact schema',
      info : 'Contact schema',
      googleDocSchemaId: '0B84YdCmz0nrQTnV1dTNVMGhmaWs'
    },
    documents: [
      {
        name : 'Contact content',
        info : 'Contact content',
        liveContentGoogleDocId: '0B84YdCmz0nrQZTRMUkZJeXFXbHM',
        devContentGoogleDocId: '0B84YdCmz0nrQZi1DSmdoYURWTms',
        previewPath: '#!/contactus'
      }
    ]
  },
  {
    schema: {
      name : 'Quotes schema',
      info : 'Quotes schema',
      googleDocSchemaId: '0B84YdCmz0nrQY2lOcDNkVjYwN00'
    },
    documents: [
      {
        name : 'Quotes content',
        info : 'Quotes content',
        liveContentGoogleDocId: '0B84YdCmz0nrQWExzV2VKemh1Um8',
        devContentGoogleDocId: '0B84YdCmz0nrQYTNGN0MyOW9MM1E',
        previewPath: '#!/'
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
