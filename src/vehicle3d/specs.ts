/**
 * Dimensions and styling for each base vehicle. All lengths are metres.
 * The model is built in "body space": x runs front (+) to rear (-), y is up
 * from the underside of the sill, z is across the vehicle.
 */

import { VehiclePlatformId } from '../types';

export interface VehicleSpec {
  kind: 'jeep' | 'suv';
  length: number;
  width: number;
  wheelbase: number;
  track: number;
  /** Height of the sill underside above the ground on stock tyres. */
  baseClear: number;
  /** Radius of the stock tyre; bigger tyres lift the body by the difference. */
  stockTyreR: number;
  beltH: number;
  hoodH: number;
  /** x of the firewall / windscreen base. */
  cowlX: number;
  /** Top of the cabin above the sill. */
  roofH: number;
  /** How far the windscreen top sits behind its base. */
  screenRake: number;
  /** x of the rear end of the cabin (SUV) or tub (jeep). */
  cabinRearX: number;
  hoodRound: number;
  grille: 'slots' | 'mesh' | 'bars';
  headlamp: 'round' | 'rect';
  spare: 'rear' | 'none';
  rearSeat: boolean;
  fenderWidth: number;
}

export const SPECS: Record<VehiclePlatformId, VehicleSpec> = {
  mm540: {
    kind: 'jeep', length: 3.7, width: 1.68, wheelbase: 2.03, track: 1.4, baseClear: 0.56, stockTyreR: 0.37,
    beltH: 0.55, hoodH: 0.8, cowlX: 0.72, roofH: 1.3, screenRake: 0.16, cabinRearX: -1.78,
    hoodRound: 0.05, grille: 'slots', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  commander: {
    kind: 'jeep', length: 3.9, width: 1.7, wheelbase: 2.2, track: 1.42, baseClear: 0.56, stockTyreR: 0.37,
    beltH: 0.56, hoodH: 0.82, cowlX: 0.8, roofH: 1.32, screenRake: 0.2, cabinRearX: -1.9,
    hoodRound: 0.06, grille: 'slots', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  'major-mdi': {
    kind: 'jeep', length: 3.95, width: 1.7, wheelbase: 2.25, track: 1.42, baseClear: 0.56, stockTyreR: 0.37,
    beltH: 0.58, hoodH: 0.86, cowlX: 0.84, roofH: 1.36, screenRake: 0.26, cabinRearX: -1.92,
    hoodRound: 0.14, grille: 'bars', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  gypsy: {
    kind: 'jeep', length: 3.43, width: 1.54, wheelbase: 2.375, track: 1.31, baseClear: 0.5, stockTyreR: 0.33,
    beltH: 0.5, hoodH: 0.74, cowlX: 0.72, roofH: 1.28, screenRake: 0.2, cabinRearX: -1.66,
    hoodRound: 0.07, grille: 'slots', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.34,
  },
  bolero: {
    kind: 'suv', length: 3.99, width: 1.7, wheelbase: 2.68, track: 1.41, baseClear: 0.42, stockTyreR: 0.37,
    beltH: 0.84, hoodH: 0.86, cowlX: 0.82, roofH: 1.4, screenRake: 0.34, cabinRearX: -1.98,
    hoodRound: 0.06, grille: 'bars', headlamp: 'rect', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  safari: {
    kind: 'suv', length: 4.47, width: 1.79, wheelbase: 2.65, track: 1.5, baseClear: 0.44, stockTyreR: 0.37,
    beltH: 0.9, hoodH: 0.92, cowlX: 1.0, roofH: 1.46, screenRake: 0.4, cabinRearX: -2.2,
    hoodRound: 0.07, grille: 'mesh', headlamp: 'rect', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  // Draft sizes for the newer models: approximate until real photos or drawings arrive.
  thar: {
    kind: 'jeep', length: 3.92, width: 1.73, wheelbase: 2.43, track: 1.45, baseClear: 0.52, stockTyreR: 0.37,
    beltH: 0.58, hoodH: 0.85, cowlX: 0.78, roofH: 1.36, screenRake: 0.2, cabinRearX: -1.85,
    hoodRound: 0.06, grille: 'slots', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  gurkha: {
    kind: 'jeep', length: 3.86, width: 1.74, wheelbase: 2.4, track: 1.45, baseClear: 0.55, stockTyreR: 0.37,
    beltH: 0.6, hoodH: 0.86, cowlX: 0.76, roofH: 1.38, screenRake: 0.12, cabinRearX: -1.82,
    hoodRound: 0.04, grille: 'bars', headlamp: 'round', spare: 'rear', rearSeat: true, fenderWidth: 0.4,
  },
  innova: {
    kind: 'suv', length: 4.55, width: 1.77, wheelbase: 2.75, track: 1.51, baseClear: 0.38, stockTyreR: 0.33,
    beltH: 0.86, hoodH: 0.85, cowlX: 1.0, roofH: 1.5, screenRake: 0.45, cabinRearX: -2.2,
    hoodRound: 0.1, grille: 'bars', headlamp: 'rect', spare: 'none', rearSeat: true, fenderWidth: 0.36,
  },
  qualis: {
    kind: 'suv', length: 4.12, width: 1.67, wheelbase: 2.65, track: 1.45, baseClear: 0.4, stockTyreR: 0.33,
    beltH: 0.86, hoodH: 0.84, cowlX: 0.86, roofH: 1.6, screenRake: 0.3, cabinRearX: -2.0,
    hoodRound: 0.06, grille: 'bars', headlamp: 'rect', spare: 'rear', rearSeat: true, fenderWidth: 0.36,
  },
  sumo: {
    kind: 'suv', length: 4.15, width: 1.71, wheelbase: 2.45, track: 1.47, baseClear: 0.42, stockTyreR: 0.35,
    beltH: 0.86, hoodH: 0.86, cowlX: 0.84, roofH: 1.58, screenRake: 0.28, cabinRearX: -2.0,
    hoodRound: 0.05, grille: 'mesh', headlamp: 'rect', spare: 'rear', rearSeat: true, fenderWidth: 0.38,
  },
};

/** Paint finishes mapped to physically based material settings. */
export const FINISHES: Record<string, { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number }> = {
  'Matte Military': { roughness: 0.88, metalness: 0.0, clearcoat: 0, clearcoatRoughness: 0.6 },
  'Gloss Metallic': { roughness: 0.38, metalness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.12 },
  'Satin Estate': { roughness: 0.52, metalness: 0.08, clearcoat: 0.35, clearcoatRoughness: 0.35 },
  'Desert Textured': { roughness: 0.95, metalness: 0.0, clearcoat: 0, clearcoatRoughness: 0.7 },
  'Vintage Pastel': { roughness: 0.34, metalness: 0.04, clearcoat: 0.6, clearcoatRoughness: 0.15 },
};

export interface TyreDims {
  /** Overall diameter in metres. */
  dia: number;
  /** Section width in metres. */
  width: number;
  /** Rim diameter in metres. */
  rim: number;
  tread: 'mud' | 'allterrain' | 'bar';
}

const IN = 0.0254;

/** Reads sizes such as "31x10.50 R15 MT", "265/75 R16 AT (31.7")" or "7.50-16". */
export function parseTyre(tyreSpec: string, rimSpec: string): TyreDims {
  let dia = 31 * IN;
  let width = 10.5 * IN;
  let rimIn = 16;

  const flotation = tyreSpec.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\s*R(\d+)/i);
  const metric = tyreSpec.match(/^(\d{3})\/(\d{2})\s*R(\d+)/i);
  const cross = tyreSpec.match(/^(\d+(?:\.\d+)?)-(\d+)/);
  const stated = tyreSpec.match(/\((\d+(?:\.\d+)?)"\)/);

  if (flotation) {
    dia = parseFloat(flotation[1]) * IN;
    width = parseFloat(flotation[2]) * IN;
    rimIn = parseInt(flotation[3], 10);
  } else if (metric) {
    width = parseInt(metric[1], 10) / 1000;
    rimIn = parseInt(metric[3], 10);
    dia = rimIn * IN + 2 * width * (parseInt(metric[2], 10) / 100);
  } else if (cross) {
    width = parseFloat(cross[1]) * IN;
    rimIn = parseInt(cross[2], 10);
    dia = rimIn * IN + 2 * width * 0.98;
  }
  if (stated) dia = parseFloat(stated[1]) * IN;

  const rimM = rimSpec.match(/^(\d+)x/);
  if (rimM) rimIn = parseInt(rimM[1], 10);

  const t = tyreSpec.toUpperCase();
  const tread: TyreDims['tread'] = /\bMT\b/.test(t) ? 'mud' : /BAR|NDCC/.test(t) ? 'bar' : 'allterrain';
  return { dia, width, rim: rimIn * IN, tread };
}

export type WheelStyle = 'beadlock' | 'alloy' | 'classic';

export function wheelStyle(wheelId: string, rimSpec: string): WheelStyle {
  if (/alloy/i.test(rimSpec)) return 'alloy';
  if (/stamped|restored|factory/i.test(rimSpec)) return 'classic';
  if (/bead/i.test(rimSpec) || wheelId.includes('trepador')) return 'beadlock';
  return 'classic';
}

export interface SeatStyle {
  base: string;
  accent: string;
  rough: number;
  stitched: boolean;
}

export function seatStyle(interiorId: string): SeatStyle {
  if (/leather/.test(interiorId)) return { base: '#8a5a33', accent: '#5e3a20', rough: 0.55, stitched: true };
  if (/cordura|tactical/.test(interiorId)) return { base: '#2c2f33', accent: '#4b5043', rough: 0.95, stitched: false };
  return { base: '#3a3f44', accent: '#22262a', rough: 0.6, stitched: false };
}
