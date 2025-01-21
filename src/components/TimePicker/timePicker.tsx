import React, { JSX, useEffect, useRef, useState } from 'react';
import { TimePickerProps } from "./timePicker.types";
import { addLeadingZero, getCurrentTime, isTimeFormat } from '@/utils';
import Selector from '../Selector';
import '@/styles/timepicker.scss';

function TimePicker(props: TimePickerProps): JSX.Element {

   const {
      is24HourFormat,
      withSeconds = false,
      defaultValue,
      theme = 'light',
      onChange
   } = props;

   // State to manage the visibility of the time picker.
   const [open, setOpen] = useState<boolean>(false);

   // State to track whether the component is mounted for the first time.
   const [mounted, setMounted] = useState<boolean>(false);

   // State to hold the selected time value in an official time format.
   const [timeValue, setTimeValue] = useState<string>('');

   // State to hold the selected time in an object format for better value management.
   const [selectedTime, setSelectedTime] = useState<SelectedTime>({
      hours: 1,
      minutes: 0,
      seconds: 0,
      dayPart: 'am'
   });

   // Total hours (24 or 12 based on the 24-hour format),
   // and fixed values for minutes and seconds (both set to 60).
   const timeValues = {
      hours: is24HourFormat ? 24 : 12,
      minutes: 60,
      seconds: 60
   };

   // Ref to the time picker dropdown.
   const timePickerRef = useRef<HTMLDivElement>(null);

   // Ref to the default input.
   const inputRef = useRef<HTMLInputElement>(null);

   // Refs to reference the analog clock hands.
   const clockHourRef = useRef<HTMLSpanElement>(null); // hour hand
   const clockMinRef = useRef<HTMLSpanElement>(null); // minute hand
   const clockSecRef = useRef<HTMLSpanElement>(null); // second hand


   // Convert SelectedTime object to official time string format.
   const convertSelectedTimeToInputFormat = () => {
      let { hours, minutes, seconds, dayPart } = selectedTime;
      let finalHours, finalMinutes, finalSeconds;
      if (!is24HourFormat && dayPart == 'pm') {
         if (hours < 12) {
            hours += 12;
         }
      }
      if (!is24HourFormat && dayPart == 'am' && hours == 12) {
         hours = 0;
      }
      finalHours = addLeadingZero(hours);
      finalMinutes = addLeadingZero(minutes);
      finalSeconds = withSeconds ? ':' + addLeadingZero(seconds) : '';
      return `${finalHours}:${finalMinutes}${finalSeconds}`;
   }

   // Convert time string to SelectedTime format.
   const convertTimeStringToObject = (time: string): SelectedTime => {
      let timeObject: SelectedTime = {
         hours: 1,
         minutes: 0,
         seconds: 0,
         dayPart: 'am'
      };
      if (isTimeFormat(time)) {
         const timeParts = time.split(':');
         let hours = parseInt(timeParts[0]);
         const minutes = parseInt(timeParts[1]);
         const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
         let dayPart: DayPart | null = null;
         
         if (!is24HourFormat) {
            if (hours > 12) {
               dayPart = 'pm';
            } else {
               dayPart = 'am';
            }
         }
         if (!is24HourFormat && hours > 12) {
            hours -= 12;
            dayPart = 'pm';
         }
         if (hours == 0 && !is24HourFormat) {
            dayPart = 'pm';
         }

         timeObject = {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            dayPart: dayPart
         };
      }
      return timeObject;
   }

   // Set clock hands position after value changed.
   const setClockHands = (
      hand: React.RefObject<HTMLSpanElement | null>,
      value: number,
      max: number
   ) => {
      if (hand.current) {
         hand.current.style.transform = `rotate(${value * 360 / max}deg)`
      }
   }

   // Change TimePicker main value.
   const changeValue = () => {
      const stringValue = convertSelectedTimeToInputFormat();
      setTimeValue(stringValue);
      if (onChange) onChange(stringValue);
   }

   // Callback function for changing each selector,
   // `index` refers to the changed part of the time.
   const onSelectorsChange = (value: string, index: number) => {
      const intValue = parseInt(value);
      const dayPart: DayPart = index > 2 ? value as DayPart : 'am';

      switch (index) {
         case 0: // hours changed
            setClockHands(clockHourRef, intValue, 12);
            setSelectedTime((prevState) => ({ ...prevState, hours: intValue }));
            break;
         case 1: // minutes changed
            setClockHands(clockMinRef, intValue, 60);
            setSelectedTime((prevState) => ({ ...prevState, minutes: intValue }));
            break;
         case 2: // seconds changed
            setClockHands(clockSecRef, intValue, 60);
            setSelectedTime((prevState) => ({ ...prevState, seconds: intValue }));
            break;
         case 3: // day part changed
            setSelectedTime((prevState) => ({ ...prevState, dayPart: dayPart }));
            break;
      }
   }

   // Update main value after selectedTime state changed.
   useEffect(() => {
      if (mounted) {
         changeValue();
      }
   }, [selectedTime]);

   // Generates the required options of selectors.
   const generateOptions = (length: number, is24HourFormat = true) => {
      return Array.from({ length }).map((_, index) => {
         const number = addLeadingZero(is24HourFormat ? index : index + 1);
         return { label: number, value: number };
      });
   }

   // A helper function for `debouncedSetTimePickerPosition`
   const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(() => func(...args), delay);
      };
   };

   // Set fixed position for time picker dropdown.
   const setTimePickerPosition = () => {
      if (timePickerRef.current && inputRef.current) {
         const timePicker = timePickerRef.current;
         const pointer = timePicker.querySelector('.rmtp-pointer') as HTMLElement;
         const input = inputRef.current;

         const pickerWidth = timePicker.clientWidth;
         const pickerHeight = timePicker.clientHeight;
         const bodyWidth = document.body.clientWidth;
         const windowHeight = window.innerHeight;
         const inputRect = input.getBoundingClientRect();
         const freeXSpace = bodyWidth - pickerWidth;

         let left = (inputRect.left + (input.clientWidth / 2)) - pickerWidth / 2;
         let top = inputRect.top + input.clientHeight + 3;
         let pointerLeft = 0, pointerTop = 0;

         if (left < 0) {
            pointerLeft = left;
            left = 0;
         } else if (left + pickerWidth > bodyWidth) {
            pointerLeft = left - freeXSpace;
            left = freeXSpace;
         }

         if (top + pickerHeight > windowHeight) {
            top = inputRect.top - pickerHeight - 15;
            pointerTop = pickerHeight - 15;
         }

         timePicker.style.left = `${left}px`;
         timePicker.style.top = `${top}px`;
         pointer.style.left = `${pointerLeft}px`;
         pointer.style.top = `${pointerTop}px`;

      }
   }

   useEffect(() => {
      // Set time picker open or close.
      const toggleTimePicker = (e: MouseEvent) => {
         const target = e.target as HTMLElement;
         const timepickerElement = document.querySelector('.rm-timepicker');
         if (timepickerElement && !timepickerElement.contains(target)) {
            setOpen(false);
         }
         if (target.classList.contains('rm-timepicker-input')) {
            setOpen(prevState => !prevState);
         }
      }

      // Reset time picker position after rerender.
      setTimePickerPosition();

      // A helper function to change the position of the time picker dropdown,
      // When the window size change.
      const debouncedSetTimePickerPosition = debounce(
         setTimePickerPosition,
         100 // Checks every 100ms, For fewer calculations.
      );

      // Set default time value when dropdown open.
      let tempSelectedTime = selectedTime;
      if (!mounted) {
         const defaultTimeString = (defaultValue && defaultValue != '') ? defaultValue : getCurrentTime();
         const defaultSelectedTime = convertTimeStringToObject(defaultTimeString);
         tempSelectedTime = defaultSelectedTime;
         setSelectedTime(defaultSelectedTime);
         setMounted(true);
      }

      setClockHands(clockHourRef, tempSelectedTime.hours, 12);
      setClockHands(clockMinRef, tempSelectedTime.minutes, 60);
      setClockHands(clockSecRef, tempSelectedTime.seconds, 60);

      document.addEventListener('mousedown', toggleTimePicker);
      window.addEventListener('resize', debouncedSetTimePickerPosition);
      return () => {
         document.removeEventListener('mousedown', toggleTimePicker);
         window.removeEventListener('resize', debouncedSetTimePickerPosition);
      }

   }, [timePickerRef.current, open]);

   return (
      <>

         {/* Input for default dropdown trigger */}
         <input
            ref={inputRef}
            className='rm-timepicker-input'
            aria-label='Time'
            type='time'
            value={timeValue}
            readOnly
         />


         {open ?

            <div
               className={`rm-timepicker ${theme}`}
               ref={timePickerRef}
            >

               {/* Pointer at the bottom or top of the table (▲ | ▼) */}
               <span className='rmtp-pointer'></span>

               <div className='rmtp-box'>
                  <div className='rmtp-main'>

                     <div className='rmtp-digital'>

                        {/* Hours selector */}
                        <Selector
                           options={
                              generateOptions(
                                 timeValues.hours,
                                 is24HourFormat
                              )
                           }
                           onChange={(value) => onSelectorsChange(value, 0)}
                           defaultValue={selectedTime.hours.toString()}
                        />

                        <span className='rmtp-separator'>:</span>

                        {/* Minutes selector */}
                        <Selector
                           options={
                              generateOptions(timeValues.minutes)
                           }
                           onChange={(value) => onSelectorsChange(value, 1)}
                           defaultValue={selectedTime.minutes.toString()}
                        />

                        {withSeconds && (
                           <>
                              <span className='rmtp-separator'>:</span>

                              {/* Seconds selector */}
                              <Selector
                                 options={
                                    generateOptions(timeValues.seconds)
                                 }
                                 onChange={(value) => onSelectorsChange(value, 2)}
                                 defaultValue={selectedTime.seconds.toString()}
                              />
                           </>
                        )}

                        {!is24HourFormat ?
                           <>
                              {/* Day part selector */}
                              <Selector
                                 options={[
                                    { label: 'AM', value: 'am' },
                                    { label: 'PM', value: 'pm' },
                                 ]}
                                 onChange={(value) => onSelectorsChange(value, 3)}
                                 className='rmtp-daypart'
                                 defaultValue={selectedTime.dayPart}
                              />
                           </>
                        : null}
                     </div>


                     {/* Analog clock for selected time preview */}
                     <div className='rmtp-analog'>
                        <span className='rmtp-analog-point hour' ref={clockHourRef}></span>
                        <span className='rmtp-analog-point minute' ref={clockMinRef}></span>
                        {withSeconds ?
                           <span className='rmtp-analog-point second' ref={clockSecRef}></span>
                        : null}
                     </div>



                  </div>
               </div>

            </div>

         : null}

      </>
   );
}

export default TimePicker;