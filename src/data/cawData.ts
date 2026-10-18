/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  VehiclePlatform,
  PaintOption,
  TopOption,
  SuspensionOption,
  WheelOption,
  ArmorOption,
  InteriorOption,
  ShowcaseBuild,
  PipelineBuild,
  ServiceDetail,
  WorkshopPhoto,
} from '../types';

/** Choices in the booking form. The value is what the service list sends when someone taps "Discuss this job". */
export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'General Servicing, Inspection & Tuning', label: 'General Servicing, Inspection & Tuning (annual and car services)' },
  { value: 'Vehicle Restoration & Rebuild', label: 'Vehicle Restoration & Rebuild' },
  { value: 'Engine Overhaul & Rebuild', label: 'Engine Overhaul & Rebuild' },
  { value: 'Gearbox, Transfer Case & Axle Servicing', label: 'Gearbox, Transfer Case & Axle Servicing' },
  { value: 'Front Shackle Reversal & Suspension Lift', label: 'Suspension & Front Shackle Reversal' },
  { value: 'Custom Bumper, Winch & Roll Cage Fabrication', label: 'Custom Bumper, Winch & Roll Cage Fabrication' },
  { value: 'Complete Monsoon Rust Treatment & Respray', label: 'Rust Treatment & Respray' },
  { value: 'Jeep Alterations', label: 'Jeep Alterations (power steering, disc brakes, hydraulic clutch)' },
  { value: 'Jeep Trailer Build', label: 'Jeep Trailer Build' },
  { value: 'Irrigation Engine & Pump Building', label: 'Irrigation Self-Priming Engine & Pump Building' },
  { value: 'Underground HDPE Irrigation', label: 'Underground HDPE Irrigation Services' },
  { value: 'Sprinkler Jet Set-up & Fabrication', label: 'Sprinkler Jet Set-up & Fabrication' },
  { value: 'Diesel Generator Build', label: 'Diesel Generator Build' },
];

export const WORKSHOP_INFO = {
  name: 'Coorg Auto Works',
  shortName: 'CAW',
  tagline: 'Precision 4x4 Fabrication & Mechanical Restorations',
  location: {
    village: 'Matturu',
    landmark: 'Near Coorg Sports Club, Balale Road',
    town: 'Ponnampet',
    taluk: 'Virajpet Taluk',
    district: 'Kodagu (Coorg)',
    state: 'Karnataka',
    pincode: '571216',
    gps: '12.1462° N, 75.9084° E',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Coorg+Auto+Works+Matturu+Ponnampet+Kodagu',
  },
  contact: {
    phonePrimary: '+91 99457 42410',
    phoneFormatted: '+91 99457 42410',
    whatsapp: '919945742410',
    email: 'builds@coorgautoworks.in',
    hours: 'Mon – Sat: 8:30 AM – 7:30 PM',
      },
  stats: [
    { label: 'Estate 4x4 Heritage', value: '30+ Years' },
    { label: 'Completed Rebuilds', value: '450+' },
    { label: 'Monsoon Cavity Sealing', value: '100% Zinc-Treated' },
    { label: 'Workshop', value: '4-Bay Facility' },
  ],
};

// Ready file structure for real workshop depot photography when user provides them
export const WORKSHOP_FACILITY_PHOTOS: WorkshopPhoto[] = [];

