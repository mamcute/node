const crypto = require('crypto');
 
// Calling randomBytes method without callback
const buf = crypto.randomBytes(60);
 
// Prints random bytes of generated data
console.log("The random bytes of data generated is: "
    + buf.toString('hex'));