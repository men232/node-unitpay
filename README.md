# Unitpay
Module for checking and forming order for payment service **UnitPay.ru**

# Installation
`npm install unitpay`

# Using
```js
const UnitPay = require('unitpay');

var u = new UnitPay({
    secretKey: 'SECRET',
    publicKey: 'PUBLIC_KEY'
});

// Generate merchat link
let price = 10;
let orderId = 'SE-123Q-WE412';
let description = 'Awsome product';

// return
// https://unitpay.ru/pay/PUBLIC_KEY?account=SE-123Q-WE412&currency=RUB&desc=Awsome%20product&sum=10&signature=d3f05773a162c0f7f9e572b73eaec8d19918b8ffda6ab08aaf90154f6c46e8ba&locale=ru
let payLink = u.form(price, orderId, description);
```

# API

### UnitPay.form(sum, account, desc, [currency = 'RUB'], [locale = 'ru'])
**Description:** Get URL for pay through the form<br />
**Return:** {String}<br />

**Arguments:**
- `{Number}: sum` - Payment sum
- `{String}: account` - Unique service order id
- `{String}: currency` - Payment currecncy
- `{String}: locale` - Payment form language interface

### UnitPay.api(method, params = {}, [callback])
**Description:** Call API<br />
**Return:** {Promise}<br />

**Arguments:**
- `{String}: method` - API menthod name
- `{Object}: params` - method parameters
- `{Function}: callback` - callback function