export const VEHICLE_PLATFORMS: VehiclePlatform[] = [
  {
    id: 'mm540',
    name: 'Mahindra MM540 4x4',
    tagline: 'The Undisputed Western Ghats Workhorse',
    lineup: 'Mahindra',
    baseHorsepower: '62 BHP @ 4500 rpm (XDP 4.90 B, factory brochure)',
    transmission: '4-speed manual, floor shift, with 2-speed transfer case (1:1 high, 2.46:1 low)',
    driveType: '4WD with full-floating front axle',
    description:
      'Engineered with a heavy ladder chassis and mechanical simplicity that conquers muddy coffee estate climbs where electronic modern SUVs falter.',
    heritageStory:
      'The quintessential Coorg estate legend. From the torrential downpours of Kutta to the rocky hairpins of Brahmagiri, the MM540 remains the definitive mountain vehicle of Kodagu.',
    stockSpecs: {
      engine: 'Mahindra XDP 4.90 B diesel, 4-cylinder inline',
      displacement: '2112 cc',
      torque: '12.3 kgm (about 120 Nm) @ 2000 rpm',
      groundClearance: '200 mm',
      axle: 'Front full-floating hypoid, rear semi-floating hypoid, 4.88:1',
    },
    defaultOptions: {
      platformId: 'mm540',
      paintId: 'keswick-olive',
      topId: 'canvas-olive',
      suspensionId: 'shackle-reversal-2',
      wheelId: 'trepador-31',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders', 'snorkel-safari'],
      interiorId: 'waterproof-marine-vinyl',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mahindra MM540 4x4 open-top configuration on wet mountain estate gravel.',
    },
  },
  {
    id: 'commander',
    name: 'Mahindra Commander 650 / 750 (Di)',
    tagline: 'Long-Wheelbase High-Capacity Heavy Duty Cruiser',
    lineup: 'Mahindra',
    baseHorsepower: '63 BHP / 180 Nm MDI 3200 Direct Injection',
    transmission: '4-Speed / 5-Speed Manual with Mechanical 4WD Shift',
    driveType: 'Part-Time 4WD with Heavy Rear Full-Floating Axle',
    description:
      'The long-wheelbase backbone of rural estate transport. Renowned for its indestructible ladder frame, 8-seater payload capacity, and unstoppable low-rpm direct injection diesel torque.',
    heritageStory:
      'Beloved across South Coorg for transporting harvesting crews and coffee bags deep into remote valleys. We re-engineer Commanders with power steering, leaf arching, and rust-proofed custom canvas tops.',
    stockSpecs: {
      engine: 'Mahindra MDI 3200 Direct Injection Diesel',
      displacement: '2523 cc',
      torque: '180 Nm @ 1400-1800 rpm',
      groundClearance: '215 mm',
      axle: 'Full-floating rear axle with heavy-duty hub spindles',
    },
    defaultOptions: {
      platformId: 'commander',
      paintId: 'kalahari-tan',
      topId: 'canvas-sand',
      suspensionId: 'heavy-overland-lift',
      wheelId: 'military-bar-grip',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders', 'snorkel-safari'],
      interiorId: 'tactical-cordura',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mahindra Commander 4WD with extended payload and high-clearance leaf packs.',
    },
  },
  {
    id: 'major-mdi',
    name: 'Mahindra Major / Classic (MDI Di)',
    tagline: 'Short-Wheelbase Direct-Injection Torquer',
    lineup: 'Mahindra',
    baseHorsepower: '63 BHP / 182 Nm MDI 3200TC',
    transmission: '4-Speed / 5-Speed + Dual Ratio Transfer Box',
    driveType: '4WD with Manual Free-Wheeling Hubs',
    description:
      'The modern evolution of the classic CJ3B high-hood stance powered by the legendary direct injection MDI engine. Starts on half a crank even in freezing Brahmagiri winter mornings.',
    heritageStory:
      'A true cult classic. Nimble enough to thread through tight coffee bushes, torquey enough to drag fallen trees off estate tracks with low crawl gearing.',
    stockSpecs: {
      engine: 'MDI 3200TC Direct Injection Turbo Diesel',
      displacement: '2523 cc',
      torque: '182 Nm @ 1500-1800 rpm',
      groundClearance: '215 mm',
      axle: 'Dana 44 rear differential with 4.27:1 crown pinion',
    },
    defaultOptions: {
      platformId: 'major-mdi',
      paintId: 'heritage-arles-blue',
      topId: 'bimini-safari',
      suspensionId: 'shackle-reversal-2',
      wheelId: 'trepador-31',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders', 'rally-hella-pods'],
      interiorId: 'waterproof-marine-vinyl',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mahindra Major / Classic MDI 4x4 ready for muddy estate trails.',
    },
  },
  {
    id: 'bolero',
    name: 'Mahindra Bolero 4x4 / Camper',
    tagline: 'High-Range Heavy Duty Expedition Platform',
    lineup: 'Mahindra',
    baseHorsepower: '75 BHP / 210 Nm m2DiCR',
    transmission: '5-Speed Manual with High/Low BorgWarner Transfer',
    driveType: 'Shift-on-Fly 4WD with Manual Locking Hubs',
    description:
      'The rugged spine of Indian rural transport, converted by CAW into an overlanding master with leaf-over-axle setups, extended fuel tanks, and custom off-grid utility beds.',
    heritageStory:
      'Unforgiving estate roads require payload resilience. Our Bolero builds serve dual duty: carrying 1.5 tons of fresh coffee cherry harvests by day and traversing overland trails by night.',
    stockSpecs: {
      engine: 'm2DiCR 2.5L Direct Injection Turbo Diesel',
      displacement: '2523 cc',
      torque: '210 Nm @ 1600-2200 rpm',
      groundClearance: '225 mm',
      axle: 'Heavy-duty semi-floating Salisbury axle with limited slip',
    },
    defaultOptions: {
      platformId: 'bolero',
      paintId: 'ghats-slate',
      topId: 'expedition-rack-tent',
      suspensionId: 'heavy-overland-lift',
      wheelId: 'at-32-steelies',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders', 'snorkel-safari', 'rally-hella-pods'],
      interiorId: 'vintage-tan-leather',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mahindra Bolero 4x4 Camper expedition overlander with roof tent and high-clearance suspension.',
    },
  },
  {
    id: 'safari',
    name: 'Tata Safari / Sierra Turbo',
    tagline: 'The First Indian Luxury Off-Roader, Reborn',
    lineup: 'Tata',
    baseHorsepower: '90 BHP (2.0L TCIC) or 140 BHP (2.2L Dicor Restomod)',
    transmission: 'G-76 5-Speed Gearbox + Electric Shift BorgWarner 4x4',
    driveType: 'Selectable 4x4 with Rear Limited Slip Differential',
    description:
      'The 90s cult icon revived with modern direct-injection diesel swaps, strengthened torsion bar fronts, progressive rear coil setups, and contemporary cabin climate proofing.',
    heritageStory:
      'When Tata introduced the Safari and Sierra, it redefined Indian roads. At CAW, we preserve that iconic panoramic alpine glass silhouette while addressing factory cooling and steering bottlenecks.',
    stockSpecs: {
      engine: 'Tata TCIC 2.0L Intercooled Turbo or 2.2L Dicor Restomod',
      displacement: '1948 cc / 2179 cc',
      torque: '200 Nm / 320 Nm',
      groundClearance: '205 mm',
      axle: 'Independent double wishbone front, 5-link live coil rear',
    },
    defaultOptions: {
      platformId: 'safari',
      paintId: 'aintree-green',
      topId: 'insulated-hardtop',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'at-32-steelies',
      selectedArmorIds: ['winch-bumper-warn', 'snorkel-safari', 'rally-hella-pods'],
      interiorId: 'vintage-tan-leather',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Tata Sierra / Safari restomod classic with alpine roof glass.',
    },
  },
  {
    id: 'gypsy',
    name: 'Maruti Gypsy King 1.3L',
    tagline: 'Featherweight Rally & Estate Hill Scrambler',
    lineup: 'Maruti Suzuki',
    baseHorsepower: '80 BHP / 103 Nm MPFI 16V',
    transmission: '5-Speed Synchromesh with Ultra-Low Crawl Ratio',
    driveType: 'Part-Time 4WD with Solid Front & Rear Live Axles',
    description:
      'Weighing under 1,000 kg, the Gypsy floats over bottomless monsoon mud where heavy trucks sink. We tune the G13BB engine, install composite leaf springs, and reinforce front kingpins.',
    heritageStory:
      'Used by the Indian Army and Coorg rally legends alike. Its rev-happy Japanese 1.3-litre petrol heart and nimble wheelbase make it an unstoppable weapon on steep estate track ascents.',
    stockSpecs: {
      engine: 'G13BB 1.3L 4-Cylinder 16-Valve MPFI Petrol',
      displacement: '1298 cc',
      torque: '103 Nm @ 4500 rpm',
      groundClearance: '210 mm',
      axle: 'Solid front & rear hypoid axles with Aisin locking hubs',
    },
    defaultOptions: {
      platformId: 'gypsy',
      paintId: 'coniston-cream',
      topId: 'open-trail-tub',
      suspensionId: 'composite-parabolic-leaf',
      wheelId: 'trepador-31',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders', 'rally-hella-pods'],
      interiorId: 'waterproof-marine-vinyl',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Maruti Gypsy King rally scrambler with lightweight open roof and mud tyres.',
    },
  },
  {
    id: 'thar',
    name: 'Mahindra Thar (CRDe)',
    tagline: 'Compact Hill-Country 4x4',
    lineup: 'Mahindra',
    baseHorsepower: 'To be confirmed',
    transmission: 'To be confirmed',
    driveType: 'Part-time 4WD',
    description:
      'A compact Mahindra 4x4 popular for estate roads and weekend trails. Details to be confirmed with the workshop.',
    heritageStory:
      'Draft entry. The workshop will confirm which versions and builds are most common.',
    stockSpecs: {
      engine: 'Mahindra CRDe 2.5L diesel',
      displacement: '2498 cc',
      torque: 'To be confirmed',
      groundClearance: 'To be confirmed',
      axle: 'To be confirmed',
    },
    defaultOptions: {
      platformId: 'thar',
      paintId: 'keswick-olive',
      topId: 'canvas-olive',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'trepador-31',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders'],
      interiorId: 'waterproof-marine-vinyl',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Draft entry for the Mahindra Thar (CRDe).',
    },
  },
  {
    id: 'gurkha',
    name: 'Force Gurkha',
    tagline: 'Boxy Light-Duty 4x4',
    lineup: 'Force',
    baseHorsepower: 'To be confirmed',
    transmission: 'To be confirmed',
    driveType: 'Part-time 4WD',
    description:
      'A boxy light-duty 4x4 from Force Motors. Details to be confirmed with the workshop.',
    heritageStory:
      'Draft entry. The workshop will confirm which versions and builds are most common.',
    stockSpecs: {
      engine: 'To be confirmed',
      displacement: 'To be confirmed',
      torque: 'To be confirmed',
      groundClearance: 'To be confirmed',
      axle: 'To be confirmed',
    },
    defaultOptions: {
      platformId: 'gurkha',
      paintId: 'coniston-cream',
      topId: 'canvas-sand',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'trepador-31',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders'],
      interiorId: 'waterproof-marine-vinyl',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Draft entry for the Force Gurkha.',
    },
  },
  {
    id: 'innova',
    name: 'Toyota Innova',
    tagline: 'Family Estate Carrier',
    lineup: 'Toyota',
    baseHorsepower: 'To be confirmed',
    transmission: 'To be confirmed',
    driveType: 'Rear-wheel drive',
    description:
      'A seven or eight seater used widely on estate and hill roads. Details to be confirmed with the workshop.',
    heritageStory:
      'Draft entry. The workshop will confirm which versions and builds are most common.',
    stockSpecs: {
      engine: 'Toyota 2.5L diesel',
      displacement: '2494 cc',
      torque: 'To be confirmed',
      groundClearance: 'To be confirmed',
      axle: 'To be confirmed',
    },
    defaultOptions: {
      platformId: 'innova',
      paintId: 'aintree-green',
      topId: 'insulated-hardtop',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'at-32-steelies',
      selectedArmorIds: ['rock-sliders'],
      interiorId: 'vintage-tan-leather',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Draft entry for the Toyota Innova.',
    },
  },
  {
    id: 'qualis',
    name: 'Toyota Qualis',
    tagline: 'Boxy Multi-Seater Workhorse',
    lineup: 'Toyota',
    baseHorsepower: 'To be confirmed',
    transmission: 'To be confirmed',
    driveType: 'Rear-wheel drive',
    description:
      'A boxy multi-seater with a long workshop history in Kodagu. Details to be confirmed with the workshop.',
    heritageStory:
      'Draft entry. The workshop will confirm which versions and builds are most common.',
    stockSpecs: {
      engine: 'To be confirmed',
      displacement: 'To be confirmed',
      torque: 'To be confirmed',
      groundClearance: 'To be confirmed',
      axle: 'To be confirmed',
    },
    defaultOptions: {
      platformId: 'qualis',
      paintId: 'aintree-green',
      topId: 'insulated-hardtop',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'at-32-steelies',
      selectedArmorIds: ['rock-sliders'],
      interiorId: 'vintage-tan-leather',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Draft entry for the Toyota Qualis.',
    },
  },
  {
    id: 'sumo',
    name: 'Tata Sumo',
    tagline: 'Rugged Estate Utility',
    lineup: 'Tata',
    baseHorsepower: 'To be confirmed',
    transmission: 'To be confirmed',
    driveType: 'Rear-wheel drive, 4x4 on some versions',
    description:
      'A rugged Tata utility vehicle used for estate work. Details to be confirmed with the workshop.',
    heritageStory:
      'Draft entry. The workshop will confirm which versions and builds are most common.',
    stockSpecs: {
      engine: 'To be confirmed',
      displacement: 'To be confirmed',
      torque: 'To be confirmed',
      groundClearance: 'To be confirmed',
      axle: 'To be confirmed',
    },
    defaultOptions: {
      platformId: 'sumo',
      paintId: 'kalahari-tan',
      topId: 'insulated-hardtop',
      suspensionId: 'stage1-comfort-lift',
      wheelId: 'at-32-steelies',
      selectedArmorIds: ['winch-bumper-warn', 'rock-sliders'],
      interiorId: 'tactical-cordura',
    },
    realPhotos: {
      hero: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      side: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      caption: 'Draft entry for the Tata Sumo.',
    },
  },
];

