'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImageUpload from './ImageUpload';
import { ClosetItem } from './ClosetItem';
import { ItemDetailModal } from './ItemDetailModal';
import { ClothingItem } from '@/types/clothing';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export function ClosetView() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const q = query(
        collection(db, 'clothing'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list: ClothingItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          userId: data.userId,
          imageUrl: data.imageUrl,
          garmentType: data.garmentType,
          dominantColors: data.dominantColors,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          ...(data.primaryHex && { primaryHex: data.primaryHex }),
          ...(data.colorNames && { colorNames: data.colorNames }),
          ...(data.aiMatches && { aiMatches: data.aiMatches }),
          description: data.description || ''
        });
      });
      setItems(list);
      setLoading(false);
    })();
  }, [user]);

  const handleDelete = async (item: ClothingItem) => {
    await deleteDoc(doc(db, 'clothing', item.id));
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleView = (item: ClothingItem) => {
    setSelectedItem(item);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Closet</CardTitle>
        <CardDescription>Upload and manage your items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUpload onItemAdded={(item) => setItems((prev) => [item, ...prev])} />

        {loading && <div>Loading…</div>}
        {!loading && items.length === 0 && <div>No items yet.</div>}

        {items.map((item) => (
          <ClosetItem
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}

        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleClose}
        />
      </CardContent>
    </Card>
  );
}

export default ClosetView;
