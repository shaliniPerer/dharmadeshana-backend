const { GetCommand, PutCommand, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

class Media {
  static async create(mediaData) {
    const mediaId = uuidv4();
    const media = {
      mediaId,
      phoneNumber: mediaData.phoneNumber,
      type: mediaData.type, // 'video' or 'image'
      title: mediaData.title,
      description: mediaData.description || '',
      url: mediaData.url,
      thumbnailUrl: mediaData.thumbnailUrl || '',
      theroName: mediaData.theroName || '',
      category: mediaData.category || 'dharma_deshana', // 'dharma_deshana' or 'idiri_deshana'
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "user_media",
        Item: media,
      })
    );

    return media;
  }

  static async getById(mediaId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "user_media",
        Key: { mediaId },
      })
    );
    return result.Item;
  }

  static async getByUser(phoneNumber) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "user_media",
        FilterExpression: "phoneNumber = :phone",
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
        TableName: "user_media",
      })
    );
    return result.Items || [];
  }

  static async getByCategory(category) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "user_media",
        FilterExpression: "category = :category",
        ExpressionAttributeValues: {
          ":category": category,
        },
      })
    );
    return result.Items || [];
  }

  static async delete(mediaId) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: "user_media",
        Key: { mediaId },
      })
    );
  }
}

module.exports = Media;
