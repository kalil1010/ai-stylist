'use client'

import React from 'react'
import { ClothingItem } from '@/types/clothing'
import { getColorName } from '@/lib/imageAnalysis'
import { X, Calendar, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ItemDetailModalProps {
  item: ClothingItem | null
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Item Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={item.imageUrl}
                alt={item.description || 'Clothing item'}
                className="w-full rounded-lg shadow-md"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {item.garmentType}
                </h3>
                {item.description && (
                  <p className="text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Dominant Colors</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {item.dominantColors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {getColorName(color)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {color.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Added</span>
                </div>
                <p className="text-sm text-gray-600">
                  {item.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              
              {item.brand && (
                <div>
                  <span className="font-medium">Brand:</span>
                  <span className="ml-2 text-gray-600">{item.brand}</span>
                </div>
              )}
              
              {item.season && item.season !== 'all' && (
                <div>
                  <span className="font-medium">Season:</span>
                  <span className="ml-2 text-gray-600 capitalize">{item.season}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}