// Expanded Vintage Modern & Heritage Atelier Paint Collection
export const PAINT_OPTIONS: PaintOption[] = [
  { id: 'keswick-olive', name: 'Keswick Estate Olive', hex: '#2e3a2b', hex2: '#556b4a', finish: 'Gloss Metallic', inspiration: 'Vintage Modern Heritage Military' },
  { id: 'heritage-arles-blue', name: 'Heritage Arles Blue', hex: '#2f5778', hex2: '#7aa6c8', finish: 'Gloss Metallic', inspiration: '1970s Classic Expedition Blue' },
  { id: 'coniston-cream', name: 'Coniston Heritage Cream', hex: '#cdbf9f', hex2: '#f3ead6', finish: 'Gloss Metallic', inspiration: 'Vintage Ivory / Safari Chalk' },
  { id: 'aintree-green', name: 'Aintree Forest Metallic', hex: '#10261a', hex2: '#3f7a56', finish: 'Gloss Metallic', inspiration: 'British Racing & Coffee Canopy Green' },
  { id: 'kalahari-tan', name: 'Kalahari Coffee Ochre', hex: '#6f4a24', hex2: '#c29a5b', finish: 'Gloss Metallic', inspiration: 'Western Ghats Desert Trail Ochre' },
  { id: 'obsidian-basalt', name: 'Obsidian Basalt', hex: '#0b0d10', hex2: '#3a4048', finish: 'Gloss Metallic', inspiration: 'Volcanic Rock Black' },
  { id: 'tuscan-crimson', name: 'Tuscan Heritage Madder', hex: '#4a1219', hex2: '#a23a43', finish: 'Gloss Metallic', inspiration: 'Deep Earth Crimson' },
  { id: 'ghats-slate', name: 'Western Ghats Monsoon Slate', hex: '#2c333b', hex2: '#6f7c8a', finish: 'Gloss Metallic', inspiration: 'Battleship Rain Slate' },
  { id: 'alpine-white', name: 'Brahmagiri Alpine White', hex: '#c9ced6', hex2: '#ffffff', finish: 'Gloss Metallic', inspiration: 'Clean Highland Rally White' },
  { id: 'heritage-bronze', name: 'Kodagu Earth Bronze', hex: '#4e3a24', hex2: '#a77f4f', finish: 'Gloss Metallic', inspiration: 'Metallic Coffee Bean Bronze' },
  { id: 'cauvery-teal', name: 'Cauvery River Teal', hex: '#0f3b40', hex2: '#3fa3a0', finish: 'Gloss Metallic', inspiration: 'Deep River Teal' },
  { id: 'dusk-plum', name: 'Dusk Plum Pearl', hex: '#2b1530', hex2: '#8a4f94', finish: 'Gloss Metallic', inspiration: 'Evening Plum Pearl' },
  { id: 'silver-mist', name: 'Pushpagiri Silver Mist', hex: '#7f8791', hex2: '#e3e7ec', finish: 'Gloss Metallic', inspiration: 'Cool Mountain Silver' },
  { id: 'sunset-copper', name: 'Sunset Copper Flare', hex: '#7a3a1c', hex2: '#e08a4a', finish: 'Gloss Metallic', inspiration: 'Burnished Copper' },
];

