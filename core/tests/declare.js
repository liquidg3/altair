define(['doh/runner',
        'altair/facades/declare',
        'altair/Deferred',
        'altair/facades/hitch'
    ],
    function (doh,
              declare,
              Deferred,
              hitch) {


        doh.register('declare', {

            "test extendOnce": function (t) {

                var dummy,
                    Dummy,
                    expected = ['foo1', 'bar'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo1');
                        this.inherited(arguments);
                    }

                });

                Dummy.extendOnce({
                    foo: function () {
                        this.actual.push('foo2');
                    },
                    bar: function () {
                        this.actual.push('bar');
                    }
                });

                dummy = new Dummy();
                dummy.foo();
                dummy.bar();

                t.is(dummy.actual, expected, 'extendBefore');


            },

            "test declare extendBefore 1 level": function (t) {

                var dummy,
                    Dummy,
                    expected = ['foo2', 'foo1'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo1');
                        this.inherited(arguments);
                    }

                });

                Dummy.extendBefore({
                    foo: function () {
                        this.actual.push('foo2');
                    }
                });

                dummy = new Dummy();
                dummy.foo();

                t.is(dummy.actual, expected, 'extendBefore');


            },

            "test declare extendBefore 1 level with param": function (t) {

                var dummy,
                    Dummy,
                    expected = ['bar', 'foo2', 'bar', 'foo1'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function (bar) {
                        this.actual.push(bar);
                        this.actual.push('foo1');
                        this.inherited(arguments);
                    }

                });

                Dummy.extendBefore({
                    foo: function (bar) {
                        this.actual.push(bar);
                        this.actual.push('foo2');
                    }
                });

                dummy = new Dummy();
                dummy.foo('bar');

                t.is(dummy.actual, expected, 'extendBefore');


            },

            "test declare extendBefore 2 levels": function (t) {

                var dummy,
                    Dummy,
                    Dummy2,
                    expected = ['foo3', 'foo2', 'foo1'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo1');
                        return 'bar';
                    }

                });

                Dummy2 = declare(Dummy, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo2');
                        return this.inherited(arguments);
                    }

                });

                Dummy2.extendBefore({
                    foo: function () {
                        this.actual.push('foo3');
                    }
                });

                dummy = new Dummy2();
                dummy.foo();

                t.is(dummy.actual, expected, 'extendBefore');


            },

            "test declare extendBefore 2 levels while retaining return value": function (t) {

                var dummy,
                    Dummy,
                    Dummy2,
                    result,
                    expected = ['foo3', 'foo2', 'foo1'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo1');
                        return 'bar';
                    }

                });

                Dummy2 = declare(Dummy, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo2');
                        return this.inherited(arguments);
                    }

                });

                Dummy2.extendBefore({
                    foo: function () {
                        this.actual.push('foo3');
                    }
                });

                dummy = new Dummy2();
                result = dummy.foo();

                t.is(result, 'bar', 'extendBefore');


            },

            "test declare extendBefore 2 levels with deferred": function (t) {

                var dummy,
                    Dummy,
                    Dummy2,
                    result,
                    expected = ['foo3', 'foo2', 'foo1'];


                Dummy = declare(null, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo1');
                        return 'bar';
                    }

                });

                Dummy2 = declare(Dummy, {
                    actual: null,
                    constructor: function () {
                        this.actual = [];
                    },
                    foo: function () {
                        this.actual.push('foo2');
                        return this.inherited(arguments);
                    }

                });

                Dummy2.extendBefore({
                    foo: function () {
                        var d = new Deferred();

                        setTimeout(hitch(this, function () {
                            this.actual.push('foo3');
                            d.resolve();
                        }), 50);

                        return d;
                    }
                });

                dummy = new Dummy2();
                return dummy.foo().then(function (foo) {
                    t.is(foo, 'bar');
                    t.is(dummy.actual, expected, 'extendBefore');

                });

            }



        });


    });