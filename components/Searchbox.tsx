/**
 * Search combobox — DESIGN-SPEC §3.7 Input, §3.3 Card.
 * Trigger: brand input; dropdown: white surface, border-gray-200, shadow-brand-500/10.
 */
import * as React from "react";
import { useRouter } from "next/router";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { routes } from "@utils/routes";

const SearchBox: React.FunctionComponent = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const onSelect = React.useCallback(
    (currentValue: string) => {
      setValue(currentValue === value ? "" : currentValue);
      setOpen(false);
      const route = routes.find(
        r => r.searchTerm.toLowerCase() === currentValue.toLowerCase()
      );
      if (route) {
        router.push(route.path);
      }
    },
    [router, value]
  );

  const displayText = value
    ? routes.find(
        route => route.searchTerm.toLowerCase() === value.toLowerCase()
      )?.searchTerm ?? "Search tools..."
    : "Search tools...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Search tools"
          className={cn(
            "relative flex h-11 w-full min-w-[200px] max-w-[320px] items-center gap-3 rounded-2xl border bg-[var(--brand-50)]/50 px-4 py-2.5 text-left text-sm text-[var(--text-primary)] transition-all duration-300",
            "border-[var(--brand-200)] placeholder:text-gray-500",
            "hover:border-[var(--brand-300)]",
            "focus:outline-none focus:ring-4 focus:ring-[var(--brand-400)]/20 focus:border-[var(--brand-400)]",
            "data-[state=open]:border-[var(--brand-400)] data-[state=open]:ring-4 data-[state=open]:ring-[var(--brand-400)]/20"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-200)]/50">
            <Search className="h-4 w-4 text-[var(--brand-700)]" />
          </span>
          <span className={cn("flex-1 truncate", !value && "text-gray-500")}>
            {displayText}
          </span>
          <ChevronsUpDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[min(400px,90vw)] p-0",
          "rounded-2xl border border-gray-200 bg-white shadow-xl shadow-[#16F2B3]/10",
          "transition-all duration-300",
          "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        )}
      >
        <Command
          className="rounded-2xl border-0 bg-transparent"
          shouldFilter={true}
        >
          <CommandInput
            placeholder="Search tools..."
            className="h-11 border-b border-gray-200 bg-transparent placeholder:text-gray-500"
          />
          <CommandList className="max-h-[300px] overflow-y-auto p-1">
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
              No tool found.
            </CommandEmpty>
            <CommandGroup className="p-0">
              {routes.map(route => {
                const isSelected =
                  value.toLowerCase() === route.searchTerm.toLowerCase();
                return (
                  <CommandItem
                    key={route.path}
                    value={route.searchTerm}
                    onSelect={onSelect}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-900 transition-all duration-300",
                      "aria-selected:bg-[var(--brand-50)] aria-selected:text-[var(--brand-800)]",
                      "hover:bg-[var(--brand-50)] hover:text-[var(--brand-800)] hover:border-transparent",
                      "focus:bg-[var(--brand-50)] focus:outline-none"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 text-[var(--brand-600)]",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{route.searchTerm}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBox;