// Expanded Canopy & Roof Styles
export const TOP_OPTIONS: TopOption[] = [
  {
    id: 'canvas-olive',
    name: 'Waxed Olive Heavy Canvas with Roll-Up Sides',
    type: 'canvas',
    description: 'Weatherproof military-grade canvas with heavy brass grommets, roll-up rear and side windows for authentic Ghats driving.',
    colors: [
      { id: 'olive', name: 'Olive', hex: '#4b5a3a' },
      { id: 'sand', name: 'Sand', hex: '#b9a778' },
      { id: 'black', name: 'Black', hex: '#1d1f22' },
      { id: 'navy', name: 'Navy', hex: '#233a57' },
      { id: 'maroon', name: 'Maroon', hex: '#5a2227' },
    ],
  },
  {
    id: 'canvas-sand',
    name: 'Kalahari Sand Heavy Marine Canvas',
    type: 'canvas',
    description: 'UV-resistant sand canvas canopy with roll-down rear rain flap and reinforced stress points.',
    colors: [
      { id: 'olive', name: 'Olive', hex: '#4b5a3a' },
      { id: 'sand', name: 'Sand', hex: '#b9a778' },
      { id: 'black', name: 'Black', hex: '#1d1f22' },
      { id: 'navy', name: 'Navy', hex: '#233a57' },
      { id: 'maroon', name: 'Maroon', hex: '#5a2227' },
    ],
  },
  {
    id: 'bimini-safari',
    name: 'Safari Bimini Sun Shade (Open Rear)',
    type: 'bimini',
    description: 'Quick-release canopy covering front occupants while leaving the rear open with exposed structural roll cage.',
    colors: [
      { id: 'olive', name: 'Olive', hex: '#4b5a3a' },
      { id: 'sand', name: 'Sand', hex: '#b9a778' },
      { id: 'black', name: 'Black', hex: '#1d1f22' },
      { id: 'navy', name: 'Navy', hex: '#233a57' },
      { id: 'maroon', name: 'Maroon', hex: '#5a2227' },
    ],
  },
  {
    id: 'insulated-hardtop',
    name: 'Insulated Acoustic Steel Hardtop with Sliding Glass',
    type: 'hardtop',
    description: 'All-weather steel roof with tinted sliding glass, thermal insulation, and roof rack mounting rails.',
    colors: [
      { id: 'black', name: 'Matte black', hex: '#15171a', hex2: '#2e3238' },
      { id: 'white', name: 'Gloss white', hex: '#cfd4db', hex2: '#ffffff' },
      { id: 'olive', name: 'Olive metallic', hex: '#2e3a2b', hex2: '#556b4a' },
      { id: 'silver', name: 'Silver metallic', hex: '#7f8791', hex2: '#e3e7ec' },
    ],
  },
  {
    id: 'expedition-rack-tent',
    name: 'Steel Exoskeleton Rack + Clamshell Roof Tent',
    type: 'expedition',
    description: 'Powder-coated steel exoskeleton basket integrated with high-density aluminium clamshell rooftop tent.',
    colors: [
      { id: 'black', name: 'Black powder coat', hex: '#16181b', hex2: '#3a3f46' },
      { id: 'olive', name: 'Olive powder coat', hex: '#3b4630', hex2: '#6a7a54' },
      { id: 'sand', name: 'Desert sand powder coat', hex: '#a8946a', hex2: '#d9c8a0' },
    ],
  },
  {
    id: 'open-trail-tub',
    name: 'Pure Open-Top Speedster (No Canopy)',
    type: 'open-tub',
    description: 'Stripped-down open cockpit with integrated full DOM roll cage and tubular half-doors for raw trail immersion.',
  },
];

