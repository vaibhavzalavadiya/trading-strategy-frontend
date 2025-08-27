import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Button = forwardRef(({ className, type = "button", ...props }, ref) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2",
      className
    )}
    ref={ref}
    {...props}
  />
));
Button.displayName = "Button";

export { Button }; 