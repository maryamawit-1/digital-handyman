const bcrypt = require('bcryptjs');
const plainPassword = 'password123';
bcrypt.hash(plainPassword, 10).then(hash => {
    console.log("-----------------------------------------");
    console.log("COPY THIS HASH AND PASTE INTO MYSQL:");
    console.log(hash);
    console.log("-----------------------------------------");
});