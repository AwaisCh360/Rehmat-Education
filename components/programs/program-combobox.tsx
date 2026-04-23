"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FilterOption } from "@/lib/programs/query";
import { cn } from "@/lib/utils";

export function ProgramCombobox({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string;
  onChange: (nextValue: string) => void;
  options: FilterOption[];
  placeholder?: string;
}) {
  const selected = options.find((option) => option.value === value);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [open]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className="w-full justify-between" variant="outline">
          <span className="truncate">{selected?.label ?? placeholder ?? "Select a program"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        avoidCollisions={false}
        className="w-[min(680px,calc(100vw-1.5rem))] p-0"
        side="bottom"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder="Search program name..." />
          <CommandList
            className="max-h-80 overscroll-contain [scrollbar-gutter:stable]"
            onWheelCapture={(event) => {
              event.stopPropagation();
            }}
          >
            <CommandEmpty>No programs found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                className="py-2.5"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                value="all-programs"
              >
                <Check className={cn("mr-2 h-4 w-4 shrink-0", !value ? "opacity-100" : "opacity-0")} />
                <span className="truncate">All programs</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  className="py-2.5"
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  value={`${option.label} ${option.value}`}
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="truncate" title={option.label}>{option.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{option.count}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
