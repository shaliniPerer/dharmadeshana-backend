const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const bcrypt = require('bcryptjs');

class Admin {
  static async getByUsername(username) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "admins",
        Key: { username },
      })
    );
    return result.Item;
  }

  static async create(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = {
      username,
      password: hashedPassword,
      createdAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "admins",
        Item: admin,
      })
    );

    return admin;
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = Admin;
