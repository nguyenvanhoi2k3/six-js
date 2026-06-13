export interface SliderOptions {
  name: string | null;
  perView: number;
  gap: string;
  drag: "true" | "false" | "free";
  speed: number;
  rightPadding: string;
  leftPadding: string;
  rewind: boolean;
  edgeResistance: number;
  loop: boolean;
  grabCursor: boolean;
  snap: boolean;
  autoplay: boolean; 
  interval: number; 
  startIndex: number; 
  autoWidth: boolean;
  perMove: "auto" | number;
  autoHeight: boolean;
  centered: boolean;    
  autoCentered: boolean;
  centerIfShort: boolean;
}