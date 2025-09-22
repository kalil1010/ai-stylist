'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Image as ImageIcon, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { savePaletteForUser } from '@/lib/palette';
import { analyzeImageColors } from '@/lib/imageAnalysis';
import { OutfitColorPlan } from '@/types/palette';

type Matches = { complementary: string; analogous: string[]; triadic: string[] };

export function ColorAnalyzer() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainColors, setMainColors] = useState<string[]>([]);
  const [matches, setMatches] = useState<Matches | null>(null);
  const [rich, setRich] = useState<any | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customHex, setCustomHex] = useState<string>('#000000');
  const [plan, setPlan] = useState<OutfitColorPlan>({});    // <- declared here

  const { toast } = useToast();
  const { user } = useAuth();

  // ... (other handlers: onChooseFile, analyze, copyHex, etc.) ...

  const saveToProfile = async () => {
    if (!user || !rich) {
      toast({ variant: 'error', title: !user ? 'Please sign in' : 'Nothing to save' });
      return;
    }
    try {
      const base = mainColors[0] || rich.base;
      // Correct call: payload first, then paletteId
      await savePaletteForUser(
        {
          baseHex: base,
          dominantHexes: mainColors,
          richMatches: rich,
          plan: plan,           // explicitly reference plan
          source: 'analyzer'
        },
        user.uid               // paletteId
      );
      toast({ variant: 'success', title: 'Saved to profile' });
    } catch (e: any) {
      toast({
        variant: 'error',
        title: 'Save failed',
        description: e?.message || 'Unable to write to Firestore'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Clothing Color Analyzer
        </CardTitle>
        <CardDescription>
          Upload a piece of clothing to get matching color suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ... image upload UI, analysis results, color picker UI ... */}

        {/* Save to profile button */}
        <div className="flex justify-end">
          <Button onClick={saveToProfile} disabled={!user}>
            {user ? 'Save to Profile' : 'Sign in to Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ColorAnalyzer;