export const SUSPENSION_OPTIONS: SuspensionOption[] = [
  {
    id: 'stage1-comfort-lift',
    name: 'Stock Heavy-Duty Camber Restored',
    liftInches: 0,
    description: 'Factory-correct leaf pack re-arching, polyurethane bushings, and twin-tube gas-charged hydraulic shock absorbers.',
  },
  {
    id: 'shackle-reversal-2',
    name: '+2.0" CAW Shackle Reversal & Parabolic Setup',
    liftInches: 2,
    description: 'Inverts front shackle geometry to eliminate harsh steering kickback on estate ruts; increases wheel travel by 30%.',
  },
  {
    id: 'heavy-overland-lift',
    name: '+3.5" Heavy Payload Expedition Pack',
    liftInches: 3.5,
    description: 'Extra load-carrying capacity (1,200 kg) with nitrogen-reservoir remote shocks and anti-sway disconnects.',
  },
  {
    id: 'composite-parabolic-leaf',
    name: '+2.5" Composite Lightweight Parabolic Springs',
    liftInches: 2.5,
    description: 'Cuts unsprung weight by 35 kg while delivering plush ride compliance and aggressive obstacle clearance.',
  },
];

export const WHEEL_OPTIONS: WheelOption[] = [
  {
    id: 'trepador-31',
    name: '31x10.5 R15 Maxxis Mud Terrains on Steelies',
    tyreSpec: '31x10.50 R15 MT',
    rimSpec: '15x8J Heavy Duty Steel Wheels with Bead-lock Look',
    description: 'Deep directional mud scoops that self-clean sticky red soil on wet Coorg estate slopes.',
  },
  {
    id: 'at-32-steelies',
    name: '265/75 R16 All-Terrain on Negative Offset Alloys',
    tyreSpec: '265/75 R16 AT (31.7")',
    rimSpec: '16x8J -15 Negative Offset Satin Black Off-Road Alloys',
    description: 'Silent high-speed highway manners combined with reinforced puncture-resistant sidewalls.',
  },
  {
    id: 'military-bar-grip',
    name: '7.50-16 Classic Military Chevron Non-Directional',
    tyreSpec: '7.50-16 NDCC Bar Grip',
    rimSpec: '16x6J Factory Restored Stamped Steel Rims with Inner Tubes',
    description: 'The authentic period-correct vintage look that slices through deep boggy ruts down to bedrock.',
  },
];

