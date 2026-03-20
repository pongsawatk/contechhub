'use client'

import type { CalculatorInput, ProductSelection, AddonItem, TopupSelection } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'
import HintBanner from './HintBanner'
import { calculate, itemAppliesTo } from '@/lib/pricing-engine'

interface StepPackageConfigProps {
  input: CalculatorInput
  pricingItems: PricingItem[]
  onChange: (patch: Partial<CalculatorInput>) => void
}

const PRODUCT_COLORS: Record<string, string> = {
  'Builk Insite': '#378ADD',
  'Builk 360': '#1D9E75',
  Kwanjai: '#7F77DD',
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

// ── TopupRow Component ─────────────────────────────────────────────────
interface TopupRowProps {
  item: PricingItem
  currentQuantity: number
  onChange: (qty: number) => void
}

function TopupRow({ item, currentQuantity, onChange }: TopupRowProps) {
  if (item.quantityEnabled) {
    // Quantity stepper mode
    const maxQty = item.maxQuantity > 0 ? item.maxQuantity : 99
    return (
      <div className="space-y-1">
        <div
          className="flex items-center justify-between p-3 rounded-xl transition-all"
          style={{
            background: currentQuantity > 0 ? 'rgba(74, 222, 128, 0.08)' : 'rgba(10, 30, 70, 0.35)',
            border: currentQuantity > 0
              ? '1px solid rgba(74, 222, 128, 0.3)'
              : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-white text-sm font-medium truncate">{item.packageName}</p>
            <p className="text-white/45 text-xs mt-0.5">
              {formatTHB(item.price)} บ. / {item.quantityUnit || 'หน่วย'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {currentQuantity > 0 && (
              <p className="text-[#4ade80] text-sm tabular-nums font-medium">
                = {formatTHB(item.price * currentQuantity)} บ.
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange(Math.max(0, currentQuantity - 1))}
                disabled={currentQuantity === 0}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: currentQuantity === 0 ? 'rgba(255,255,255,0.25)' : 'white',
                  cursor: currentQuantity === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                −
              </button>
              <span className="text-white font-semibold w-6 text-center tabular-nums text-sm">
                {currentQuantity}
              </span>
              <button
                onClick={() => onChange(Math.min(maxQty, currentQuantity + 1))}
                disabled={item.maxQuantity > 0 && currentQuantity >= item.maxQuantity}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: (item.maxQuantity > 0 && currentQuantity >= item.maxQuantity)
                    ? 'rgba(255,255,255,0.25)'
                    : 'white',
                  cursor: (item.maxQuantity > 0 && currentQuantity >= item.maxQuantity)
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
        {item.maxQuantity > 0 && (
          <p className="text-white/30 text-[11px] pl-1">
            สูงสุด {item.maxQuantity} {item.quantityUnit}
          </p>
        )}
      </div>
    )
  }

  // Checkbox mode (same style as add-ons)
  const isSelected = currentQuantity > 0
  return (
    <button
      onClick={() => onChange(isSelected ? 0 : 1)}
      className="w-full text-left rounded-xl p-3 transition-all"
      style={{
        background: isSelected ? 'rgba(74, 222, 128, 0.08)' : 'rgba(10, 30, 70, 0.35)',
        border: isSelected
          ? '1.5px solid rgba(74, 222, 128, 0.3)'
          : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px]"
            style={{
              background: isSelected ? 'rgba(74, 222, 128, 0.85)' : 'rgba(255,255,255,0.08)',
              border: isSelected ? '1px solid rgba(74, 222, 128, 0.9)' : '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {isSelected && <span className="text-white">✓</span>}
          </div>
          <span className="text-white/85 text-sm">{item.packageName}</span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white/70 text-sm font-medium">{formatTHB(item.price)}</p>
          <p className="text-white/35 text-xs">บ./ปี</p>
        </div>
      </div>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function StepPackageConfig({ input, onChange, pricingItems }: StepPackageConfigProps) {
  const breakdown = calculate(input)

  function updateSelection(productId: string, patch: Partial<ProductSelection>) {
    onChange({
      selections: input.selections.map((s) =>
        s.product === productId ? { ...s, ...patch } : s
      ),
    })
  }

  function handleTopupChange(product: string, item: PricingItem, qty: number) {
    const sel = input.selections.find((s) => s.product === product)
    if (!sel) return
    const existing = (sel.topups ?? []).find((t) => t.itemId === item.id)
    let newTopups: TopupSelection[]
    if (qty === 0) {
      newTopups = (sel.topups ?? []).filter((t) => t.itemId !== item.id)
    } else if (existing) {
      newTopups = (sel.topups ?? []).map((t) =>
        t.itemId === item.id ? { ...t, quantity: qty } : t
      )
    } else {
      newTopups = [...(sel.topups ?? []), {
        itemId: item.id,
        itemName: item.packageName,
        quantity: qty,
        unitPrice: item.price,
        billing: item.billing || 'ราย ปี',
        quantityUnit: item.quantityUnit,
      }]
    }
    updateSelection(product, { topups: newTopups })
  }

  function getCurrentTopupQty(sel: ProductSelection, itemId: string): number {
    return (sel.topups ?? []).find((t) => t.itemId === itemId)?.quantity ?? 0
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">เลือกแพ็กเกจ</h3>
        <p className="text-white/45 text-sm">เลือกแพ็กเกจและ Add-on สำหรับแต่ละสินค้า</p>
      </div>

      {input.selections.map((sel) => {
        const color = PRODUCT_COLORS[sel.product] ?? '#38bdf8'

        // Filter packages for this product & lane
        const packages = pricingItems.filter(
          (item) =>
            item.product === sel.product &&
            item.type === 'Package' &&
            (item.lane === input.lane || item.lane === 'Both' || item.lane === '')
        )

        // Filter add-ons for this product
        const addons = pricingItems.filter(
          (item) =>
            item.product === sel.product &&
            item.type === 'Add-on' &&
            (item.lane === input.lane || item.lane === 'Both' || item.lane === '')
        )

        // Filter applicable top-ups for this product & selected package
        const applicableTopups = pricingItems.filter(
          (item) =>
            item.product === sel.product &&
            item.type === 'Top-up' &&
            itemAppliesTo(item, sel.packageName)
        )

        const isProfessional = sel.packageName.toLowerCase().includes('professional')
        const INCLUDED_IN_PRO = [
          'Defect Management',
          'Line of Approval',
          'Report Designer',
          'Checklist Form',
        ]

        function handlePackageSelect(pkg: PricingItem) {
          // When switching package, clear add-ons and topups
          updateSelection(sel.product, {
            packageId: pkg.id,
            packageName: pkg.packageName,
            packagePrice: pkg.price,
            packageBilling: pkg.billing || 'ราย ปี',
            addonIds: [],
            addons: [],
            topups: [],
          })
        }

        function handleAddonToggle(addon: PricingItem) {
          if (isProfessional && INCLUDED_IN_PRO.includes(addon.packageName)) return
          const isSelected = sel.addonIds.includes(addon.id)
          if (isSelected) {
            updateSelection(sel.product, {
              addonIds: sel.addonIds.filter((id) => id !== addon.id),
              addons: sel.addons.filter((a) => a.id !== addon.id),
            })
          } else {
            const newAddon: AddonItem = {
              id: addon.id,
              name: addon.packageName,
              price: addon.price,
              billing: addon.billing || 'ราย ปี',
            }
            updateSelection(sel.product, {
              addonIds: [...sel.addonIds, addon.id],
              addons: [...sel.addons, newAddon],
            })
          }
        }

        // Handle Productivity Pack upgrade hint CTA
        function handleHintAction() {
          const productivityPack = pricingItems.find(
            (item) =>
              item.product === 'Builk Insite' &&
              item.packageName.toLowerCase().includes('productivity pack')
          )
          if (productivityPack) {
            updateSelection(sel.product, {
              addonIds: [productivityPack.id],
              addons: [
                {
                  id: productivityPack.id,
                  name: productivityPack.packageName,
                  price: productivityPack.price,
                  billing: productivityPack.billing || 'ราย ปี',
                },
              ],
            })
          } else {
            // Fallback: clear addons and note
            updateSelection(sel.product, { addonIds: [], addons: [] })
          }
        }

        return (
          <div
            key={sel.product}
            className="rounded-2xl p-5 space-y-5"
            style={{
              background: hexToRgba(color, 0.06),
              border: `1px solid ${hexToRgba(color, 0.25)}`,
            }}
          >
            {/* Product header */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <h4 className="text-white font-semibold text-sm">{sel.product}</h4>
            </div>

            {/* Package Radio Cards */}
            {packages.length > 0 ? (
              <div className="space-y-2">
                <p className="text-white/50 text-xs uppercase tracking-wide">แพ็กเกจ</p>
                <div className="space-y-2">
                  {packages.map((pkg) => {
                    const isSelected = sel.packageId === pkg.id
                    const isBestValue = pkg.packageName
                      .toLowerCase()
                      .includes('professional')

                    return (
                      <button
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg)}
                        className="w-full text-left rounded-xl p-3.5 transition-all"
                        style={{
                          background: isSelected
                            ? hexToRgba(color, 0.18)
                            : 'rgba(10, 30, 70, 0.4)',
                          border: isSelected
                            ? `1.5px solid ${hexToRgba(color, 0.6)}`
                            : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Radio dot */}
                            <div
                              className="w-4 h-4 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: isSelected
                                  ? `2px solid ${color}`
                                  : '2px solid rgba(255,255,255,0.25)',
                              }}
                            >
                              {isSelected && (
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: color }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-sm font-medium">
                                  {pkg.packageName}
                                </span>
                                {isBestValue && (
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: hexToRgba(color, 0.3),
                                      color,
                                    }}
                                  >
                                    Best Value
                                  </span>
                                )}
                              </div>
                              {pkg.activeSlots > 0 && (
                                <p className="text-white/40 text-xs mt-0.5">
                                  {pkg.activeSlots} Active Slots
                                </p>
                              )}
                              {pkg.keyInclusions.length > 0 && (
                                <p className="text-white/35 text-xs mt-1 line-clamp-2">
                                  {pkg.keyInclusions.slice(0, 3).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white font-semibold text-sm">
                              {formatTHB(pkg.price)}
                            </p>
                            <p className="text-white/40 text-xs">บ./ปี</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-4 text-center text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-white/40">ไม่มีแพ็กเกจสำหรับ Lane นี้</p>
              </div>
            )}

            {/* Add-on Checkboxes */}
            {sel.packageId && addons.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/50 text-xs uppercase tracking-wide">Add-ons</p>
                <div className="space-y-2">
                  {addons.map((addon) => {
                    const isIncludedInPro =
                      isProfessional && INCLUDED_IN_PRO.includes(addon.packageName)
                    const isSelected = sel.addonIds.includes(addon.id)

                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon)}
                        disabled={isIncludedInPro}
                        className="w-full text-left rounded-xl p-3 transition-all disabled:cursor-not-allowed"
                        style={{
                          background: isIncludedInPro
                            ? 'rgba(255,255,255,0.03)'
                            : isSelected
                            ? hexToRgba(color, 0.12)
                            : 'rgba(10, 30, 70, 0.35)',
                          border: isIncludedInPro
                            ? '1px solid rgba(255,255,255,0.06)'
                            : isSelected
                            ? `1.5px solid ${hexToRgba(color, 0.45)}`
                            : '1px solid rgba(255,255,255,0.07)',
                          opacity: isIncludedInPro ? 0.65 : 1,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {/* Checkbox */}
                            <div
                              className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px]"
                              style={{
                                background: isIncludedInPro
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : isSelected
                                  ? hexToRgba(color, 0.85)
                                  : 'rgba(255,255,255,0.08)',
                                border: isIncludedInPro
                                  ? '1px solid rgba(16, 185, 129, 0.4)'
                                  : isSelected
                                  ? `1px solid ${hexToRgba(color, 0.9)}`
                                  : '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              {(isSelected || isIncludedInPro) && (
                                <span className="text-white">✓</span>
                              )}
                            </div>
                            <span
                              className="text-sm"
                              style={{
                                color: isIncludedInPro
                                  ? 'rgba(255,255,255,0.4)'
                                  : 'rgba(255,255,255,0.85)',
                              }}
                            >
                              {addon.packageName}
                            </span>
                          </div>
                          {isIncludedInPro ? (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#6ee7b7',
                              }}
                            >
                              ✓ รวมในแพ็กเกจ
                            </span>
                          ) : (
                            <div className="text-right flex-shrink-0">
                              <p className="text-white/70 text-sm font-medium">
                                {formatTHB(addon.price)}
                              </p>
                              <p className="text-white/35 text-xs">บ./ปี</p>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top-up Section */}
            {sel.packageId && applicableTopups.length > 0 && (
              <div className="space-y-3">
                <p className="text-white/50 text-xs uppercase tracking-wide">ต้องการเพิ่มเติม?</p>
                <div className="space-y-3">
                  {applicableTopups.map((item) => (
                    <TopupRow
                      key={item.id}
                      item={item}
                      currentQuantity={getCurrentTopupQty(sel, item.id)}
                      onChange={(qty) => handleTopupChange(sel.product, item, qty)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hint Banners from engine */}
            {breakdown.hints
              .filter(
                (h) =>
                  h.payload &&
                  (h.payload as Record<string, unknown>)['product'] === sel.product
              )
              .map((hint, i) => (
                <HintBanner key={i} hint={hint} onAction={handleHintAction} />
              ))}
          </div>
        )
      })}
    </div>
  )
}
