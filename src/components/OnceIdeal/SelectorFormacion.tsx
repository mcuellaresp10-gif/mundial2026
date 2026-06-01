"use client";

import { Select } from "@/components/ui/select";
import type { FormationType } from "@/types";

interface SelectorFormacionProps {
  value: FormationType;
  onChange: (f: FormationType) => void;
}

export function SelectorFormacion({ value, onChange }: SelectorFormacionProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as FormationType)}
      className="w-40"
    >
      <option value="4-3-3">4-3-3</option>
      <option value="4-2-3-1">4-2-3-1</option>
      <option value="3-5-2">3-5-2</option>
    </Select>
  );
}