export const ARMOR_OPTIONS: ArmorOption[] = [
  {
    id: 'winch-bumper-warn',
    name: 'Heavy Duty Steel Winch Bumper + 9,500 lbs Winch',
    category: 'bumper',
    description: '5mm laser-cut CNC bent plate bumper with integrated high-tensile recovery shackles and synthetic rope winch.',
  },
  {
    id: 'rock-sliders',
    name: 'Tubular Chassis-Mounted Rock Sliders',
    category: 'sliders',
    description: '42mm DOM seamless steel tubes bolted directly to the ladder chassis to deflect tree stumps and estate boulders.',
  },
  {
    id: 'snorkel-safari',
    name: 'Sealed Cold-Air Snorkel System',
    category: 'snorkel',
    description: 'Full silicone sealed induction tract routed along the A-pillar for deep river crossings and dust deflection.',
  },
  {
    id: 'rally-hella-pods',
    name: 'Auxiliary Rally Fog & Spot Lamps (Hella / Lightforce)',
    category: 'lighting',
    description: 'Dual bumper-mounted penetrating amber fog beams for thick Kodagu monsoon mist and night estate patrol.',
  },
  {
    id: 'skidplate-protection',
    name: 'Underbody 4mm Aluminium Sump & Gearbox Skidplate',
    category: 'skidplate',
    description: 'Full belly armor safeguarding the engine oil sump, gearbox bellhousing, and transfer case from hidden roots.',
  },
];

