"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

const getCurrentFY = () => {
  const now = new Date();
  const year =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

  return `${year}-${year + 1}`;
};

const generateFinancialYears = (baseYear = 2025) => {
  const currentFYStart = Number(getCurrentFY().split("-")[0]);
  const years: string[] = [];

  for (let start = baseYear; start <= currentFYStart; start++) {
    years.push(`${start}-${start + 1}`);
  }

  return years.reverse();
};

const FinancialYearSelect = ({ value, onChange }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const years = generateFinancialYears(2025);

  const urlFY = searchParams.get("fy") || undefined;

  const [selected, setSelected] = useState(
    value || urlFY || getCurrentFY()
  );

  // sync with parent
  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  // sync URL when selected changes
  const updateURL = (fy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fy", fy);

    router.push(`?${params.toString()}`, {scroll: false});
  };

  // notify parent + set URL on mount
  useEffect(() => {
    if (!value && onChange) {
      onChange(selected);
    }
    updateURL(selected);
  }, []);

  return (
    <div className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm">
      <p className="flex justify-between text-sm text-muted-foreground">
        Financial Year{" "}
        <Calendar className="text-yellow-500" size={20} />
      </p>

      <div className="mt-3">
        <Select
          value={selected}
          onValueChange={(val) => {
            setSelected(val);
            onChange?.(val);
            updateURL(val);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Financial Year" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FinancialYearSelect;