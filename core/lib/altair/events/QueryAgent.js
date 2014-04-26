/**
 * The built in QueryAgent for the event system in Altair. It is currently powered by underscore-query
 * https://github.com/davidgtonge/underscore-query - since speed is of the utmost importance, we need to always be
 * on the lookout for ways to improve and speed up the event query process.
 */
define(['altair/facades/declare',
        'dojo/node!underscore',
        'dojo/node!underscore-query'
], function (declare, _, underscoreQuery) {

    var engine = underscoreQuery(_, false)

    return declare(null, {
        engine: engine,
        matches: function (event, query) {

            if(!query || query == {}) {
                return true;
            }

            return this.engine([ event.data ], query, function (obj, key) {
                if('get' in obj) {
                    return obj.get(key);
                }
                return obj[key];
            }).length > 0;
        }

    });
});