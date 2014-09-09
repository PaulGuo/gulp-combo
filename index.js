'use strict';
var through = require('through2'),
    cheerio = require("cheerio");

module.exports = function(baseUri, options) {
  baseUri = baseUri || 'http://mc.yourdomainname.net/combo?f=';
  options = options || {};

  return through.obj(function(file, enc, cb) {
      var $ = cheerio.load(String(file.contents));
      var scripts, links, results;
      var filteredScripts = [], filteredLinks = [];
      var src = {
          scripts: [],
          links: []
      };

      var genComboScriptUriTag = function() {
          var uri = baseUri + src.scripts.join(options.splitter || ';');
          var scriptTag = '<script type="text/javascript" src="' + uri + '"></script>';
          return scriptTag;
      };

      var genComboLinkUriTag = function() {
          var uri = baseUri + src.links.join(options.splitter || ';');
          var linkTag = '<link rel="stylesheet" href="' + uri + '" />';
          return linkTag;
      };

      scripts = $('script[src]');
      links = $('link[rel="stylesheet"][href]');

      scripts.each(function(i, script) {
          var src_attr = $(script).attr('src');

          if(src_attr.match(/^http:\/\//igm)) {
              if(src_attr.match(/^http:\/\/mc.yourdomainname.net\//igm)) {
                filteredScripts.push(script);
              }
          } else {
                filteredScripts.push(script);
          }
      });

      links.each(function(i, link) {
          var href_attr = $(link).attr('href');

          if(href_attr.match(/^http:\/\//igm)) {
              if(href_attr.match(/^http:\/\/mc.yourdomainname.net\//igm)) {
                filteredLinks.push(link);
              }
          } else {
                filteredLinks.push(link);
          }
      });

      filteredScripts.forEach(function(script, i) {
          var src_attr = $(script).attr('src');

          if(filteredScripts.length <= 1) {
              return;
          }
          
          src.scripts.push(src_attr.replace('http://mc.yourdomainname.net/', ''));

          if(i === scripts.length - 1) {
              $(script).replaceWith('<!--SCRIPT PLACEHOLDER-->');
          } else {
              $(script).remove();
          }
      });

      filteredLinks.forEach(function(link, i) {
          var href_attr = $(link).attr('href');

          if(filteredLinks.length <= 1) {
              return;
          }
          
          src.links.push(href_attr.replace('http://mc.yourdomainname.net/', ''));

          if(i === links.length - 1) {
              $(link).replaceWith('<!--LINK PLACEHOLDER-->');
          } else {
              $(link).remove();
          }
      });

      results = $.html(null, {decodeEntities: false}).replace('<!--SCRIPT PLACEHOLDER-->', genComboScriptUriTag())
                        .replace('<!--LINK PLACEHOLDER-->', genComboLinkUriTag());

      file.contents = new Buffer(results);
      cb(null, file);
  });
};
