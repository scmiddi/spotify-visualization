'use client';

import { useState } from 'react';
import { PlaylistData } from '@/types/spotify';

interface FileUploadProps {
  onFileLoaded: (data: PlaylistData) => void;
}

export default function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onFileLoaded(data);
    } catch (err) {
      setError('Fehler beim Lesen der Datei');
      console.error('Error reading file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
        />
      </label>
      {isLoading && <div>Loading...</div>}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 