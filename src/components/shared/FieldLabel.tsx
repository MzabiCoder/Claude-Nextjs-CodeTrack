export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}
