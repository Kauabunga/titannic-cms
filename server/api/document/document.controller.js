'use strict';

var _ = require('lodash');
var Document = require('./document.model');
var https = require('follow-redirects').https;


// Get list of documents
exports.index = function(req, res) {
  Document.find(function (err, documents) {
    if(err) { return handleError(res, err); }

    //TODO we need to ensure the returned documents are inline with the User role

    return res.json(200, documents);
  });
};

// Get a single document
exports.show = function(req, res) {
  Document.findById(req.params.id, function (err, document) {

    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }

    //If the document is already being edited we need to deny this request
    if(document.active){
      return res.send(423);
    }

    //TODO we need to fetch the google doc from goooogle - should really be using correct api + library as we will have to when editing?
    //TODO distinguish google errors from server errors

    //TODO this should be in a separate module
    var httpsGoogleOptions = {
      host: 'docs.google.com',
      path: '/uc?id=' + document.googleDocContentId + '&export=download' + '&random=' + (Math.random() * 100000),
      agent: false
    };

    console.log('REQUEST : ' + document.name + '    id: ' + document.googleDocContentId + '    url: ' + httpsGoogleOptions.host + httpsGoogleOptions.path);

    var googleRequest = https.get(httpsGoogleOptions, function googleResponse(googleResponse){
      if(googleResponse.statusCode === 200) {

        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        googleResponse.on('data', function (chunk) {
          // You can process streamed parts here...
          bodyChunks.push(chunk);
        }).on('end', function () {

          var content = '';

          try {
            content = Buffer.concat(bodyChunks);
            console.log('    ---> CONTENT found for document: ' + document.name + '\n');

            var deserialisedContent = JSON.parse(content);
            var documentObject = document.toObject();
            documentObject.content = deserialisedContent;


            //TODO fetch this from a google id also
            documentObject.schema = {
              "title": "Nav",
              "type": "object",
              "properties": {
                "navItems": {
                  "type": "array",
                  "format": "table",
                  "title": "Navs",
                  "uniqueItems": true,
                  "items": {
                    "type": "object",
                    "title": "Nav",
                    "properties": {
                      "label": {
                        "type": "string"
                      },
                      "path": {
                        "type": "string"
                      },
                      "title": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "keywords": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            };

            res.status(200).json(documentObject);
          }
          catch (error) {
            console.log('    ---> Error parsing response for document: ' + document.name);
            console.log('         CONTENT: ' + content);
            console.log('         URL: ' + httpsGoogleOptions.host + httpsGoogleOptions.path);
            console.log(error);

            res.status(500);
          }

        }).on('error', function(error){
          console.log('        ---> ERROR https.get error: ' + error);
          res.status(500);
        });
      }
      else{
        console.log('          ---> ERROR Non 200 response = ' + googleResponse.statusCode);

        res.status(500);
      }

    });

    /**
     *
     */
    googleRequest.setTimeout(20000, function(error){
      console.log('        ---> Google doc timeout: ' + error);
      res.status(408);
    });

    /**
     *
     */
    googleRequest.on('error', function(error){
      console.log('        ---> ERROR https.get error: ' + error);
      res.status(500);
    });



    //TODO we need to store the content in our own database using the User id as a key
    //      if the document is not saved we can keep the edit for as long as it doesn't get updated by someone else
    //      if the document is updated then we need to only allow the user to view their old edits and perhaps copy them
    //      somewhere else

    //TODO we need to lock (active) the current copy so other users are not able to edit it at the same time


  });
};

// Creates a new document in the DB.
exports.create = function(req, res) {
  Document.create(req.body, function(err, document) {
    if(err) { return handleError(res, err); }
    return res.json(201, document);
  });
};

// Updates an existing document in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  //TODO need to also update the document on google docs


  Document.findById(req.params.id, function (err, document) {
    if (err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    var updated = _.merge(document, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, document);
    });
  });
};

// Deletes a document from the DB.
exports.destroy = function(req, res) {
  Document.findById(req.params.id, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    document.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
