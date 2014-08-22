/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
    'apollo/Schema',
    'apollo/propertytypes/Str',
    'apollo/propertytypes/Bool'],

    function (doh, Schema, Str, Bool) {

        /**
         * Dependencies
         */
        var schemaLiteral = {
                name:       'my test user schema',
                foo:        'bar',
                properties: {

                    firstName: {
                        type:    'string',
                        options: {
                            label:    'First Name',
                            required: true
                        }
                    },

                    isVerified: {
                        type:    'boolean',
                        options: {
                            label: 'Is Verified'
                        }
                    },

                    email: {
                        type:    'string',
                        options: {
                            label:   'Email',
                            pattern: '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
                        }
                    },

                    friends: {
                        type:    'string',
                        options: {
                            label: 'Friends',
                            many:  true
                        }
                    }

                }
            },
            values1 = {
                firstName:  null,
                isVerified: true
            },
            values2 = {
                isVerified: true,
                email:      'usertest.com'
            },
            values3 = {
                firstName:  'tay',
                isVerified: true,
                email:      'user@test.com'
            },
            values4 = {
                firstName:  'tay',
                isVerified: true,
                friends:    [
                    'billy',
                    'bob',
                    'rob'

                ]

            },
            fieldTypes = [
                new Str(),
                new Bool()
            ];


        doh.register('apollo-validation', {

            "test required validation": function (t) {


                var schema = new Schema(schemaLiteral, fieldTypes),
                    dfd = new t.Deferred();

                schema.validate(values1).then(function () {

                    dfd.reject(new Error('This should not have passed'));

                }).otherwise(function (errs) {

                    t.is(1, errs.length, 'error count was wrong');
                    t.is('First Name is required.', errs.byProperty.firstName[0]);

                    dfd.resolve();

                });

                return dfd;

            },

            "test pattern validation": function (t) {


                var schema = new Schema(schemaLiteral, fieldTypes),
                    dfd = new t.Deferred();

                schema.validate(values2).then(function () {

                    dfd.reject(new Error('should not be called'));

                }).otherwise(function (errs) {

                    t.is(2, errs.length, 'error count was wrong');
                    t.is('Email is invalid.', errs.byProperty.email[0]);
                    t.is('Email is invalid.', errs[1]);

                    dfd.resolve();

                });

                return dfd;

            },

            "test throw on first": function (t) {


                var schema = new Schema(schemaLiteral, fieldTypes),
                    dfd = new t.Deferred();

                schema.validate(values2, { throwOnFirst: true }).then(function () {

                    dfd.reject(new Error('This should not have passed'));

                }).otherwise(function (err) {

                    t.t(err instanceof Error, 'error came back as wrong type, expected Error');

                    dfd.resolve();

                });

                return dfd;


            },

            "no errors": function (t) {


                var schema = new Schema(schemaLiteral, fieldTypes),
                    dfd = new t.Deferred();

                schema.validate(values3, { throwOnFirst: true }).then(function () {

                    dfd.resolve();

                }).otherwise(function (err) {

                    dfd.reject(new Error('should never be hit'));

                });


                return dfd;
            },

            "test many": function (t) {


                var schema = new Schema(schemaLiteral, fieldTypes),
                    dfd = new t.Deferred();

                schema.validate(values4, { throwOnFirst: true }).then(function () {

                    dfd.resolve();

                }).otherwise(function (err) {

                    dfd.reject(new Error('should never be hit'));

                });


                return dfd;
            }


        });


    });