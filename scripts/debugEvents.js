
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamodb = require("../config/aws");
const dotenv = require("dotenv");
dotenv.config();

const debugEvents = async () => {
  try {
    console.log("Scanning events table...");
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "dharma_events",
      })
    );
    
    const events = result.Items || [];
    console.log(`Found ${events.length} events.`);
    
    events.forEach(e => {
      console.log(`Event ID: ${e.eventId}`);
      console.log(`  Name: ${e.eventName}`);
      console.log(`  Status: ${e.status}`);
      console.log(`  Submitter: ${e.submitterName} (${e.submitterPhone})`);
      console.log(`  CreatedAt: ${e.createdAt}`);
      console.log(`  Sanwidanaya: ${e.sanwidanaya}`);
      console.log("-------------------");
    });
    
  } catch (error) {
    console.error("Error debugging events:", error);
  }
};

debugEvents();
