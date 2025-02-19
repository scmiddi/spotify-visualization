'use client';

import { useCallback } from 'react';
import { PlaylistData } from '@/types/playlist';

interface FileUploadProps {
  onFileLoaded: (data: PlaylistData) => void;
}

export default function FileUpload({ onFileLoaded }: FileUploadProps) {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onFileLoaded(json);
      } catch (error) {
        alert('Fehler beim Lesen der Datei. Bitte stelle sicher, dass es sich um eine gültige JSON-Datei handelt.');
      }
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  return (
    <div className="w-full max-w-md text-center">
      <label className="block mb-4 text-lg">Wähle deine Spotify-Daten JSON-Datei</label>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-zinc-800 file:text-white
          hover:file:bg-zinc-700
          cursor-pointer"
      />
    </div>
  );
} 