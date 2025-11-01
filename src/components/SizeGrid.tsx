import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Sizes = {
  pp: number;
  p: number;
  m: number;
  g: number;
  gg: number;
};

interface SizeGridProps {
  values: Sizes;
  onChange: (partial: Partial<Sizes>) => void;
  className?: string;
}

// Visual grid for size inputs with a label header row
export function SizeGrid({ values, onChange, className }: SizeGridProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="grid grid-cols-5 gap-3 px-1 text-xs font-medium text-muted-foreground">
        <div>PP</div>
        <div>P</div>
        <div>M</div>
        <div>G</div>
        <div>GG</div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <Input
          type="number"
          min={0}
          value={values.pp}
          onChange={(e) => onChange({ pp: Number(e.target.value || 0) })}
        />
        <Input
          type="number"
          min={0}
          value={values.p}
          onChange={(e) => onChange({ p: Number(e.target.value || 0) })}
        />
        <Input
          type="number"
          min={0}
          value={values.m}
          onChange={(e) => onChange({ m: Number(e.target.value || 0) })}
        />
        <Input
          type="number"
          min={0}
          value={values.g}
          onChange={(e) => onChange({ g: Number(e.target.value || 0) })}
        />
        <Input
          type="number"
          min={0}
          value={values.gg}
          onChange={(e) => onChange({ gg: Number(e.target.value || 0) })}
        />
      </div>
    </div>
  );
}

export default SizeGrid;

