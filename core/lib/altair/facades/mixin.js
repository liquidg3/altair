/**
 * Simple wrapper for lang.hitch to make it into an easy function
 */
define(['dojo/_base/lang'], function (lang) {

    var l =  {
        _mixin: function(dest, source, copyFunc){
            // summary:
            //		Copies/adds all properties of source to dest; returns dest.
            // dest: Object
            //		The object to which to copy/add all properties contained in source.
            // source: Object
            //		The object from which to draw all properties to copy into dest.
            // copyFunc: Function?
            //		The process used to copy/add a property in source; defaults to the Javascript assignment operator.
            // returns:
            //		dest, as modified
            // description:
            //		All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
            //		found in Object.prototype, are copied/added to dest. Copying/adding each particular property is
            //		delegated to copyFunc (if any); copyFunc defaults to the Javascript assignment operator if not provided.
            //		Notice that by default, _mixin executes a so-called "shallow copy" and aggregate types are copied/added by reference.
            var name, s, i, empty = {};
            for(name in source){
                // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
                // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
                // don't overwrite it with the toString() method that source inherited from Object.prototype
                s = source[name];
                if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
                    dest[name] = copyFunc ? copyFunc(s) : s;
                }
            }

//            if(has("bug-for-in-skips-shadowed")){
//                if(source){
//                    for(i = 0; i < _extraLen; ++i){
//                        name = _extraNames[i];
//                        s = source[name];
//                        if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
//                            dest[name] = copyFunc ? copyFunc(s) : s;
//                        }
//                    }
//                }
//            }

            return dest; // Object
        },

        mixin: function(dest, sources){
            // summary:
            //		Copies/adds all properties of one or more sources to dest; returns dest.
            // dest: Object
            //		The object to which to copy/add all properties contained in source. If dest is falsy, then
            //		a new object is manufactured before copying/adding properties begins.
            // sources: Object...
            //		One of more objects from which to draw all properties to copy into dest. sources are processed
            //		left-to-right and if more than one of these objects contain the same property name, the right-most
            //		value "wins".
            // returns: Object
            //		dest, as modified
            // description:
            //		All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
            //		found in Object.prototype, are copied/added from sources to dest. sources are processed left to right.
            //		The Javascript assignment operator is used to copy/add each property; therefore, by default, mixin
            //		executes a so-called "shallow copy" and aggregate types are copied/added by reference.
            // example:
            //		make a shallow copy of an object
            //	|	var copy = lang.mixin({}, source);
            // example:
            //		many class constructors often take an object which specifies
            //		values to be configured on the object. In this case, it is
            //		often simplest to call `lang.mixin` on the `this` object:
            //	|	declare("acme.Base", null, {
            //	|		constructor: function(properties){
            //	|			// property configuration:
            //	|			lang.mixin(this, properties);
            //	|
            //	|			console.log(this.quip);
            //	|			//	...
            //	|		},
            //	|		quip: "I wasn't born yesterday, you know - I've seen movies.",
            //	|		// ...
            //	|	});
            //	|
            //	|	// create an instance of the class and configure it
            //	|	var b = new acme.Base({quip: "That's what it does!" });
            // example:
            //		copy in properties from multiple objects
            //	|	var flattened = lang.mixin(
            //	|		{
            //	|			name: "Frylock",
            //	|			braces: true
            //	|		},
            //	|		{
            //	|			name: "Carl Brutanananadilewski"
            //	|		}
            //	|	);
            //	|
            //	|	// will print "Carl Brutanananadilewski"
            //	|	console.log(flattened.name);
            //	|	// will print "true"
            //	|	console.log(flattened.braces);

            if(!dest){ dest = {}; }
            for(var i = 1, l = arguments.length; i < l; i++){
                this._mixin(dest, arguments[i]);
            }
            return dest; // Object
        }
    }

    return lang.hitch(l, function () {

        var arr = {},
            args = Array.prototype.slice.call(arguments, 0);

        args.unshift(arr);

        this.mixin.apply(this, args);

        return arr;
    });

});
