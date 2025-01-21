export const getCurrentTime = (): string => {
   const date = new Date();
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   const seconds = String(date.getSeconds()).padStart(2, '0');
   return `${hours}:${minutes}:${seconds}`;
}

export const isTimeFormat = (time: string): boolean => {
   const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
   return timePattern.test(time);
};

export const generateEmptyTime = (withSeconds: boolean): string => {
   return `00:00${withSeconds ? ':00' : ''}`;
}

export const addLeadingZero = (num: number) => {
   return num < 10 ? '0' + num.toString() : num.toString();
}