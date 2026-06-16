import type { SVGProps, ComponentType } from 'react';
import {
  Book,
  Box,
  Bug,
  Compass,
  Cpu,
  Package,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

type IconProps = SVGProps<SVGSVGElement>;

/** Project loader/file glyph — Lucide `Box` under a stable name. */
export const LoaderGlyph: LucideIcon = Box;

/** Moddery brand mark — bespoke, no Lucide equivalent. */
export const ModderyMark = (p: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden {...p}>
    <rect width="32" height="32" rx="9" fill="currentColor" opacity="0.12" />
    <path
      d="M8 23V10.5c0-.4.5-.6.8-.3l6.4 6.4c.4.4 1.2.4 1.6 0l6.4-6.4c.3-.3.8-.1.8.3V23"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  optimization: Zap,
  library: Book,
  utility: Wrench,
  decoration: Sparkles,
  magic: Sparkles,
  management: SlidersHorizontal,
  storage: Package,
  adventure: Compass,
  technology: Cpu,
  mobs: Bug,
};

export function categoryIcon(name: string): ComponentType<IconProps> {
  return CATEGORY_ICONS[name] ?? Tag;
}
