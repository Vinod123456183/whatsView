import { ChatMessage, ParsedChat, MediaFile } from '../types';

// WhatsApp export formats:
// [DD/MM/YYYY, HH:MM:SS] Sender: Message  (iOS)
// DD/MM/YYYY, HH:MM - Sender: Message     (Android)
// [DD/MM/YY, HH:MM:SS] Sender: Message    (older iOS)
// M/D/YY, HH:MM - Sender: Message         (US format)

const PATTERNS = [
  // iOS: [12/31/2023, 14:30:00] Sender: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s(.+?):\s([\s\S]*)$/,
  // Android: 12/31/2023, 14:30 - Sender: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s(.+?):\s([\s\S]*)$/,
  // Android with dots: 31.12.2023, 14:30 - Sender: Message
  /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s(.+?):\s([\s\S]*)$/,
];

const SYSTEM_PATTERNS = [
  // iOS system messages
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s(.+)$/,
  // Android system messages
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s(.+)$/,
  /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s(.+)$/,
];

function parseDate(dateStr: string, timeStr: string): Date {
  // Normalize separators
  const normalizedDate = dateStr.replace(/\./g, '/');
  const parts = normalizedDate.split('/');
  if (parts.length !== 3) return new Date();

  let day = parseInt(parts[0]);
  let month = parseInt(parts[1]) - 1;
  let year = parseInt(parts[2]);

  if (year < 100) year += 2000;

  // Handle AM/PM
  let timeClean = timeStr.trim();
  let hours = 0, minutes = 0, seconds = 0;

  const ampmMatch = timeClean.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1]);
    minutes = parseInt(ampmMatch[2]);
    seconds = ampmMatch[3] ? parseInt(ampmMatch[3]) : 0;
    const ampm = ampmMatch[4].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  } else {
    const timeParts = timeClean.split(':');
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
    seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
  }

  return new Date(year, month, day, hours, minutes, seconds);
}

function detectMessageType(content: string): ChatMessage['type'] {
  const lower = content.toLowerCase().trim();
  if (
    lower === '<media omitted>' ||
    lower === 'image omitted' ||
    lower === 'video omitted' ||
    lower === 'gif omitted' ||
    lower === 'sticker omitted' ||
    lower === 'audio omitted' ||
    lower === 'document omitted' ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.gif') ||
    lower.endsWith('(file attached)')
  ) {
    if (lower.includes('audio') || lower.endsWith('.opus') || lower.endsWith('.mp3')) return 'audio';
    if (lower.includes('video') || lower.endsWith('.mp4')) return 'video';
    if (lower.includes('sticker')) return 'sticker';
    if (lower.includes('document') || lower.endsWith('.pdf') || lower.endsWith('.docx')) return 'document';
    return 'media';
  }
  if (lower.includes('contact card') || lower.endsWith('.vcf') || lower.includes('.vcf (file attached)')) return 'contact';
  if (lower === 'this message was deleted' || lower === 'you deleted this message') return 'deleted';
  if (lower.includes('location:') || lower.includes('live location')) return 'location';
  return 'text';
}

function isAttachedFile(content: string): { isFile: boolean; filename: string } {
  // Pattern: filename.ext (file attached)
  const fileMatch = content.match(/^(.+\.\w+)\s*\(file attached\)$/i);
  if (fileMatch) {
    return { isFile: true, filename: fileMatch[1].trim() };
  }
  return { isFile: false, filename: '' };
}

