'use client';

import { useState } from 'react';

export default function FileUpload({ onTracksFound }: { onTracksFound: (tracks: string[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const text = await file.text();
      const tracks = text.split('\n').filter(line => line.trim());
      onTracksFound(tracks);
    } catch (err) {
      console.error('Fehler beim Lesen der Datei:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Datei auswählen</span>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
        />
      </label>
      {isLoading && <div>Lade...</div>}
    </div>
  );
} 