export const INTERIOR_OPTIONS: InteriorOption[] = [
  {
    id: 'waterproof-marine-vinyl',
    name: 'Hose-Down Marine Grade Vinyl Seats',
    material: 'UV & Mud Resistant Marine Vinyl',
    description: 'Directly washable with high-pressure water jets; ideal for wet boots, muddy dogs, and working estate gear.',
  },
  {
    id: 'vintage-tan-leather',
    name: 'Saddle Tan Hand-Stitched Leather Cabin',
    material: 'Semi-Aniline Full Grain Waxed Leather',
    description: 'Supple tan leather with diamond quilting, matching door cards, and vintage brass hardware accents.',
  },
  {
    id: 'tactical-cordura',
    name: 'Tactical Charcoal 1000D Cordura with Molle Webbing',
    material: 'Reinforced 1000D Ballistic Cordura',
    description: 'Tear-resistant seats with integrated seatback Molle pouches for first aid kits, machetes, and tow straps.',
  },
];

export const SHOWCASE_BUILDS: ShowcaseBuild[] = [
  {
    id: 'brahmagiri-mm540',
    title: 'The Brahmagiri Shackle Reversal MM540',
    platform: 'mm540',
    clientRegion: 'Kutta, South Coorg',
    year: 1996,
    engine: 'Mahindra Di Turbo 2.6L Rebuilt Engine (78 BHP / 195 Nm)',
    transmission: 'NGT530 5-Speed Manual with Spicer 18 Transfer Case',
    buildDuration: 'Ground-Up Rebuild',
    story:
      'Commissioned by an estate planter whose 1996 MM540 suffered from brittle wiring and rusted wheel arches. CAW performed a complete chassis-off restoration, converted the engine to a Di Turbo, engineered our signature shackle reversal, and fitted 31" Maxxis mud tyres.',
    specs: [
      'Custom CAW Shackle Reversal with parabolic front leafs',
      'Full body media blasted and sprayed in Keswick Estate Olive',
      'Dana 44 rear axle with 4.27:1 differential ratio',
      'Integrated Warn 9.5cti winch and 5mm steel bullbar',
      'Custom waterproof army canvas canopy with zip-open sides',
    ],
    terrainNotes:
      'Tested across 45-degree muddy slopes during the July monsoon in Kutta with zero wheelspin and unmatched crawl stability.',
    category: 'Off-Road Trophy',
    accentColor: '#2e3a2b',
  },
  {
    id: 'estate-bolero-overlander',
    title: 'Monsoon Expedition Bolero 4x4 Camper',
    platform: 'bolero',
    clientRegion: 'Balale Estate, Ponnampet',
    year: 2014,
    engine: 'm2DiCR 2.5L Turbo Diesel with Upgraded Intercooler',
    transmission: '5-Speed Manual with BorgWarner Electric 4WD Hubs',
    buildDuration: 'Overland Fabrication',
    story:
      'Built as an overland touring machine capable of carrying surveying equipment across the Nilgiri-Brahmagiri biosphere while sleeping two passengers atop a custom aluminium clam-shell roof tent.',
    specs: [
      '+3" Heavy payload leaf pack with nitrogen reservoir dampers',
      'Sealed snorkel air intake and dual battery split-charge system',
      'Underbody 4mm marine aluminium bash plates covering sump and transfer box',
      'Full Raptor polyurethane protective coating in Western Ghats Slate',
      'Rear slide-out kitchen drawers and 45-litre onboard water tank',
    ],
    terrainNotes:
      'Clocked over 18,000 km across off-road estate tracks and remote forest passes without a single suspension failure.',
    category: 'Overland Tourer',
    accentColor: '#3d444d',
  },
  {
    id: 'restomod-tata-sierra',
    title: '1997 Tata Sierra Turbo Restomod',
    platform: 'safari',
    clientRegion: 'Madikeri & Gonikoppal',
    year: 1997,
    engine: 'Tata 2.2L Dicor 16V Turbo Diesel Swap (140 BHP / 320 Nm)',
    transmission: 'Tata G-76 5-Speed Manual with Selectable 4x4',
    buildDuration: 'Restomod Classic',
    story:
      'A true passion project for an automotive collector. The donor vehicle was saved from a salvage yard and rebuilt as a modern grand tourer while maintaining its legendary curved alpine glass rear windows.',
    specs: [
      'Engine swap to 2.2L 16V Dicor common-rail with custom ECU harness',
      'Custom front double wishbone suspension with Bilstein B6 dampers',
      'Factory rear 5-link coil setup stiffened with polyurethane bushes',
      'Complete interior re-trim in saddle tan hand-stitched leather',
      'Full sound deadening (dynamat throughout firewall, floor, and roof)',
    ],
    terrainNotes:
      'Effortless 120 km/h cruising on Mysore-Coorg highways, transitioning to sure-footed gravel trail handling.',
    category: 'Restomod Classic',
    accentColor: '#1f3526',
  },
  {
    id: 'rally-spec-gypsy-king',
    title: 'Kutta Coffee Estate Gypsy 4x4 Scrambler',
    platform: 'gypsy',
    clientRegion: 'Kutta Coffee Belt',
    year: 2008,
    engine: 'G13BB 1.3L 16-Valve MPFI with Free-Flow Headers',
    transmission: '5-Speed Manual with 4.16:1 Sumo Low Range Transfer Case',
    buildDuration: 'Track Prep & Rebuild',
    story:
      'Engineered specifically to tackle the extreme mud ruts and steep hill climbs of South Coorg coffee harvests where heavy vehicles easily get bellied out. Stripped of excess weight down to 940 kg.',
    specs: [
      'Lightweight composite parabolic leaf springs with 2.5" lift',
      '4-point certified seamless DOM internal roll cage',
      'Low-range crawler gears installed for effortless idle crawl in 4L',
      'Twin front Hella amber fog pods wired to aircraft toggle switchgear',
      'Quick-release half doors and canvas safari bimini canopy',
    ],
    terrainNotes:
      'Won the local Kodagu 4x4 Mud Sprint and serves as the primary daily patrol vehicle on an 80-acre estate.',
    category: 'Off-Road Trophy',
    accentColor: '#8d683a',
  },
];

