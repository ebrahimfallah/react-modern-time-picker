export {};

declare global {

   type DayPart = 'am' | 'pm';

   type SelectedTime = {
      hours: number,
      minutes: number,
      seconds: number,
      dayPart: DayPart | null
   };

}