import JSZip from 'jszip';
import { MediaFile } from '../types';

export async function readZipFile(file: File): Promise<{ text: string; mediaFiles: Map<string, MediaFile> }> {
  const zip = await JSZip.loadAsync(file);
  let chatText = '';
  const mediaFiles = new Map<string, MediaFile>();

  const filePromises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    const filename = relativePath.split('/').pop() || relativePath;
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (filename === '_chat.txt' || filename.endsWith('.txt')) {
      filePromises.push(
        zipEntry.async('string').then(content => {
          if (!chatText || filename === '_chat.txt') {
            chatText = content;
          }
        })
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      filePromises.push(
        zipEntry.async('blob').then(blob => {
          const url = URL.createObjectURL(blob);
          mediaFiles.set(filename, { name: filename, url, type: 'image', blob });
        })
      );
    } else if (['mp4', 'mov', 'avi', '3gp'].includes(ext)) {
      filePromises.push(
        zipEntry.async('blob').then(blob => {
          const url = URL.createObjectURL(blob);
          mediaFiles.set(filename, { name: filename, url, type: 'video', blob });
        })
      );
    } else if (['mp3', 'opus', 'ogg', 'wav', 'aac', 'm4a'].includes(ext)) {
      filePromises.push(
        zipEntry.async('blob').then(blob => {
          const url = URL.createObjectURL(blob);
          mediaFiles.set(filename, { name: filename, url, type: 'audio', blob });
        })
      );
    } else if (['pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt'].includes(ext) && filename !== '_chat.txt') {
      filePromises.push(
        zipEntry.async('blob').then(blob => {
          const url = URL.createObjectURL(blob);
          mediaFiles.set(filename, { name: filename, url, type: 'document', blob });
        })
      );
    } else if (['vcf'].includes(ext)) {
      filePromises.push(
        zipEntry.async('string').then(content => {
          const blob = new Blob([content], { type: 'text/vcard' });
          const url = URL.createObjectURL(blob);
          mediaFiles.set(filename, { name: filename, url, type: 'document', blob });
        })
      );
    }
  });

  await Promise.all(filePromises);
  return { text: chatText, mediaFiles };
}

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}
