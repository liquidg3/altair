/**
 * ONLY AND AND OR ARE SUPPORTED. IN & NIN
 */

define(['altair/facades/declare',
        'altair/facades/mixin',
        'dojo/_base/lang'
], function (declare,
             mixin,
             lang) {

    return declare(null, {

        _query:         null,
        _currentJoin:   'and',
        _queryPath:     '', //dot style identifier for setting proper spots in the query

        constructor: function () {
            this._query = {};
        },

        where: function (name, operator, operand) {

            var predicate = {}, // the final predicate that is added to the local _query
                subPredicate, // when checking if we are under another predicate
                _queryPath; //junk

            switch(operator.toLowerCase()) {
                case '=':
                case '==':
                    predicate[name] = operand;
                    break;
                case '>':
                case '<':
                case '>=':
                case '<=':
                case 'like':
                    predicate[name] = {};
                    predicate[name]['$' + operator] = operand;
                    break;
                default:
                    throw new Error('Unknown operator "' + operator + '". Supported include =,==,>,<,>=,<=,LIKE');
            }

            if(this._currentJoin === 'and') {

                if(this._queryPath === '') {

                    this._query = mixin(this._query, predicate);

                }
                //if we are deeper in the query, set the value there
                else {

                    subPredicate    = lang.getObject(this._queryPath, true, this._query);
                    _queryPath    = this._queryPath;

                    //this is an "OR" since its an array. so lets add it to the array
                    if(_.isArray(subPredicate)) {
                        _queryPath       = _queryPath + '.' + (subPredicate.length - 1); //we we are in the query more precisely
                        subPredicate     = mixin(subPredicate.pop(), predicate);
                    }
                    //we are already in part of an "AND"
                    else {
                        subPredicate     = mixin(subPredicate, predicate);
                    }


                    lang.setObject(_queryPath, subPredicate, this._query);
                }

            }
            //now OR
            else {

                if(!this._queryPath) {

                    this._query = {
                        '$OR': [
                            this._query,
                            predicate
                        ]
                    };

                    this._queryPath = '$OR';

                } else {

                    subPredicate = lang.getObject(this._queryPath, true, this._query);

                    //we are already part of an OR (because we're an array)
                    if(_.isArray(subPredicate)) {
                        subPredicate.push(predicate);
                    }
                    //wrap in outer OR
                    else {

                        throw new Error('not finished');

                    }

                }

            }

            return this;


        },

        and: function () {
            this._currentJoin = 'and';
            return this;
        },

        or: function () {

            this._currentJoin = 'or';

            return this;

        },

        query: function () {
            return this._query;
        }

    });

});