/**
 * Created by athroener on 2/21/14.
 */
"use strict";

var http = require('http');
var https = require('https');
var querystring = require('querystring');
//Remove escape from query string
querystring.escape = function (str) { return str; };
var _ = require('underscore');
//var uuid = require('node-uuid');

module.exports = function () {
	var sdk_version = '0.6.4';
	//var user_agent = 'PayPalSDK/paypal-payflow-sdk ' + sdk_version + ' (node ' + process.version + '-' + process.arch + '-' + process.platform  + ')';
	var default_options = {
	    schema: 'https',
	    host: 'payflowpro.paypal.com',
	    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout: 30000
    };



    function configure(options) {
        default_options =  _.extend(default_options, options);
    }

    function executeHttp(data, cb) {

        var error = null;
        var query = _.clone(default_options.credentials);
        query = _.extend(query, data);

        var string = querystring.stringify(query);

        var options = {
            hostname: default_options.host,
            port: 443,
            method: 'POST',
            headers: _.extend(default_options.headers, {'Content-Length': string.length})
        };

        var req = https.request(options, function (res) {
            var body = '';



            res.on('data', function (chunk) {
                body += chunk;

            });
            res.on('end', function () {

                var response = querystring.parse(body);

                if (response.RESULT !== "0") {
                    error = new Error(body);
                }

                var ret = {
                    submit: {
                        endpoint: 'https://' + default_options.host,
                        raw: string,
                        decoded: query
                    },
                    response: {
                        endpoint: 'https://' + default_options.host,
                        raw: body,
                        decoded: querystring.parse(body)
                    }
                };

                cb(error, ret);
            });
        });
        req.end(string);
        req.on('error', function (e) {
            //console.log('problem with request: ' + e.message);
            cb(e, null);
        });

        req.on('socket', function (socket) {
            socket.setTimeout(default_options.timeout);
            socket.on('timeout', function () {
                req.abort();
            });
        });

    }

    return {
        version: sdk_version,
        configure: function (options) {
            configure(options);
        },

        execute:   function (data, cb) {
            executeHttp(data, cb);
        },



        getModel: function (model) {

            switch (model) {

            case "sale":
                return require('../models/DirectPayments/sale')();


            case "authorization":
                return require('../models/DirectPayments/authorization')();


            case "capture":
                return require('../models/DirectPayments/capture')();


            case "reference":
                return require('../models/DirectPayments/reference')();


            case "refund":
                return require('../models/DirectPayments/refund')();

            case "nonreferencedcredit":
                return require('../models/DirectPayments/nonreferencedcredit')();


            case "void":
                return require('../models/DirectPayments/void')();

            case "setexpresscheckout":
                return require('../models/ExpressCheckout/setexpresscheckout')();

            case "setexpresscheckoutrb":
                return require('../models/ExpressCheckout/RecurringBilling/setexpresscheckout');

            case "setexpresscheckoutba":
                return require('../models/ExpressCheckout/BillingAgreements/setexpresscheckout');

            case "getexpresscheckout":
                return require('../models/ExpressCheckout/getexpresscheckout')();

            case "doexpresscheckout":
                return require('../models/ExpressCheckout/doexpresscheckout')();

            case "createrecurringbillingprofile":
                return require('../models/RecurringBilling/createRecurringBillingProfile')();

            case "eccreaterecurringbillingprofile":
                return require('../models/RecurringBilling/createRecurringBillingProfile')('ec');

            case "convertrecurringbillingprofile":
                return require('../models/RecurringBilling/convertRecurringBillingProfile')();

            case "ecconvertrecurringbillingprofile":
                return require('../models/RecurringBilling/convertRecurringBillingProfile')('ec');

            case "cancelrecurringbillingprofile":
                return require('../models/RecurringBilling/cancelRecurringBillingProfile')();

            case "modifyrecurringbillingprofile":
                return require('../models/RecurringBilling/modifyRecurringBillingProfile')();

            default:
                throw new Error(model + ":Model not defined.");

            }

        }
    };
};
