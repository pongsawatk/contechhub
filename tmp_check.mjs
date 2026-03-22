import { Client } from "@notionhq/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function check() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_KPI_DB_ID,
      page_size: 1,
    });
    console.log("=== KPI Properties ===");
    console.log(Object.keys(response.results[0].properties));
    console.log(JSON.stringify(response.results[0].properties["Unit"], null, 2));

    const usersResponse = await notion.databases.query({
      database_id: process.env.NOTION_USERS_DB_ID,
      page_size: 1,
    });
    console.log("\n=== Users Properties ===");
    console.log(Object.keys(usersResponse.results[0].properties));
  } catch (error) {
    console.error(error.message);
  }
}

check();
