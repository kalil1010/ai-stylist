'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SavedPalette } from '@/types/palette'
import { Trash2 } from 'lucide-react'

export function MyPalettes() {
  const { user } = useAuth()
  const [items, setItems] = useState<SavedPalette[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      if (!user) return
      setLoading(true)
      try {
        const q = query(
          collection(db, 'palettes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const list: SavedPalette[] = []
        snap.forEach((d) => {
          const data: any = d.data()
          list.push({
            id: d.id,
            userId: data.userId,
            baseHex: data.baseHex,
            dominantHexes: data.dominantHexes || [],
            richMatches: data.richMatches || null,
            plan: data.plan || {},
            source: data.source || 'analyzer',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          })
        })
        setItems(list)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const remove = async (id: string) => {
    if (!confirm('Remove this saved palette?')) return
    await deleteDoc(doc(db, 'palettes', id))
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const Row = ({ label, colors }: { label: string; colors: string[] }) => (
    <div className="grid grid-cols-[7rem,1fr] items-center gap-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="flex overflow-hidden rounded-md border h-8">
        {colors.map((hex, i) => (
          <div key={hex + i} className="flex-1" style={{ backgroundColor: hex }} title={hex} />
        ))}
      </div>
    </div>
  )

  return (
    <Card className="max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>My Palettes</CardTitle>
        <CardDescription>Saved color suggestions and outfit plans</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-600">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-600">No saved palettes yet. Build one in the Analyzer or Closet and click “Save to Profile”.</div>
        )}
        <div className="space-y-5">
          {items.map((p) => (
            <div key={p.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Saved {p.createdAt.toLocaleString()} | Source: {p.source}</div>
                <Button variant="outline" size="sm" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
              <div className="space-y-2">
                <Row label="Base" colors={[p.baseHex]} />
                {p.richMatches && (
                  <>
                    <Row label="Analogous" colors={p.richMatches.analogous || []} />
                    <Row label="Complementary" colors={[p.richMatches.complementary].filter(Boolean)} />
                    <Row label="Split Complementary" colors={p.richMatches.splitComplementary || []} />
                    <Row label="Triadic" colors={p.richMatches.triadic || []} />
                    <Row label="Tetradic" colors={p.richMatches.tetradic || []} />
                    <Row label="Monochrome" colors={p.richMatches.monochrome || []} />
                    <Row label="Neutrals" colors={p.richMatches.neutrals || []} />
                  </>
                )}
              </div>
              {p.plan && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                  {(['top','bottom','outerwear','footwear','accessory'] as const).map((k) => (
                    <div key={k} className="rounded border overflow-hidden">
                      <div className="px-2 py-1 text-xs capitalize">{k}</div>
                      <div className="h-8" style={{ backgroundColor: (p.plan as any)[k] || '#f3f4f6' }} title={(p.plan as any)[k] || ''} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

