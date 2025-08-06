import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * VisuallyHidden component that hides content visually
 * but keeps it accessible to screen readers.
 */
function VisuallyHidden({
  className,
  // The three dots here are the JavaScript "spread" operator.
  // In this context, "...props" collects all additional props passed to the component
  // (other than those explicitly listed, like className) into a single object called "props".
  // This allows the component to forward any extra HTML attributes to the <span> element below.
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-rect-0 whitespace-nowrap border-0",
        className
      )}
      {...props}
    />
  )
}

export { VisuallyHidden } 