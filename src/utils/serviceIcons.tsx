import React from 'react';
import {
  Calendar, Home, Droplets, Shirt, Building2, Briefcase,
  Sparkles, Check, Star, Wind, Flame, Leaf, Sun, Layers,
  Package, Sofa, Flower2, Shield, Wrench, Truck,
} from 'lucide-react';

export const ICON_OPTIONS = [
  { id: 'Calendar',  label: 'Kalendář',   Icon: Calendar },
  { id: 'Home',      label: 'Dům',         Icon: Home },
  { id: 'Droplets',  label: 'Kapky',       Icon: Droplets },
  { id: 'Shirt',     label: 'Košile',      Icon: Shirt },
  { id: 'Building2', label: 'Budova',      Icon: Building2 },
  { id: 'Briefcase', label: 'Kufřík',      Icon: Briefcase },
  { id: 'Sparkles',  label: 'Třpytky',     Icon: Sparkles },
  { id: 'Star',      label: 'Hvězda',      Icon: Star },
  { id: 'Wind',      label: 'Vítr',        Icon: Wind },
  { id: 'Flame',     label: 'Plamen',      Icon: Flame },
  { id: 'Leaf',      label: 'List',        Icon: Leaf },
  { id: 'Sun',       label: 'Slunce',      Icon: Sun },
  { id: 'Layers',    label: 'Vrstvy',      Icon: Layers },
  { id: 'Package',   label: 'Balíček',     Icon: Package },
  { id: 'Sofa',      label: 'Pohovka',     Icon: Sofa },
  { id: 'Flower2',   label: 'Květina',     Icon: Flower2 },
  { id: 'Shield',    label: 'Štít',        Icon: Shield },
  { id: 'Wrench',    label: 'Klíč',        Icon: Wrench },
  { id: 'Truck',     label: 'Vozidlo',     Icon: Truck },
  { id: 'Check',     label: 'Fajfka',      Icon: Check },
];

const LEGACY_MAP: Record<string, string> = {
  pravidelny: 'Calendar',
  generalni:  'Home',
  okna:       'Droplets',
  zehleni:    'Shirt',
  kancelare:  'Briefcase',
  spolecne:   'Building2',
  tepovani:   'Sparkles',
};

export function getServiceIcon(
  service: { id: string; icon?: string },
  size = 'w-8 h-8',
): React.ReactElement {
  const iconId = service.icon ?? LEGACY_MAP[service.id] ?? 'Check';
  const found = ICON_OPTIONS.find((o) => o.id === iconId);
  const { Icon } = found ?? ICON_OPTIONS[ICON_OPTIONS.length - 1];
  return <Icon className={size} />;
}
