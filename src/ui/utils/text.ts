export const truncate = (str: string, max: number): string => {
  if (str.length > max) {
    return str.substring(0, max - 3) + '...';
  }
  return str;
};

export const pad = (str: string, width: number, char: string = ' '): string => {
  return str + char.repeat(Math.max(0, width - str.length));
};

export const center = (str: string, width: number): string => {
  const pad = Math.floor((width - str.length) / 2);
  return ' '.repeat(pad) + str;
};

export const formatTimestamp = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};