// Initial default pipeline bays that can be edited in real-time by the workshop team in the Operations Portal
export const INITIAL_WORKSHOP_PIPELINE: PipelineBuild[] = [
  {
    id: 'bay-1-mm540',
    bayNumber: 1,
    vehicleTitle: '1994 Mahindra MM540 4x4',
    ownerEstate: 'Cauvery River Valley Estate, Balale',
    currentPhase: 'Chassis Rust Inversion & Shackle Reversal',
    progressPercent: 70,
    targetDelivery: 'End of Month',
    keyWorkItems: [
      'Zinc epoxy primer on chassis completed',
      'Front shackle reversal brackets aligned & welded',
      'Rebuilt Di Turbo engine seated on upgraded polyurethane engine mounts',
      'Wiring harness looms pre-routed and heat-sleeved',
    ],
    voiceNotes: [
      'Front shackle reversal bracket geometry verified on laser jig. Leaf bushings torqued to spec.',
    ],
    lastUpdated: 'Today at 4:30 PM',
  },
  {
    id: 'bay-2-safari-dicor',
    bayNumber: 2,
    vehicleTitle: '2004 Tata Safari 4x4 Dicor',
    ownerEstate: 'Brahmagiri Foothills Estate, Kutta',
    currentPhase: 'Cylinder Head Machining & 4x4 Drivetrain Reseal',
    progressPercent: 45,
    targetDelivery: 'Mid Next Month',
    keyWorkItems: [
      'Cylinder head pressure tested and valves diamond-lapped',
      'BorgWarner 4x4 transfer motor rebuilt and bench tested',
      'New heavy duty dual-mass flywheel and clutch assembly installed',
      'Radiator upgraded to heavy-duty 3-row aluminum core',
    ],
    voiceNotes: [
      'Cylinder head tested at 45 PSI with zero micro-cracks. Waiting on new OEM head gasket.',
    ],
    lastUpdated: 'Yesterday at 6:15 PM',
  },
  {
    id: 'bay-3-bolero-camper',
    bayNumber: 3,
    vehicleTitle: '2018 Mahindra Bolero Camper 4WD',
    ownerEstate: 'Coffee & Pepper Plantation, Gonikoppal',
    currentPhase: 'Custom Utility Bed & Overlanding Canopy Fabrication',
    progressPercent: 85,
    targetDelivery: 'Next Week',
    keyWorkItems: [
      'Steel flatbed with heavy-duty drop sides fabricated',
      '12,000-lb winch integrated into custom front bullbar',
      'Old Man Emu heavy load rear leaf packs installed',
      'Final topcoat paint in Western Ghats Satin Slate',
    ],
    voiceNotes: [
      'Flatbed latching hinges welded with grease fittings. Ready for primer coat.',
    ],
    lastUpdated: '2 days ago',
  },
  {
    id: 'bay-4-commander-di',
    bayNumber: 4,
    vehicleTitle: '1998 Mahindra Commander 750 Di',
    ownerEstate: 'Ponnampet Coffee Planter',
    currentPhase: 'Leaf Springs Re-Arching & Power Steering Retrofit',
    progressPercent: 60,
    targetDelivery: 'In 2 Weeks',
    keyWorkItems: [
      'Leaf spring packs dismantled and cold re-cambered',
      'RC-50 hydraulic power steering box mounted with reinforced plate',
      'MDI 3200 diesel fuel injection pump tested on calibration bench',
      'Chassis rail underbody wash and rust converter application',
    ],
    voiceNotes: [
      'Power steering pitman arm aligned with drag link. Zero bump steer.',
    ],
    lastUpdated: 'Today at 11:00 AM',
  },
];
