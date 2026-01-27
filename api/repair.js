const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function repairAdmin() {
    const plainPassword = 'admin123';
    
    try {
        console.log("Generating fresh hash...");
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(plainPassword, salt);
        
        console.log(`New Hash generated: ${newHash}`);

        const [result] = await db.execute(
            'UPDATE admins SET password = ? WHERE username = ?',
            [newHash, 'admin_user']
        );

        if (result.affectedRows > 0) {
            console.log("✅ SUCCESS: Database updated with the new hash.");
            console.log("You can now login with password: admin123");
        } else {
            console.log("❌ FAILED: User 'admin_user' not found in database.");
        }
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    } finally {
        process.exit();
    }
}

repairAdmin();