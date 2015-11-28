var crypto = require('crypto');

module.exports = Unitpay;

function Unitpay(opts) {
	this.secretKey = opts.secretKey;
	this.url = opts.url || 'https://unitpay.ru/pay/' + opts.publicKey;
}

Unitpay.prototype.merchantUrl = function(order) {
	/*
	 *  --- order data ---
	 * order.sum
	 * order.account
	 * order.desc
	 * order.currency
	 * order.locale
	 * order.message
	 *
	 */

	var crc = [order.account, order.currency, order.desc, order.sum];

	var query = {
		account: order.account,
		currency: order.currency,
		desc: order.desc,
		sum: order.sum,
	};

	if (order.locale) query.locale = order.locale;
	if (order.message) query.message = order.message;

	crc.push(this.secretKey);
	query.sign = hash(crc.join(''), 'md5');

	return this.url + '?' + queryStr(query);
};

Unitpay.prototype.checkPayment = function(params) {
	var str = '';
	var keys = Object.keys(params);

	for (var i = 0; i < keys.length; i++) {
		if (keys[i] === 'sign') continue;
		str += params[keys[i]];
	}

	var crc = hash(str + this.secretKey, 'md5');
	return crc === params.sign.toLowerCase();
};

function hash(data, type) {
	return crypto.createHash(type || 'sha1')
		.update(data)
		.digest('hex');
}

function queryStr(obj) {
	var ret = [],
		keys = Object.keys(obj),
		key;

	for (var i = 0, len = keys.length; i < len; ++i) {
		key = keys[i];
		if ('' === key) continue;
		ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
	}

	return ret.join('&');
}