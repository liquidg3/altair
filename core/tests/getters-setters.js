define(['altair/test',
        'altair/mixins/_AssertMixin',
        'altair/facades/declare'],
    function (test,
              _AssertMixin,
              declare) {


        var ClassOne = declare(null, {
            _name: 'classOne'
        });

        Object.defineProperty(ClassOne.prototype, 'customGetter', {
            get: function () {
                return 'bar';
            },

            set: function (value) {
                this._newValue = value;
            }
        });

        Object.defineProperty(ClassOne.prototype, 'name', {
            get: function () {
                return this._name;
            },

            set: function (value) {
                this._name = value;
            }
        });

        var ClassTwo = declare([ClassOne, _AssertMixin], {
            _name: 'classTwo',
            newMethod: function () {}
        });


        test.register('extensions-apollo', {

            "both getter and setter called": function (t) {

                var instanceOne = new ClassOne();

                t.is('bar', instanceOne.customGetter, 'getter failed');
                t.is('classOne', instanceOne.name, 'getter failed');

                instanceOne.customGetter = 'bar';

                t.is('bar', instanceOne._newValue, 'setter failed');


            },

            "both getter and setter called on subclass": function (t) {

                var instanceTwo = new ClassTwo();

                t.is('bar', instanceTwo.customGetter, 'getter failed');
                t.is('classTwo', instanceTwo.name, 'getter failed');

                instanceTwo.customGetter = 'bar';

                t.is('bar', instanceTwo._newValue, 'setter failed');


            }

        });


    });