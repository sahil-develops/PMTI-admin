import React, { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Option {
  id: number;
  label: string;
  [key: string]: any;
}

interface SearchSelectProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: { message?: string };
  apiUrl: string;
  labelKey: string;  // The key to use as label from API response (e.g., "CountryName", "location")
  required?: boolean;
  placeholder?: string;
}

const SearchSelect = ({
  label,
  value,
  onChange,
  error,
  apiUrl,
  labelKey,
  required = true,
  placeholder = "Select an option"
}: SearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const response = await fetch(`https://api.4pmti.com/${apiUrl}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${label.toLowerCase()}`);
        }
        
        const data = await response.json();
        if (data.success) {
          // Map the API response to a consistent format
          const mappedOptions = data.data.map((item: any) => ({
            id: item.id,
            label: item[labelKey]
          }));
          setOptions(mappedOptions);
        } else {
          throw new Error(data.error || `Failed to fetch ${label.toLowerCase()}`);
        }
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [apiUrl, label, labelKey]);

  const selectedOption = options.find(option => option.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {fetchError && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-red-500" : "border-gray-300"
            )}
            disabled={loading}
          >
            {loading ? (
              `Loading ${label.toLowerCase()}s...`
            ) : selectedOption ? (
              selectedOption.label
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export const createFormField = (register: any, errors: any, setValue: any, watch: any) => {
  return (props: SearchSelectProps) => (
    <SearchSelect
      {...props}
      value={watch(props.label.toLowerCase().replace(/\s+/g, '') + "Id")}
      onChange={(value) => setValue(props.label.toLowerCase().replace(/\s+/g, '') + "Id", value, { 
        shouldValidate: true,
        shouldDirty: true 
      })}
      error={errors[props.label.toLowerCase().replace(/\s+/g, '') + "Id"]}
    />
  );
};

export default SearchSelect;