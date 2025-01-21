export interface SelectorProps {
   options: {
      label: string,
      value: string
   }[],
   onChange?: (value: string) => void,
   className?: string,
   defaultValue?: string | null
}

export type SelectorStatus = {
   isDragging: boolean,
   startY: number,
   lastY: number,
   initialTop: number,
   lastTime: number,
   velocity: number,
   maxVelocity: number,
   momentumFrame: number,
   itemHeight: number,
   animating: boolean,
   buttonsTimeout: NodeJS.Timeout | number,
   elevatorInterval: NodeJS.Timeout | number,
   buttonsClicked: boolean
};