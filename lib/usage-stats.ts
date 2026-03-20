import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2026-03-11" });

export interface UsageSummary {
  totalQuotes: number;
  totalValue: number;
  averageValue: number;
  recentActivityCount: number;
}

export async function getUsageStats(): Promise<UsageSummary> {
  try {
    // @ts-expect-error - Custom data_source_id property is not in Notion SDK types
    const response = await (notion as any).dataSources.query({
      data_source_id: process.env.NOTION_QUOTES_DB_ID!,
    });

    // @ts-expect-error - Casting results to access properties
    const quotes = response.results as any[];
    const totalQuotes = quotes.length;
    
    let totalValue = 0;
    quotes.forEach((q) => {
      const price = q.properties["Final Price (THB)"]?.number ?? 0;
      totalValue += price;
    });

    // Mocking recent activity (e.g., last 7 days) for now
    // In a real app, you'd filter by date in the query
    const recentActivityCount = quotes.filter(q => {
      const createdTime = new Date(q.created_time).getTime();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return createdTime > sevenDaysAgo;
    }).length;

    return {
      totalQuotes,
      totalValue,
      averageValue: totalQuotes > 0 ? totalValue / totalQuotes : 0,
      recentActivityCount,
    };
  } catch (error) {
    console.error("[Usage] getUsageStats error:", error);
    return {
      totalQuotes: 0,
      totalValue: 0,
      averageValue: 0,
      recentActivityCount: 0,
    };
  }
}
