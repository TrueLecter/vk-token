# vk-token
Node js module to easily get vk token from login and password.

## Usage
Request is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

```js
var vktoken = require('vk-token');

vktoken.getAccessToken(usename, password, function(error, token){
	console.log(token);
});
```