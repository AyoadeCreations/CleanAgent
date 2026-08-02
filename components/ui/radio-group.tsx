import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio as RadioParts } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return <RadioGroupPrimitive className={cn("grid gap-2", className)} {...props} />;
}

function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioParts.Root>) {
  return (
    <RadioParts.Root
      data-slot="radio"
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors outline-none",
        "hover:border-primary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-checked:border-primary",
        className
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors group-aria-checked:border-primary">
        <RadioParts.Indicator className="size-2 rounded-full bg-primary" />
      </span>
      {children}
    </RadioParts.Root>
  );
}

export { RadioGroup, RadioGroupItem };
