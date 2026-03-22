import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function check() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_KPI_DB_ID!,
      page_size: 1,
    });
    console.log("=== KPI Page Properties ===");
    console.log(JSON.stringify(response.results[0].properties, null, 2));

    const usersResponse = await notion.databases.query({
      database_id: process.env.NOTION_USERS_DB_ID!,
      page_size: 1,
    });
    console.log("\n=== Users & Access Page Properties ===");
    console.log(JSON.stringify(usersResponse.results[0].properties, null, 2));
  } catch (error) {
    console.error(error);
  }
}

check();
