import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CartItem, useCart } from '../store/useCart'
import { MenuItem } from '../hooks/useMenu'

interface Variant {
  id: string
  item_id: string
  group_label: string
  option_name: string
  price_delta: number
  sort_order: number
}

interface VariantPickerProps {
  item: MenuItem
  onClose: () => void
}

export default function VariantPicker({ item, onClose }: VariantPickerProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [selections, setSelections] = useState<Record<string, Variant>>({})
  const cart = useCart()

  useEffect(() => {
    let active = true
    async function fetchVariants() {
      setLoading(true)
      const { data } = await supabase
        .from('menu_item_variants')
        .select('*')
        .eq('item_id', item.id)
        .order('sort_order')
      if (active) {
        setVariants(data ?? [])
        setLoading(false)
      }
    }
    fetchVariants()
    return () => {
      active = false
    }
  }, [item.id])

  // Group variants by group_label
  const groups = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.group_label]) acc[v.group_label] = []
    acc[v.group_label].push(v)
    return acc
  }, {})

  const groupNames = Object.keys(groups)
  const allSelected = groupNames.every(groupName => selections[groupName] !== undefined)

  function handleSelect(groupName: string, variant: Variant) {
    setSelections(prev => ({
      ...prev,
      [groupName]: variant
    }))
  }

  function handleAddToCart() {
    if (!allSelected) return

    // Build the consolidated variant label (e.g. "Aloo Stuffed")
    // If there is only one group, it's just the option name.
    const selectedVariants = groupNames.map(name => selections[name])
    const variantLabel = selectedVariants.map(v => v.option_name).join(', ')
    
    // Calculate final price with price deltas
    const extraCost = selectedVariants.reduce((sum, v) => sum + (v.price_delta || 0), 0)
    const finalPrice = item.base_price + extraCost

    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      qty: 1,
      variant_label: variantLabel
    }

    cart.add(cartItem)
    onClose()
  }

  return (
    <>
      <div className="backdrop show" onClick={onClose} />
      <div className="sheet show">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div className="sheet-title">Customize {item.name}</div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-gray-500">Loading choices...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {groupNames.map(groupName => (
                <div key={groupName} className="variant-group">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '8px' }}>
                    {groupName} *
                  </h3>
                  <div className="space-y-2">
                    {groups[groupName].map(variant => {
                      const isSelected = selections[groupName]?.id === variant.id
                      return (
                        <label
                          key={variant.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-600 bg-green-50/50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid var(--forest)' : '1px solid var(--parchment-deep)',
                            background: isSelected ? 'rgba(45, 80, 22, 0.05)' : 'transparent',
                            marginBottom: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="radio"
                              name={groupName}
                              checked={isSelected}
                              onChange={() => handleSelect(groupName, variant)}
                              style={{ accentColor: 'var(--forest)' }}
                            />
                            <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--ink)' }}>
                              {variant.option_name}
                            </span>
                          </div>
                          {variant.price_delta > 0 && (
                            <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--sage)' }}>
                              +₹{variant.price_delta}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sheet-footer">
          <button
            type="button"
            className="btn-main"
            disabled={!allSelected || loading}
            onClick={handleAddToCart}
            style={{
              opacity: allSelected ? 1 : 0.6,
              cursor: allSelected ? 'pointer' : 'not-allowed'
            }}
          >
            Add to Cart
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
