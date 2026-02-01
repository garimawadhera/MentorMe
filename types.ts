
export enum MentorId {
  COSMO = 'cosmo',
  PIXEL = 'pixel',
  MUSE = 'muse',
  SAGE = 'sage'
}

export interface Mentor {
  id: MentorId;
  name: string;
  role: string;
  specialty: string;
  personality: string;
  avatar: string;
  color: string;
  bgColor: string;
  systemInstruction: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
