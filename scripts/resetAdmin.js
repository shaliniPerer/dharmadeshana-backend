require('dotenv').config({ path: './.env' });
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require('../config/aws');
const Admin = require('../models/Admin');

const resetAdmin = async () => {
  try {
    const username = 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin@2026';
    
    console.log('Deleting existing admin...');
    
    // Delete existing admin
    await dynamodb.send(
      new DeleteCommand({
        TableName: "admins",
        Key: { username },
      })
    );
    
    console.log('Creating new admin with password from .env...');
    
    // Create new admin with correct password
    await Admin.create(username, password);
    
    console.log('Admin user reset successfully!');
    console.log('Username:', username);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error resetting admin user:', error);
  }
};

resetAdmin();
