# Unitpay
Module for checking and forming order for payment service unitpay.ru

# Installation
`npm install unitpay`

# Using
```js
var Unitpay = require('unitpay');

var u = new Unitpay({
    secretKey: '*******',
    publicKey: '*******'
});

// Generate merchat link
// return https://unitpay.ru/pay/PUBLIC-KEY?account=1&currency=RUB&desc=My%20order&sum=9.99&sign=28d805dda90673c1bdb20d7ee5c9fc9c
u.merchantUrl({sum: 9.99, account: 1, desc: 'My order', currency: 'RUB', ocale: 'ru'});

// Check payment
// return true if success else return false
u.checkPayment(req.query.params);
```

# Express example
```js
app.get('/result', function(req, res, next) {
    var method = req.query.method;
    var order = req.query.params;

    if (!u.checkPayment(order)) {
        return next(new Error('Incorrect order signature.')); 
    }

    // Methods handling...
})
```