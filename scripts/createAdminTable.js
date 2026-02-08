require('dotenv').config({ path: './.env' });
const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");
const dynamodb = require("../config/aws");

const createAdminTable = async () => {
  const params = {
    TableName: "admins",
    KeySchema: [{ AttributeName: "username", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "username", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const data = await dynamodb.send(new CreateTableCommand(params));
    console.log("Table created successfully:", data);
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
        console.log("Table 'admins' already exists.");
    } else {
        console.error("Error creating table:", err);
    }
  }
};

createAdminTable();
