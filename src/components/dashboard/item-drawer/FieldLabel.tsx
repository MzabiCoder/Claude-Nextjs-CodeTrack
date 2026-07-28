export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium text-muted-foreground mb-1.5">
      {children}
    </h3>
  );
}
