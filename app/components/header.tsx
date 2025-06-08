interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="font-bold text-3xl">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
