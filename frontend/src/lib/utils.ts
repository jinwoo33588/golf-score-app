import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function scoreClass(score: number, par: number) {
  const diff = score - par;
  if (diff <= -2) return 'score-eagle';
  if (diff === -1) return 'score-birdie';
  if (diff === 0)  return 'score-par';
  if (diff === 1)  return 'score-bogey';
  if (diff === 2)  return 'score-double';
  return 'score-worse';
}

export function scoreLabel(score: number, par: number) {
  const diff = score - par;
  if (diff <= -2) return '이글↓';
  if (diff === -1) return '버디';
  if (diff === 0)  return '파';
  if (diff === 1)  return '보기';
  if (diff === 2)  return '더블';
  return `+${diff}`;
}

export function signedStr(n: number) {
  return `${n}`;
}
