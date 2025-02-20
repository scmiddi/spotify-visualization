'use client';

import { useState, useRef } from 'react';
import { PlaylistData } from '@/types/spotify';

interface FileUploadProps {
  onFileLoaded: (data: PlaylistData) => void;
}

export default function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let jsonData: PlaylistData;

      try {
        jsonData = JSON.parse(text);
      } catch (error) {
        console.error('JSON Parse Error:', error);
        throw new Error('Ungültiges Dateiformat. Bitte eine gültige JSON oder TXT Datei mit JSON-Inhalt hochladen.');
      }

      if (!jsonData.playlists) {
        throw new Error('Ungültiges Datenformat. Die Datei muss ein "playlists" Objekt enthalten.');
      }

      onFileLoaded(jsonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-zinc-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-zinc-800 file:text-white
            hover:file:bg-zinc-700
            cursor-pointer"
        />
      </label>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
} 