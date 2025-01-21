import React, { useEffect, useRef } from 'react';
import { SelectorProps, SelectorStatus } from './selector.types';
import ArrowUpIcon from '@/icons/arrow-up.svg';
import ArrowDownIcon from '@/icons/arrow-down.svg';
import { addLeadingZero } from '@/utils';

const Selector: React.FC<SelectorProps> = ({
   options,
   onChange,
   className='',
   defaultValue
}) => {

   // Ref to the main div of selector.
   const selectorRef = useRef<HTMLDivElement>(null);

   // Ref to options list.
   const listRef = useRef<HTMLUListElement>(null);

   // Ref to add value button.
   const plusButton = useRef<HTMLButtonElement>(null);

   // Ref to minus value button.
   const minusButton = useRef<HTMLButtonElement>(null);

   // Ref to store auxiliary values for managing the state of a selector.
   const statusRef = useRef<SelectorStatus>({
      isDragging: false,
      startY: 0,
      lastY: 0,
      initialTop: 0,
      velocity: 0,
      lastTime: 0,
      maxVelocity: 80,
      momentumFrame: 0,
      itemHeight: 0,
      animating: false,
      buttonsTimeout: 0,
      elevatorInterval: 0,
      buttonsClicked: false
   });

   // Update status values
   const updateStatus = (updates: Partial<SelectorStatus>) => {
      statusRef.current = { ...statusRef.current, ...updates };
   };

   // Set top value for list
   const setListTop = (value: number) => {
      if (listRef.current) listRef.current.style.top = `${value}px`;
   }

   // Limit the top value of list
   const topLimits = (newValue: number) => {
      let newTop = newValue;
      const maxTop = 0;
      const minTop = (selectorRef.current?.offsetHeight ?? 0) - (listRef.current?.clientHeight ?? 0);
      if (newTop > maxTop) newTop = maxTop;
      if (newTop < minTop) newTop = minTop;
      return newTop;
   }

   // Set value of the selector,
   // The default is the value that was scrolled,
   // But also accepts a value from options.
   const setValue = (value?: string) => {
      if (listRef.current) {
         const list = listRef.current;
         const items = list.querySelectorAll('li');
         const itemHeight = statusRef.current.itemHeight;
         if (!value) {
            const itemsReached = Math.abs(list.offsetTop) / itemHeight;
            const index = Math.round(itemsReached);
            const selectedValue = items[index].getAttribute('value') ?? '';
            if (onChange) onChange(selectedValue);
         } else {
            const targetItem = list.querySelector(`li[value='${value}']`) as HTMLLIElement;
            if (targetItem) {
               const top = targetItem.offsetTop;
               setListTop(top * -1);
            }
         }
      }
   };

   // Change the opacity of the buttons if the list has reached the top or bottom.
   const handleButtonsOpacity = () => {
      if (plusButton.current && minusButton.current && listRef.current) {
         const plus = plusButton.current;
         const minus = minusButton.current;
         const list = listRef.current;
         const top = list.offsetTop ?? 0;
         if (top == 0) {
            minus.classList.add('disable');
            plus.classList.remove('disable');
         } else if (top == (selectorRef.current?.offsetHeight ?? 0) - (listRef.current?.clientHeight ?? 0)) {
            minus.classList.remove('disable');
            plus.classList.add('disable');
         } else {
            minus.classList.remove('disable');
            plus.classList.remove('disable');
         }
      }
   }

   // Single move up or down for selector list
   const moveList = (up: boolean) => {
      if (listRef.current && !statusRef.current.animating) {
         updateStatus({ animating: true });
         const list = listRef.current;
         list.classList.add('animate-faster');
         const oldTop = list.offsetTop ?? 0;
         let newTop = up ? oldTop - 60 : oldTop + 60;
         newTop = topLimits(newTop);
         setListTop(newTop);
         setTimeout(() => {
            list.classList.remove('animate-faster');
            updateStatus({ animating: false });
            handleButtonsOpacity();
            setValue();
         }, 80);
      }
   }

   // Apply changes after the navigation is complete.
   const onDragEnd = () => {
      if (listRef.current) {
         const list = listRef.current;
         const itemHeight = statusRef.current.itemHeight;
         const itemsReached = Math.abs(list.offsetTop) / itemHeight;
         const deviation = 1 - (itemsReached - Math.floor(itemsReached));
         list.classList.add('animate');
         const oldTop = list.offsetTop;
         if (deviation <= 0.5) {
            const change = deviation * itemHeight;
            setListTop(oldTop - change);
         } else {
            const change = ((itemsReached - Math.floor(itemsReached)) * itemHeight);
            setListTop(oldTop + change);
         }
         handleButtonsOpacity();
         setValue();
         setTimeout(() => {
            list.classList.remove('animate');
         }, 150);
      }
   };

   // Elevator movement when button clicks are held.
   const elevatorMoving = (up: boolean) => {
      if (listRef.current && statusRef.current.elevatorInterval == 0) {
         const list = listRef.current;
         statusRef.current.elevatorInterval = setInterval(() => {
            const oldTop = list.offsetTop;
            const newTop = topLimits(up ? oldTop - 5 : oldTop + 5)
            setListTop(newTop);
         }, 1);
      }
   }

   // Handle buttons mouse down event
   const handeButtonMouseDown = (up: boolean) => {
      statusRef.current.buttonsClicked = true;
      // Set time out for click and hold separation
      statusRef.current.buttonsTimeout = setTimeout(() => {
         clearTimeout(statusRef.current.buttonsTimeout);
         statusRef.current.buttonsTimeout = 0;
         elevatorMoving(up); // Start elevator moving
      }, 200);
   }

   // Handle buttons mouse up event
   const handeButtonMouseUp = (up: boolean) => {
      if (statusRef.current.buttonsClicked) {
         if (statusRef.current.buttonsTimeout) { // button clicked
            clearTimeout(statusRef.current.buttonsTimeout);
            statusRef.current.buttonsTimeout = 0;
            moveList(up);
         } else { // button hold
            clearInterval(statusRef.current.elevatorInterval); // Stop elevator moving
            statusRef.current.elevatorInterval = 0;
            onDragEnd();
         }
         statusRef.current.buttonsClicked = false;
      }
   }

   useEffect(() => {
      if (selectorRef.current && listRef.current) {
         const selector = selectorRef.current;
         const list = listRef.current;
         const items = list.querySelectorAll('li');
         handleButtonsOpacity();

         // Detect items height
         if (items.length > 0) {
            statusRef.current.itemHeight = items[0].offsetHeight;
         }

         // Set default value if defined.
         if (defaultValue) {
            if (defaultValue == 'am' || defaultValue == 'pm') {
               setValue(defaultValue);
            } else {
               setValue(
                  addLeadingZero(parseInt(defaultValue))
               );
            }
         }

         // Animation for soft standing of the list after dragging.
         const animateMomentum = () => {
            const maxTop = 0;
            const minTop = selector.offsetHeight - list.scrollHeight;
            if (Math.abs(statusRef.current.velocity) > 0.3) {
               let newTop = list.offsetTop + statusRef.current.velocity;
               if (newTop > maxTop) newTop = maxTop;
               if (newTop < minTop) newTop = minTop;
               setListTop(newTop);
               updateStatus({
                  velocity: statusRef.current.velocity * 0.85,
                  momentumFrame: requestAnimationFrame(animateMomentum)
               });
            } else {
               cancelAnimationFrame(statusRef.current.momentumFrame);
               onDragEnd();
            }
         };

         // Hande mouse down or touch down on selector.
         const handleMouseDown = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            const event = 'touches' in e ? e.touches[0] : e;
            updateStatus({
               isDragging: true,
               startY: event.pageY,
               lastY: event.pageY,
               initialTop: list.offsetTop,
               lastTime: Date.now(),
               velocity: 0
            });
            cancelAnimationFrame(statusRef.current.momentumFrame);
         }

         // Hande mouse move or touch move on selector.
         const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!statusRef.current.isDragging) return;
            e.preventDefault();
            const event = 'touches' in e ? e.touches[0] : e;
            const y = event.pageY;
            const currentTime = Date.now();
            const deltaY = y - statusRef.current.lastY;
            const timeElapsed = currentTime - statusRef.current.lastTime;
            updateStatus({
               lastY: y,
               lastTime: currentTime
            });
            let newTop = statusRef.current.initialTop + (y - statusRef.current.startY);
            if (newTop > 10) newTop = 10;
            setListTop(newTop);
            const tempVelocity = deltaY / timeElapsed;
            statusRef.current.velocity = Math.min(
               Math.max(tempVelocity * 30, -statusRef.current.maxVelocity),
               statusRef.current.maxVelocity
            );
         }

         // Hande mouse up or touch end on selector.
         const handleMouseUp = () => {
            if (statusRef.current.isDragging) {
               const finalTop = topLimits(listRef.current?.offsetTop ?? 0);
               setListTop(finalTop);
               updateStatus({ isDragging: false });
               animateMomentum();
            }
         }

         // Handle mouse wheel
         const handleMouseWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
               moveList(false); // move up
            } else {
               moveList(true); // move down
            }
         }

         selector.addEventListener('mousedown', handleMouseDown);
         selector.addEventListener('wheel', handleMouseWheel);
         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
         selector.addEventListener('touchstart', handleMouseDown);
         document.addEventListener('touchmove', handleMouseMove, { passive: false });
         document.addEventListener('touchend', handleMouseUp);

         return () => {
            selector.removeEventListener('mousedown', handleMouseDown);
            selector.removeEventListener('wheel', handleMouseWheel);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            selector.removeEventListener('touchstart', handleMouseDown);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
         }

      }
   }, []);

   return (
      <div className={`rmtp-selector-container ${className}`}>

         {/* Selector body */}
         <div className="rmtp-selector" ref={selectorRef}>

            {/* Selector list */}
            <ul className="rmtp-selector-list" ref={listRef}>

               {/* Options */}
               {options.map((item, index) =>
                  <li className='rmtp-selector-item' value={item.value} key={index}>
                     {item.label}
                  </li>
               )}

            </ul>

         </div>

         {/* Add value button */}
         <button
            className='rmtp-selector-btn plus'
            ref={plusButton}
            onMouseDown={() => handeButtonMouseDown(true)}
            onMouseUp={() => handeButtonMouseUp(true)}
            onMouseLeave={() => handeButtonMouseUp(true)}
         >
            <ArrowUpIcon />
         </button>

         {/* Minus value button */}
         <button
            className='rmtp-selector-btn minus'
            ref={minusButton}
            onMouseDown={() => handeButtonMouseDown(false)}
            onMouseUp={() => handeButtonMouseUp(false)}
            onMouseLeave={() => handeButtonMouseUp(false)}
         >
            <ArrowDownIcon />
         </button>

      </div>
   )
};

export default Selector;