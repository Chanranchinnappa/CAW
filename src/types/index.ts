/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VehiclePlatformId =
  | 'mm540'
  | 'commander'
  | 'major-mdi'
  | 'bolero'
  | 'safari'
  | 'gypsy';

export interface VehiclePlatform {
  id: VehiclePlatformId;
  name: string;
  tagline: string;
  lineup: 'Mahindra' | 'Tata' | 'Maruti Suzuki';
  baseHorsepower: string;
  transmission: string;
  driveType: string;
  description: string;
  heritageStory: string;
  stockSpecs: {
    engine: string;
    displacement: string;
    torque: string;
    groundClearance: string;
    axle: string;
  };
  defaultOptions: ConfiguratorState;
  realPhotos: {
    hero: string;
    front: string;
    side: string;
    interior: string;
    caption: string;
  };
}

export interface PaintOption {
  id: string;
  name: string;
  hex: string;
  finish: 'Matte Military' | 'Gloss Metallic' | 'Satin Estate' | 'Desert Textured' | 'Vintage Pastel';
  inspiration?: string;
  /** Second colour for the gradient: the paint shifts from hex to hex2 across the panel. */
  hex2?: string;
}

export interface TopOption {
  id: string;
  name: string;
  type: 'canvas' | 'bimini' | 'hardtop' | 'expedition' | 'open-tub';
  description: string;
  /** Colours offered for this roof. Empty when the roof is not coloured (open top). */
  colors?: TopColor[];
}

export interface TopColor {
  id: string;
  name: string;
  hex: string;
  hex2?: string;
}

export interface SuspensionOption {
  id: string;
  name: string;
  liftInches: number;
  description: string;
}

export interface WheelOption {
  id: string;
  name: string;
  tyreSpec: string;
  rimSpec: string;
  description: string;
}

export interface ArmorOption {
  id: string;
  name: string;
  category: 'bumper' | 'sliders' | 'snorkel' | 'lighting' | 'skidplate';
  description: string;
}

export interface InteriorOption {
  id: string;
  name: string;
  material: string;
  description: string;
}

export interface ConfiguratorState {
  platformId: VehiclePlatformId;
  paintId: string;
  topId: string;
  topColorId?: string;
  suspensionId: string;
  wheelId: string;
  selectedArmorIds: string[];
  interiorId: string;
}

export interface ShowcaseBuild {
  id: string;
  title: string;
  platform: VehiclePlatformId;
  clientRegion: string;
  year: number;
  engine: string;
  transmission: string;
  buildDuration: string;
  story: string;
  specs: string[];
  terrainNotes: string;
  category: 'Off-Road Trophy' | 'Estate Workhorse' | 'Restomod Classic' | 'Overland Tourer';
  accentColor: string;
  photos?: string[];
}

export interface PipelineBuild {
  id: string;
  bayNumber: number;
  vehicleTitle: string;
  ownerEstate: string;
  currentPhase: string;
  progressPercent: number;
  targetDelivery: string;
  keyWorkItems: string[];
  voiceNotes?: string[];
  photos?: string[];
  lastUpdated?: string;
}

export interface ServiceDetail {
  number: string;
  title: string;
  tagline: string;
  description: string;
  turnaroundNote: string;
}

export interface WorkshopPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}
