import {
    HardHat, Building2, Ruler, Drill, TrafficCone, Hammer, Wrench, Truck,
    Map, Mountain, Layers, Compass, PencilRuler, ShieldCheck, Factory, Cable,
    type LucideIcon,
} from "lucide-react";

/** Icônes proposées pour les services — vocabulaire BTP / Génie Civil. */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
    HardHat, Building2, Ruler, Drill, TrafficCone, Hammer, Wrench, Truck,
    Map, Mountain, Layers, Compass, PencilRuler, ShieldCheck, Factory, Cable,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name?: string): LucideIcon {
    return (name && SERVICE_ICONS[name]) || HardHat;
}
