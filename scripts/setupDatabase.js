require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createTableIfNotExists(tableName, keySchema, attributeDefinitions) {
  try {
    // Check if table exists
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      })
    );
    console.log(`✓ Table '${tableName}' already exists`);
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      // Create the table
      try {
        await client.send(
          new CreateTableCommand({
            TableName: tableName,
            KeySchema: keySchema,
            AttributeDefinitions: attributeDefinitions,
            BillingMode: "PAY_PER_REQUEST",
          })
        );
        console.log(`✓ Table '${tableName}' created successfully`);
      } catch (createError) {
        console.error(`✗ Error creating table '${tableName}':`, createError.message);
      }
    } else {
      console.error(`✗ Error checking table '${tableName}':`, error.message);
    }
  }
}

async function setupDatabase() {
  console.log("Setting up DynamoDB tables...\n");

  // Create OTP codes table
  await createTableIfNotExists(
    "otp_codes",
    [{ AttributeName: "phoneNumber", KeyType: "HASH" }],
    [{ AttributeName: "phoneNumber", AttributeType: "S" }]
  );

  // Create Users table
  await createTableIfNotExists(
    "users",
    [{ AttributeName: "phoneNumber", KeyType: "HASH" }],
    [{ AttributeName: "phoneNumber", AttributeType: "S" }]
  );

  // Create Events table
  await createTableIfNotExists(
    "dharma_events",
    [{ AttributeName: "eventId", KeyType: "HASH" }],
    [{ AttributeName: "eventId", AttributeType: "S" }]
  );

  // Create User Media table
  await createTableIfNotExists(
    "user_media",
    [{ AttributeName: "mediaId", KeyType: "HASH" }],
    [{ AttributeName: "mediaId", AttributeType: "S" }]
  );

  // Create Admins table
  await createTableIfNotExists(
    "admins",
    [{ AttributeName: "username", KeyType: "HASH" }],
    [{ AttributeName: "username", AttributeType: "S" }]
  );

  // Create Danweem table
  await createTableIfNotExists(
    "danweem",
    [{ AttributeName: "danweemId", KeyType: "HASH" }],
    [{ AttributeName: "danweemId", AttributeType: "S" }]
  );

  // Create Contact Messages table (Paniwida)
  await createTableIfNotExists(
    "contact_messages",
    [{ AttributeName: "messageId", KeyType: "HASH" }],
    [{ AttributeName: "messageId", AttributeType: "S" }]
  );

  console.log("\n✓ Database setup complete!");
}

setupDatabase().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
