'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getMatchingColors, analyzeImageColors } from '@/lib/imageAnalysis';
import { useToast } from '@/components/ui/toast';
import { ClothingItem } from '@/types/clothing';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { savePaletteForUser } from '@/lib/palette';

interface ImageUploadProps {
  onItemAdded?: (item: ClothingItem) => void;
}

export function ImageUpload({ onItemAdded }: ImageUploadProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [aiRichMatches, setAiRichMatches] = useState<any | null>(null);
  const [plan, setPlan] = useState<{ top?: string; bottom?: string; outerwear?: string; footwear?: string; accessory?: string }>({});
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ... other handlers and helpers unchanged ...

  const handleUpload = async () => {
    if (!selectedFile || !user || !analysis) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `closet/${user.uid}/${Date.now()}_${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const clothingItem: Omit<ClothingItem, 'id'> = {
        userId: user.uid,
        imageUrl,
        garmentType: analysis.garmentType,
        dominantColors: analysis.dominantColors,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'clothing'), clothingItem);
      onItemAdded?.({ id: docRef.id, ...clothingItem });
      setSelectedFile(null);
      setPreview(null);
      setAnalysis(null);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ variant: 'error', title: 'Failed to add to closet' });
    } finally {
      setUploading(false);
    }
  };

  const savePalette = async () => {
    if (!user || !analysis || !aiRichMatches) {
      toast({ variant: 'error', title: 'Nothing to save' });
      return;
    }
    try {
      await savePaletteForUser(
        {
          baseHex: analysis.dominantColors[0] || aiRichMatches.base,
          dominantHexes: analysis.dominantColors,
          richMatches: aiRichMatches,
          plan: plan,
          source: 'closet'
        },
        user.uid
      );
      toast({ variant: 'success', title: 'Saved palette to profile' });
    } catch (e: any) {
      toast({ variant: 'error', title: 'Save failed', description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Add Clothing Item
        </CardTitle>
        <CardDescription>
          Upload a photo for color and AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-dashed border-2 p-6 text-center">
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
          ) : (
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setSelectedFile(f);
              setPreview(URL.createObjectURL(f));
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            {preview ? 'Change Image' : 'Select Image'}
          </Button>
        </div>

        <Button
          onClick={async () => {
            if (!selectedFile) return;
            // existing analyze logic...
          }}
          disabled={analyzing}
        >
          {analyzing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Analyze'}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Adding to Closet...' : 'Add to Closet'}
            </Button>
            <Button variant="outline" onClick={savePalette}>
              Save Palette To Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ImageUpload;
