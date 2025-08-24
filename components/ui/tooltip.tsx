import React,{useState} from "react";


export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ 
  children, 
  delayDuration = 0 
}: { 
  children: React.ReactNode; 
  delayDuration?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const showTooltip = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delayDuration);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === TooltipTrigger) {
            return child;
          }
          if (child.type === TooltipContent && isVisible) {
            return child;
          }
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = ({ children, asChild, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const TooltipContent = ({ 
  children, 
  className = "", 
  side = "top",
  ...props 
}: any) => (
  <div
    className={`absolute z-50 rounded-md border bg-white px-3 py-1.5 text-sm shadow-md ${
      side === "top" ? "bottom-full mb-2" : "top-full mt-2"
    } ${className}`}
    {...props}
  >
    {children}
    <div className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border rotate-45 ${
      side === "top" ? "-bottom-1 border-t-0 border-l-0" : "-top-1 border-b-0 border-r-0"
    }`} />
  </div>
);