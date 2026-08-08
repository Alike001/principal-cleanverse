import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export function Mark({ size = 28 }: { size?: number }) {
  return <span className="principal-mark" style={{ width: size, height: size }} aria-hidden="true">P</span>;
}

export function CheckIcon(props: IconProps) { return <Icon {...props}><path d="m5 12 4.2 4L19 6.7" /></Icon>; }
export function BlockIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 8.5 7 7" /></Icon>; }
export function ArrowIcon(props: IconProps) { return <Icon {...props}><path d="M4 12h14" /><path d="m14 7 5 5-5 5" /></Icon>; }
export function CopyIcon(props: IconProps) { return <Icon {...props}><rect x="8" y="8" width="10" height="10" rx="1.5" /><path d="M16 8V6.5A1.5 1.5 0 0 0 14.5 5h-8A1.5 1.5 0 0 0 5 6.5v8A1.5 1.5 0 0 0 6.5 16H8" /></Icon>; }
export function ExternalIcon(props: IconProps) { return <Icon {...props}><path d="M14 5h5v5" /><path d="m19 5-9 9" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" /></Icon>; }
export function RefreshIcon(props: IconProps) { return <Icon {...props}><path d="M20 11a8 8 0 0 0-14.8-3.9L3 10" /><path d="M3 5v5h5" /><path d="M4 13a8 8 0 0 0 14.8 3.9L21 14" /><path d="M21 19v-5h-5" /></Icon>; }
export function PersonIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="8" r="3" /><path d="M5 20c.7-3.5 3.1-5.2 7-5.2s6.3 1.7 7 5.2" /></Icon>; }
export function VaultIcon(props: IconProps) { return <Icon {...props}><path d="M4 9.5 12 5l8 4.5V19H4Z" /><path d="M8 19v-5h8v5" /><path d="M4 9.5h16" /></Icon>; }
export function AssetIcon(props: IconProps) { return <Icon {...props}><path d="M6 8.5 12 5l6 3.5v7L12 19l-6-3.5Z" /><path d="m6 8.5 6 3.5 6-3.5" /><path d="M12 12v7" /></Icon>; }
