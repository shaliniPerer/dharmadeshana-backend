const { GetCommand, PutCommand, UpdateCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

class Danweem {
  static async create(danweemData) {
    const danweemId = uuidv4();
    const danweem = {
      danweemId,
      submitterPhone: danweemData.phoneNumber,
      theroName: danweemData.theroName,
      title: danweemData.title,
      description: danweemData.description || '',
      mediaType: danweemData.mediaType, // 'video' or 'image'
      mediaUrl: danweemData.mediaUrl,
      thumbnailUrl: danweemData.thumbnailUrl || '',
      proofDocumentUrl: danweemData.proofDocumentUrl || '', // Proof document
      status: danweemData.status || 'pending', // pending, approved, rejected
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "danweem",
        Item: danweem,
      })
    );

    return danweem;
  }

  static async getById(danweemId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "danweem",
        Key: { danweemId },
      })
    );
    return result.Item;
  }

  static async getByStatus(status) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "danweem",
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

  static async getByUser(phoneNumber) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "danweem",
        FilterExpression: "submitterPhone = :phone",
        ExpressionAttributeValues: {
          ":phone": phoneNumber,
        },
      })
    );
    return result.Items || [];
  }

  static async getAll() {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "danweem",
      })
    );
    return result.Items || [];
  }

  static async updateStatus(danweemId, status) {
    await dynamodb.send(
      new UpdateCommand({
        TableName: "danweem",
        Key: { danweemId },
        UpdateExpression: "SET #status = :status, updatedAt = :time",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":time": Date.now(),
        },
      })
    );
  }

  static async delete(danweemId) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: "danweem",
        Key: { danweemId },
      })
    );
  }
}

module.exports = Danweem;
