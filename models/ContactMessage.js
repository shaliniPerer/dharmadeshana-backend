const { GetCommand, PutCommand, UpdateCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

class ContactMessage {
  static async create(messageData) {
    const messageId = uuidv4();
    const message = {
      messageId,
      name: messageData.name,
      phoneNumber: messageData.phoneNumber || '',
      email: messageData.email || '',
      subject: messageData.subject || '',
      message: messageData.message,
      status: 'pending', // pending, replied, resolved
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "contact_messages",
        Item: message,
      })
    );

    return message;
  }

  static async getById(messageId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "contact_messages",
        Key: { messageId },
      })
    );
    return result.Item;
  }

  static async getByStatus(status) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "contact_messages",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
      })
    );
    return result.Items || [];
  }

  static async getAll() {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "contact_messages",
      })
    );
    return result.Items || [];
  }

  static async updateStatus(messageId, status) {
    const result = await dynamodb.send(
      new UpdateCommand({
        TableName: "contact_messages",
        Key: { messageId },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": Date.now(),
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return result.Attributes;
  }

  static async delete(messageId) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: "contact_messages",
        Key: { messageId },
      })
    );
    return true;
  }
}

module.exports = ContactMessage;
