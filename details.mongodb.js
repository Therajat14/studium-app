// Run this in MongoDB for VS Code Playground
use('studium_db');

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "rollNumber": 1 }, { unique: true });