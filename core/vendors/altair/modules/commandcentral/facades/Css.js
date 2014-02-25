/**
 * A facade for css-parser (https://www.npmjs.org/package/css-parse) to make it more "Altair elegant."
 * Really, we're cutting out a lot of granularity in the parser in exchange for ease of use. I think
 * people will enjoy it more if it works this way:
 *
 * css('path/to/file.css').then(function (styles) {
 *
 *      console.log(styles['#bg']['background-image']);
 *
 * }).otherwise(....
 *
 */
define(['dojo/node!css-parse',
        'dojo/node!fs',
        'dojo/node!i18n-2',
        'altair/Deferred',
        'altair/facades/mixin'
], function (parser,
             fs,
             i18n,
             Deferred,
             mixin) {


    "use strict";

    return function(filepath) {

        var d = new Deferred();

        //read the css file
        fs.readFile(filepath, 'utf8', function (err, contents) {

            if(err) {
                d.reject(err, false);
            } else {

                //parse it using css-parser
                var css     = parser(contents),
                    dest    = {}; //where the final results are stored

                if(!css || !css.stylesheet || !css.stylesheet.rules) {
                    d.reject(i18n.__('error reading %s. it appears to be empty or malformed.', filepath));
                }
                //lets proceed with simplification
                else {

                    //each rule holds the properties, their values, and selectors
                    css.stylesheet.rules.forEach(function (rule) {

                        var properties = {};

                        //build property list
                        rule.declarations.forEach(function (d) {

                            //quoted property values come with quotes from the parser, i just remove them
                            if(d.value[0] === '"') {
                                d.value = d.value.substr(1, d.value.length - 2);
                            }
                            properties[d.property] = d.value;
                        });

                        //attach properties to each selector
                        rule.selectors.forEach(function (s) {
                            dest[s] = mixin(dest[s] || {}, properties);
                        });


                    });

                    //send back simplified css
                    d.resolve(dest);


                }


                d.resolve(css);



            }

        });

        return d;

    };

});
