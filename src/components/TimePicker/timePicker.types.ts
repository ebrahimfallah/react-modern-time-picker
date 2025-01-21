export type TimePickerProps = {
   is24HourFormat?: boolean,
   withSeconds?: boolean,
   defaultValue?: string,
   theme?: 'light' | 'dark',
   onChange?: (value: string) => void
}