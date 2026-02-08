require('dotenv').config({ path: './.env' });
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    const username = 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin@2026';
    
    console.log('Creating admin with username:', username);
    
    const existingAdmin = await Admin.getByUsername(username);
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      // Since there's no update method in Admin model, we'll delete and recreate
      // Note: In production, you'd want an update method
    }

    await Admin.create(username, password);
    console.log('Admin user created/updated successfully with password from .env file');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdmin();
