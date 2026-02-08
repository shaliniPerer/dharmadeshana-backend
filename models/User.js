const { GetCommand, PutCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");

class User {
  static async getByPhone(phoneNumber) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "users",
        Key: { phoneNumber },
      })
    );
    return result.Item;
  }

  static async create(phoneNumber) {
    const user = {
      phoneNumber,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "users",
        Item: user,
      })
    );

    return user;
  }

  static async getOrCreate(phoneNumber) {
    let user = await this.getByPhone(phoneNumber);

    if (!user) {
      user = await this.create(phoneNumber);
    }

    return user;
  }

  static async setAdmin(phoneNumber, isAdmin) {
    await dynamodb.send(
      new UpdateCommand({
        TableName: "users",
        Key: { phoneNumber },
        UpdateExpression: "SET isAdmin = :admin, updatedAt = :time",
        ExpressionAttributeValues: {
          ":admin": isAdmin,
          ":time": Date.now(),
        },
      })
    );
  }

  static async getAll() {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "users",
      })
    );
    return result.Items || [];
  }
}

module.exports = User;