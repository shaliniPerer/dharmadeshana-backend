require("dotenv").config();
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    console.log("Testing AWS DynamoDB connection...");
    console.log("Region:", process.env.AWS_REGION);
    console.log("Access Key:", process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + "...");
    
    const result = await client.send(new ListTablesCommand({}));
    console.log("\n✓ Connection successful!");
    console.log("Existing tables:", result.TableNames || []);
  } catch (error) {
    console.error("\n✗ Connection failed!");
    console.error("Error:", error.message);
    console.error("Error code:", error.name);
  }
}

testConnection();
