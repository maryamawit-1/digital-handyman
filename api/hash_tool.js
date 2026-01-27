const bcrypt = require('bcryptjs');
const plainPassword = 'password123';
bcrypt.hash(plainPassword, 10).then(hash => console.log("NODE HASH:", hash));