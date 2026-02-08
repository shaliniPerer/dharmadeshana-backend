const { PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");

class OTP {
  static async save(phoneNumber, otp) {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await dynamodb.send(
      new PutCommand({
        TableName: "otp_codes",
        Item: {
          phoneNumber,
          otp,
          expiresAt,
          attempts: 0,
          createdAt: Date.now(),
        },
      })
    );
  }

  static async get(phoneNumber) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: "otp_codes",
        Key: { phoneNumber },
      })
    );
    return result.Item;
  }

  static async delete(phoneNumber) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: "otp_codes",
        Key: { phoneNumber },
      })
    );
  }

  static async verify(phoneNumber, otp) {
    const record = await this.get(phoneNumber);

    if (!record) {
      return { valid: false, message: "OTP not found" };
    }

    if (record.otp !== otp) {
      return { valid: false, message: "Invalid OTP" };
    }

    if (record.expiresAt < Date.now()) {
      return { valid: false, message: "OTP expired" };
    }

    await this.delete(phoneNumber);
    return { valid: true };
  }
}

module.exports = OTP;