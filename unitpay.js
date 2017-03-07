const crypto = require('crypto');
const https  = require('https');
const qs     = require('qs');

class UnitPay {
	constructor(opts = {}) {
		this.supportedCurrencies = ['EUR','UAH', 'BYR', 'USD','RUB'];
		this.supportedMethods = ['initPayment', 'getPayment', 'massPayment'];
		this.requiredMethodsParams = {
			initPayment: ['desc', 'account', 'sum'],
			getPayment: ['paymentId'],
			massPayment: ['sum', 'purse', 'login', 'transactionId', 'paymentType'],
		};

		this.apiUrl    = 'https://unitpay.ru/api';
		this.formUrl   = 'https://unitpay.ru/pay/';
		this.secretKey = opts.secretKey;
		this.publicKey = opts.publicKey;
	}

	/**
	 * Create SHA-256 digital signature
	 * @param  {Object} params
	 * @param  {String} method
	 * @return {String}
	 */
	getSignature(params, method) {
		let keys = Object.keys(params).sort();
		removeArrayValue(keys, 'sign');
		removeArrayValue(keys, 'signature');

		let data = [];

		if (method) data.push(method);

		keys.forEach(v => data.push(params[v]));
		data.push(this.secretKey);

		return hash(data.join('{up}'), 'sha256');
	}

	/**
	 * Get URL for pay through the form
	 * @param  {Number} sum
	 * @param  {String} account
	 * @param  {String} desc
	 * @param  {String} currency
	 * @param  {String} locale
	 * @return {String}
	 */
	form(sum, account, desc, currency = 'RUB', locale = 'ru') {
		let params = {
			account: account,
			currency: currency,
			desc: desc,
			sum: sum
		};

		if (this.supportedCurrencies.indexOf(currency) < 0) {
			throw new Error('Unsupported currency ' + currency);
		}

		if (this.secretKey) {
			params.signature = this.getSignature(params);
		}

		params.locale = locale;
		return this.formUrl + this.publicKey + '?' + qs.stringify(params);
	}

	/**
	 *Call API
	 * @param  {String} method
	 * @param  {Object} params
	 * @param  [Function] callback
	 * @return {Promise}
	 */
	api(method, params = {}, callback = null) {
		if (this.supportedMethods.indexOf(method) < 0) {
			throw new Error('Method is not supported');
		}

		if (params.currency && this.supportedCurrencies.indexOf(params.currency) < 0) {
			throw new Error('Unsupported currency ' + params.currency);
		}

		if (this.requiredMethodsParams[method]) {
			this.requiredMethodsParams[method].forEach(v => {
				if (typeof params[v] === 'undefined') {
					throw new Error('Param ' + v + ' is undefined');
				}
			});
		}

		params.secretKey = this.secretKey;

		if (typeof params.secretKey !== 'string' || params.secretKey === '') {
			throw new Error('SecretKey is null');
		}

		let requestUrl = this.apiUrl + '?' + qs.stringify({
			method: method,
			params: params
		});

		let promise = new Promise((resolve, reject) => {
			https.get(requestUrl, (res) => {
				res.setEncoding('utf8');
				let rawData = '';

				res.on('data', (chunk) => rawData += chunk);
				res.on('end', () => {
					try {
						let parse = JSON.parse(rawData);
						if (parse.error) return reject(parse.error);
						resolve(parse)
					} catch (err) {
						reject(err);
					}
				});
			}).on('error', reject);
		});

		if (callback) {
			promise.then(callback.bind(null, null), callback);
		}

		return promise;
	}

	/**
	 * Response for UnitPay if handle success
	 * @param  {String} message
	 * @return {Object}
	 */
	static getSuccessHandlerResponse(message) {
		return {
			result: {
				message: message
			}
		}
	}

	/**
	 * Response for UnitPay if handle error
	 * @param  {String} message
	 * @return {Object}
	 */
	static getErrorHandlerResponse(message) {
		return {
			error: {
				message: message
			}
		}
	}

}

// Method to hash data
function hash(data, hash = 'sha256') {
	return crypto.createHash(hash)
		.update(data, 'utf8')
		.digest('hex');
}

// Method to remove array element by value
function removeArrayValue(arr, value) {
	let index = arr.indexOf(value);
	if (index >= 0) {
		arr.splice( index, 1 );
	}

	return arr;
}

module.exports = UnitPay;