export function parseChatFile(
  text: string,
  mediaFiles: Map<string, MediaFile> = new Map()
): ParsedChat {
  const lines = text.split('\n');
  const messages: ChatMessage[] = [];
  const senderCounts = new Map<string, number>();
  let currentMessage: Partial<ChatMessage> | null = null;
  let msgId = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;

    for (const pattern of PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        // Save previous message
        if (currentMessage && currentMessage.sender && currentMessage.content !== undefined) {
          const msg = finalizeMessage(currentMessage, mediaFiles, msgId++);
          messages.push(msg);
          senderCounts.set(msg.sender, (senderCounts.get(msg.sender) || 0) + 1);
        }

        const [, dateStr, timeStr, sender, content] = match;
        currentMessage = {
          timestamp: parseDate(dateStr, timeStr),
          sender: sender.trim(),
          content: content.trim(),
          isSystem: false,
          isMe: false,
        };
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Check system message
      let isSystem = false;
      for (const pattern of SYSTEM_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          if (currentMessage && currentMessage.sender && currentMessage.content !== undefined) {
            const msg = finalizeMessage(currentMessage, mediaFiles, msgId++);
            messages.push(msg);
            senderCounts.set(msg.sender, (senderCounts.get(msg.sender) || 0) + 1);
          }
          const [, dateStr, timeStr, content] = match;
          currentMessage = {
            timestamp: parseDate(dateStr, timeStr),
            sender: 'System',
            content: content.trim(),
            isSystem: true,
            isMe: false,
          };
          isSystem = true;
          break;
        }
      }

      // Continuation of previous message
      if (!isSystem && currentMessage && line.trim()) {
        currentMessage.content = (currentMessage.content || '') + '\n' + line;
      }
    }
  }

  // Push last message
  if (currentMessage && currentMessage.sender && currentMessage.content !== undefined) {
    const msg = finalizeMessage(currentMessage, mediaFiles, msgId++);
    messages.push(msg);
    senderCounts.set(msg.sender, (senderCounts.get(msg.sender) || 0) + 1);
  }

  // Determine participants (non-system senders)
  const participants = Array.from(senderCounts.entries())
    .filter(([name]) => name !== 'System')
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  // myName = person with fewest messages (guest) OR first alphabetically if tie
  // For 2-person chats, the "me" is typically the second participant
  // We'll default to last participant and let user choose
  const myName = participants[participants.length - 1] || '';

  // Mark isMe
  messages.forEach(msg => {
    msg.isMe = msg.sender === myName && !msg.isSystem;
  });

  return { participants, messages, myName };
}

function finalizeMessage(
  partial: Partial<ChatMessage>,
  mediaFiles: Map<string, MediaFile>,
  id: number
): ChatMessage {
  const content = partial.content || '';
  let type = detectMessageType(content);

  // Check for attached file
  const { isFile, filename } = isAttachedFile(content);
  let mediaFile: MediaFile | undefined;

  if (isFile && filename) {
    // Try to find matching media file
    const found = findMediaFile(filename, mediaFiles);
    if (found) {
      mediaFile = found;
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'media';
      else if (['mp4', 'mov', 'avi'].includes(ext)) type = 'video';
      else if (['mp3', 'opus', 'ogg', 'wav', 'aac'].includes(ext)) type = 'audio';
      else if (['vcf'].includes(ext)) type = 'contact';
      else type = 'document';
    }
  }

  // Also check for media omitted - look up by content hint
  if (!mediaFile && type !== 'text' && type !== 'deleted' && type !== 'location' && type !== 'system') {
    // Try generic media match
    const anyMedia = findMediaByType(type, mediaFiles, id);
    if (anyMedia) mediaFile = anyMedia;
  }

  return {
    id: `msg-${id}`,
    timestamp: partial.timestamp || new Date(),
    sender: partial.sender || '',
    content,
    type,
    mediaFile,
    isMe: partial.isMe || false,
    isSystem: partial.isSystem || false,
  };
}

function findMediaFile(filename: string, mediaFiles: Map<string, MediaFile>): MediaFile | undefined {
  // Exact match
  if (mediaFiles.has(filename)) return mediaFiles.get(filename);
  // Case-insensitive
  for (const [key, val] of mediaFiles.entries()) {
    if (key.toLowerCase() === filename.toLowerCase()) return val;
  }
  return undefined;
}

function findMediaByType(
  type: ChatMessage['type'],
  mediaFiles: Map<string, MediaFile>,
  _id: number
): MediaFile | undefined {
  for (const [, val] of mediaFiles.entries()) {
    if (type === 'media' && val.type === 'image') return val;
    if (type === 'video' && val.type === 'video') return val;
    if (type === 'audio' && val.type === 'audio') return val;
  }
  return undefined;
}

export function groupMessagesByDate(messages: ChatMessage[]): { dateLabel: string; messages: ChatMessage[] }[] {
  const groups = new Map<string, ChatMessage[]>();

  messages.forEach(msg => {
    const dateKey = formatDateLabel(msg.timestamp);
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(msg);
  });

  return Array.from(groups.entries()).map(([dateLabel, msgs]) => ({ dateLabel, messages: msgs }));
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
