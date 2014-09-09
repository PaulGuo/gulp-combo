gulp-combo
=========

A gulp plugin [gulp-combo](https://github.com/PaulGuo/gulp-combo) will combo all scripts and links in a html page.

You can optionally pass a first argument along with the baseUri to override the default baseUri statements. The default baseUri looks like this:

```
baseUri = 'http://mc.meituan.net/combo/?f=';
```

You can also optionally pass a second argument along with the options to override the default options statements. The default options looks like this:

```
{
	splitter: ';',
	async: false
}
```

### HTML

    <!DOCTYPE HTML>
    <html style="font-size:312.5%">
    <head>
        <meta charset="UTF-8">
        <title>Gulp-combo</title>
        <link href="http://mc.meituan.net/touch/css/eve.0c7f2f70.css" rel="stylesheet"/>
        <link href="http://mc.meituan.net/touch/css/test.css" rel="stylesheet"/>
    </head>
    <body>
    <script type="text/javascript" src="http://mc.meituan.net/zepto/zepto-1.0.1.min.js"></script>
    <script type="text/javascript" src="http://mc.meituan.net/hotel/act/freshmen/js/mjs.js"></script>
    <script type="text/javascript">
        init();
    </script>

    </body>
    </html>

### Usage

    var gulp = require('gulp'),
        combo = require('gulp-combo');

    gulp.task('combo', function(){
      var baseUri = 'http://mc.meituan.net/combo?f=';

      gulp.src('index.html')
        .pipe(combo(baseUri, null))
        .pipe(gulp.dest('build'));
    });

### Output

    <!DOCTYPE HTML>
    <html style="font-size:312.5%">
    <head>
        <meta charset="UTF-8">
        <title>Gulp-combo</title>
        <link rel="stylesheet" href="http://mc.meituan.net/combo?f=touch/css/eve.0c7f2f70.css;touch/css/test.css" />
    </head>
    <body>
    <script type="text/javascript" src="http://mc.meituan.net/combo?f=zepto/zepto-1.0.1.min.js;hotel/act/freshmen/js/mjs.js"></script>
    <script type="text/javascript">
        init();
    </script>

    </body>
    </html>

License
----

MIT
    
