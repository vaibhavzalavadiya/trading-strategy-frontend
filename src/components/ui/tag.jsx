import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Tag = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border border-primary bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary",
      className
    )}
    {...props}
  />
));
Tag.displayName = "Tag";

export { Tag }; 