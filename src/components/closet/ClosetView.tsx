'use client'

import React, { useState, useEffect } from 'react'
import { ClothingItem } from '@/types/clothing'
import { getUserClothing, deleteClothingItem, groupClothingByType } from '@/lib/closet'
import { ClosetItem } from './ClosetItem'
import { ItemDetailModal } from './ItemDetailModal'
import { ImageUpload } from './ImageUpload'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shirt, Package, Loader2 } from 'lucide-react'

export function ClosetView() {
  const { user } = useAuth()
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user) {
      loadItems()
    }
  }, [user])

  const loadItems = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userItems = await getUserClothing(user.uid)
      setItems(userItems)
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (item: ClothingItem) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await deleteClothingItem(item)
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  const handleViewItem = (item: ClothingItem) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleItemAdded = (newItem: ClothingItem) => {
    setItems(prev => [newItem, ...prev])
  }

  const groupedItems = groupClothingByType(items)
  const garmentTypes = ['all', 'top', 'bottom', 'footwear', 'outerwear', 'accessory']

  const getItemsForTab = (tab: string) => {
    return tab === 'all' ? items : groupedItems[tab] || []
  }

  const getTabLabel = (type: string) => {
    const labels = {
      all: 'All Items',
      top: 'Tops',
      bottom: 'Bottoms',
      footwear: 'Footwear',
      outerwear: 'Outerwear',
      accessory: 'Accessories',
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your closet...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                My Closet ({items.length} items)
              </CardTitle>
              <CardDescription>
                Manage your clothing collection and view color analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  {garmentTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="text-xs">
                      {getTabLabel(type)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {garmentTypes.map(type => (
                  <TabsContent key={type} value={type} className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {getItemsForTab(type).map(item => (
                        <ClosetItem
                          key={item.id}
                          item={item}
                          onDelete={handleDeleteItem}
                          onView={handleViewItem}
                        />
                      ))}
                    </div>
                    
                    {getItemsForTab(type).length === 0 && (
                      <div className="text-center py-12">
                        <Shirt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No {type === 'all' ? 'items' : getTabLabel(type).toLowerCase()}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {type === 'all' 
                            ? 'Start building your digital closet by adding your first item.'
                            : `Add some ${getTabLabel(type).toLowerCase()} to your closet.`
                          }
                        </p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
      </div>

      <div>
        <ImageUpload onItemAdded={handleItemAdded} />
      </div>
      
      <ItemDetailModal
        item={selectedItem}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
