const { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

class Event {
  static async create(eventData) {
    const eventId = uuidv4();
    const event = {
      eventId,
      ...eventData,
      status: eventData.status || "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "dharma_events",
        Item: event,
      })
    );

    return event;
  }

  static async getById(eventId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "dharma_events",
        Key: { eventId },
      })
    );
    return result.Item;
  }

  static async getByStatus(status) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "dharma_events",
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

  static async getBySubmitter(submitterPhone) {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "dharma_events",
        FilterExpression: "submitterPhone = :phone",
        ExpressionAttributeValues: {
          ":phone": submitterPhone,
        },
      })
    );
    return result.Items || [];
  }

  static async updateStatus(eventId, status) {
    await dynamodb.send(
      new UpdateCommand({
        TableName: "dharma_events",
        Key: { eventId },
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

  static async update(eventId, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = { ":time": Date.now() };

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key];
      }
    });

    if (updateExpressions.length > 0) {
      updateExpressions.push("updatedAt = :time");
      
      await dynamodb.send(
        new UpdateCommand({
          TableName: "dharma_events",
          Key: { eventId },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    }
  }

  static async delete(eventId) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: "dharma_events",
        Key: { eventId },
      })
    );
  }

  static async getAll() {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "dharma_events",
      })
    );
    return result.Items || [];
  }
}

module.exports = Event;