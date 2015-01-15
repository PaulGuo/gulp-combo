'use strict';
var through = require('through2'),
    cheerio = require("cheerio");

module.exports = function(baseUri, options) {
    baseUri = baseUri || 'http://mc.meituan.net/combo/?f=';
    options = options || {};

    return through.obj(function(file, enc, cb) {
        /*
        var $ = cheerio.load(String(file.contents));
        var scripts, links, results;
        var filteredScripts = [], filteredLinks = [];
        */

        var chunk = String(file.contents);
        var src = {
            scripts: [],
            links: []
        };

        var genComboScriptUriTag = function() {
            var uri = baseUri + src.scripts.join(options.splitter || ';');
            var scriptTag = '<script type="text/javascript" src="' + uri + '"></script>';
            var async = options.async || false;

            if(chunk.match('<!--combo async:false-->')) {
                async = false;
            }

            if(chunk.match('<!--combo async:true-->')) {
                async = true;
            }

            if(async === true) {
                  scriptTag = '<script type="text/javascript" src="' + uri + '" async="async"></script>';
            }

            return scriptTag;
        };

        var genComboLinkUriTag = function() {
            var uri = baseUri + src.links.join(options.splitter || ';');
            var linkTag = '<link rel="stylesheet" href="' + uri + '" />';
            return linkTag;
        };

        /*

        scripts = $('script[src]');
        links = $('link[rel="stylesheet"][href]');

        scripts.each(function(i, script) {
            var src_attr = $(script).attr('src');

            if(src_attr.match(/^http:\/\//igm)) {
                if(src_attr.match(/^http:\/\/mc.meituan.net\//igm)) {
                    filteredScripts.push(script);
                }
            } else {
                    filteredScripts.push(script);
            }
        });

        links.each(function(i, link) {
            var href_attr = $(link).attr('href');

            if(href_attr.match(/^http:\/\//igm)) {
                if(href_attr.match(/^http:\/\/mc.meituan.net\//igm)) {
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
            
            src.scripts.push(src_attr.replace('http://mc.meituan.net/', ''));

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
            
            src.links.push(href_attr.replace('http://mc.meituan.net/', ''));

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

        */

        var group = (chunk.replace(/[\r\n]/g, '').match(/\<\!\-\-\[if[^\]]+\]\>.*?\<\!\[endif\]\-\-\>/igm) || []).join('');

        var scriptProcessor = function($, $1) {
            if(group && group.indexOf($) !== -1) {
                return $;
            }

            if($.match(/http:\/\//igm)) {
                if($1.match(/^http:\/\/mc.meituan.net\//igm)) {
                    src.scripts.push($1.replace('http://mc.meituan.net/', ''));
                } else {
                    return $;
                }
            } else {
                src.scripts.push($1.replace(/(.+\/)?[^\/]+\/\.\.\//igm, '$1'));
            }

            if(src.scripts.length === 1) {
                return '<%%%SCRIPT_HOLDER%%%>';
            }

            return '';
        };

        var linkProcessor = function($, $1) {
            if($.match(/http:\/\//igm)) {
                if($1.match(/^http:\/\/mc.meituan.net\//igm)) {
                    src.links.push($1.replace('http://mc.meituan.net/', ''));
                } else {
                    return $;
                }
            } else {
                src.links.push($1.replace(/(.+\/)?[^\/]+\/\.\.\//igm, '$1'));
            }

            if(src.links.length === 1) {
                return '<%%%STYLES_HOLDER%%%>';
            }

            return '';
        };


        chunk = chunk.replace(/<script[^>]+?src="([^"]+)"[^>]*><\/script>/igm, scriptProcessor);
        chunk = chunk.replace(/<link[^>]+?href="([^"]+?)"[^>]+?rel="stylesheet"[^>]*>/igm, linkProcessor);
        chunk = chunk.replace(/<link[^>]+?rel="stylesheet"[^>]+?href="([^"]+?)"[^>]*>/igm, linkProcessor);

        chunk = chunk.replace('<%%%SCRIPT_HOLDER%%%>', genComboScriptUriTag());
        chunk = chunk.replace('<%%%STYLES_HOLDER%%%>', genComboLinkUriTag());
        file.contents = new Buffer(chunk);
        cb(null, file);
    });
};
