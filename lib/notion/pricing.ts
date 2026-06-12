/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PricingItem } from "@/types/pricing"
import { notion, prop, richText, titleText, selectProp, numberProp } from "./client"

export async function getPricingPackages(isContechBU = false): Promise<PricingItem[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_PRICING_DB_ID!,
      filter: { property: "Visibility", select: { does_not_equal: "Hidden" } } as any,
      sorts: [
        { property: "Sort Order", direction: "ascending" },
        { property: "Price (THB)", direction: "ascending" },
      ],
    })
    return (response.results as any[])
      .map((page: any) => {
        const visibility = selectProp(prop(page, "Visibility"))
        if (visibility === "Internal Only" && !isContechBU) return null
        const packageName = titleText(prop(page, "Package Name"))
        if (packageName.startsWith("[DEPRECATED]")) return null
        return {
          id: page.id as string,
          packageName,
          product: selectProp(prop(page, "Product")) as PricingItem["product"],
          type: selectProp(prop(page, "Type")) as PricingItem["type"],
          price: numberProp(prop(page, "Price (THB)")),
          billing: selectProp(prop(page, "Billing")),
          activeSlots: numberProp(prop(page, "Active Slots")),
          keyInclusions: richText(prop(page, "Key Inclusions"))
            .split(" | ")
            .map((s: string) => s.trim())
            .filter(Boolean),
          targetProfile: richText(prop(page, "Target Profile")),
          lane: selectProp(prop(page, "Lane")) as PricingItem["lane"],
          notes: richText(prop(page, "Notes")),
          visibility: visibility as PricingItem["visibility"],
          sortOrder: prop(page, "Sort Order")?.number ?? 999,
          effectiveDate: prop(page, "Effective Date")?.date?.start ?? null,
          applicablePackages: (prop(page, "Applicable Packages")?.multi_select ?? [])
            .map((s: any) => s.name),
          quantityEnabled: prop(page, "Quantity Enabled")?.checkbox ?? false,
          quantityUnit: prop(page, "Quantity Unit")?.rich_text?.[0]?.plain_text ?? '',
          maxQuantity: prop(page, "Max Quantity")?.number ?? 0,
          enterprisePriceMin: prop(page, "Enterprise Price Min")?.number ?? null,
          enterprisePriceMax: prop(page, "Enterprise Price Max")?.number ?? null,
          enterpriseAnchorPrice: prop(page, "Enterprise Anchor Price")?.number ?? null,
          enterpriseBaseNote: prop(page, "Enterprise Base Note")?.rich_text?.[0]?.plain_text ?? '',
          enterprisePremiumNote: prop(page, "Enterprise Premium Note")?.rich_text?.[0]?.plain_text ?? '',
          isInfrastructure: prop(page, "Is Infrastructure")?.checkbox ?? false,
          showEnterpriseMatrix: prop(page, "Show Enterprise Matrix")?.checkbox ?? false,
          serviceCategory: prop(page, "Service Category")?.select?.name ?? null,
          implementationMode: prop(page, "Implementation Mode")?.select?.name ?? null,
          isMandatoryImplementation: prop(page, "Is Mandatory Implementation")?.checkbox ?? false,
        } as PricingItem
      })
      .filter(Boolean) as PricingItem[]
  } catch (error) {
    console.error("[Notion] getPricingPackages error:", error)
    return []
  }
}
