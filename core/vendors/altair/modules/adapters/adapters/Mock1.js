define(['altair/facades/declare'],
    function (declare) {

        return declare('altair/modules/adapters/adapters/Mock1', null, {

            foo: function () {
                return 'Mock1';
            }

        });

    });