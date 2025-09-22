'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeImageColors } from '@/lib/imageAnalysis';
import { savePaletteForUser } from '@/lib/palette';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ClothingItem } from '@/types/clothing';
import { OutfitColorPlan } from '@/types/palette';

export function ImageUpload({ onItemAdded }: { onItemAdded?: (item: ClothingItem) => void }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(null);
  const [analysis, setAnalysis] = useState<{ dominantColors: string[] }|null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [plan, setPlan] = useState<OutfitColorPlan>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Read file to data URL
  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  // Analyze handler
  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const dataUrl = await toDataUrl(file);
      // Rough local then AI analysis
      const rough = await analyzeImageColors(file, 'enhanced');
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, dominantHexes: rough.dominantColors })
      });
      if (!res.ok) throw new Error('Analysis failed');
      const ai = await res.json();
      setAnalysis({ dominantColors: Array.isArray(ai.dominantHexes) ? ai.dominantHexes : [] });
    } catch (e: any) {
      toast({ variant: 'error', title: 'Analyze failed', description: e.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload handler
  const uploadItem = async () => {
    if (!file || !analysis || !user) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `closet/${user.uid}/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      const item: Omit<ClothingItem, 'id'> = {
        userId: user.uid,
        imageUrl: url,
        garmentType: 'top',
        dominantColors: analysis.dominantColors,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'clothing'), item);
      onItemAdded?.({ id: docRef.id, ...item });
      setFile(null);
      setPreview(null);
      setAnalysis(null);
    } catch (e) {
      toast({ variant: 'error', title: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  // Save palette
  const savePalette = async () => {
    if (!user || !analysis) return;
    try {
      await savePaletteForUser(
        { baseHex: analysis.dominantColors[0], dominantHexes: analysis.dominantColors, richMatches: {}, plan, source: 'closet' },
        user.uid
      );
      toast({ variant: 'success', title: 'Palette saved' });
    } catch (e: any) {
      toast({ variant: 'error', title: 'Save failed', description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" /> Add to Closet
        </CardTitle>
        <CardDescription>Upload and analyze your clothing item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-dashed border-2 p-6 text-center">
          {preview ? (
            <img src={preview} className="mx-auto max-h-48" />
          ) : (
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f);
              setPreview(URL.createObjectURL(f));
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>Choose Image</Button>
        </div>

        <Button onClick={analyze} disabled={isAnalyzing || !file}>
          {isAnalyzing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Analyze Colors'}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <Button onClick={uploadItem} disabled={isUploading}>
              {isUploading ? 'Adding to Closet...' : 'Add to Closet'}
            </Button>
            <Button variant="outline" onClick={savePalette}>
              Save Palette to Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ImageUpload;
