// CAW workshop questionnaire -> Google Form
// Paste into script.google.com (New project), press Run on createForm, allow access.
// The form link appears in View > Logs (Execution log).
const SECTIONS = [
 {
  "t": "Precision Engine Overhauls & Rebuilds",
  "d": "A complete mechanical restoration of the internal combustion engine down to the bare block. It involves cylinder head decking, block boring/honing, crankshaft micrometer measurement and journal polishing, new oversized piston rings, main and con-rod bearings, timing gear/chain replacement, ultrasonic fuel injection pump servicing, injector nozzle calibration, and pressure testing the cooling passages.",
  "q": [
   "How many calendar days does a typical complete engine overhaul take at the workshop?",
   "Which machining steps are handled directly in-house (e.g. valve lapping, honing) vs sent to specialized lathe shops in Mysore or Virajpet?",
   "Which specific engines are most frequently overhauled in Coorg (e.g. Di Turbo, Peugeot XD3P, Thar CRDe, Gypsy 1.3, Bolero m2DiCR, Commander MDI)?",
   "What is your warranty period on a rebuilt engine (e.g. 6 months, 10,000 km, or harvest season guarantee)?",
   "How do you calculate engine overhaul labor (is it a flat labor rate plus actual parts cost, or negotiated per vehicle condition)?"
  ]
 },
 {
  "t": "4x4 Drivetrain & Differential Locking Hubs",
  "d": "Overhauling the transfer case (low/high range selector), front and rear drive propeller shafts, universal cross joints, slip yokes, differential crown-pinion backlash shimming, axle shaft spline inspection, and rebuilding manual locking hubs (Aisin, Warn, or factory Lamda hubs) so 4WD reliably engages under load in steep mud without popping out of gear.",
  "q": [
   "What is the actual duration for a complete 4x4 drivetrain rebuild and re-gearing?",
   "Do you offer differential locker installations (mechanical automatic Detroit lockers, manual cable lockers, or pneumatic air lockers)?",
   "Which transfer cases do you most commonly rebuild (Mahindra T-18, BorgWarner electric shift, Maruti Gypsy 4.16:1)?",
   "Do you stock replacement crown-wheel and pinion gearsets for Dana 44 axles?"
  ]
 },
 {
  "t": "Custom Metal Fabrication, Bumpers & Roll Cages",
  "d": "On-site metal cutting, CNC plasma/laser cutting, tube bending, and MIG/TIG welding to create structural off-road protection: winch-ready steel bumpers, heavy-gauge steel rock sliders to protect chassis sills from boulder impacts, internal and external rollover cages, rear tyre carriers, and custom flatbeds for estate pickups.",
  "q": [
   "What metalworking tools are available at the shop (hydraulic tube bender, MIG welder, sheet metal brake, lathe)?",
   "What gauge of steel plate and diameter/thickness of tube do you typically use for custom MM540 / Commander bumpers and sliders?",
   "How long does a bespoke front winch bumper with shackle recovery points take to fabricate from scratch?",
   "Can clients bring their own sketches/dimensions, or do you have standard proven templates for MM540s, Commanders, and Gypsies?"
  ]
 },
 {
  "t": "Suspension Tuning & Shackle Reversal",
  "d": "Reworking leaf spring suspension packs. In factory Mahindra MM540s and Gypsies, the front leaf shackles are positioned at the front bumper, causing harsh kickback over rocks. Shackle reversal moves the pivot point forward and the shackle rearward, allowing the front axle to move rearward as it compresses. Also includes leaf cambering, polyurethane greasable bushings, and custom shock absorber valving.",
  "q": [
   "Do you actively fabricate and install front shackle reversal kits for MM540s and Gypsies at the workshop?",
   "How many days does a complete shackle reversal + leaf re-cambering take?",
   "Do you re-arch existing leaf springs or source new composite/parabolic leaf packs?",
   "What shock absorber brands do you recommend and install (ToughDog, Old Man Emu, Gabriel, Ironman, Monroe)?"
  ]
 },
 {
  "t": "Monsoon Anti-Rust Zinc Priming & Respray",
  "d": "Thorough anti-corrosion protection essential for vehicles living in Kodagu, where rainfall exceeds 3,000–4,000 mm annually. Involves media-blasting or mechanical grinding of rusted panels, rust converter chemical treatment, high-build 2K epoxy zinc primer, cavity wax injection inside hollow box chassis rails, stone-chip polyurethane underbody coating, and full exterior polyurethane or acrylic enamel paint.",
  "q": [
   "What is the actual timeframe for a full body-off rust restoration and paint job?",
   "Do you perform sand/media blasting on-site or chemical wire stripping?",
   "Do you offer bedliner/textured coatings (like Raptor or polyurethane) for tubs and underbodies?",
   "What are the most popular paint finishes requested by Coorg estate owners (e.g. Army Matte Green, Gloss Slate, Desert Tan)?"
  ]
 },
 {
  "t": "Estate Field Rescue & Breakdown Assistance",
  "d": "Emergency roadside and off-road trail recovery for vehicles disabled, bogged down in mud, or with sheared mechanical components across South Kodagu estates and forest tracks.",
  "q": [
   "What is the exact service radius for field recovery from the workshop (e.g. 25 km, South Kodagu only, or entire Kodagu)?",
   "What recovery equipment is carried on your rescue vehicle (winch capacity, onboard welding, high-lift jacks, air compressor)?",
   "Are field calls available 24/7 or only during daylight hours?",
   "Is flatbed towing available for severely disabled vehicles?"
  ]
 },
 {
  "t": "MM540, Commander, Major, Bolero, Safari & Gypsy Lineup Specifications",
  "d": "The technical options displayed in the Bespoke Configurator: engine variants, transmission codes, canopy styles (open canvas, bimini, steel hardtop), tyre sizes (31\", 33\", 7.50-16 bar grip), and interior trim.",
  "q": [
   "What exact MM540 & Commander models do you most commonly build (MM540 DP, MM550 XD3P Army disposal, Classic, Commander 650/750, Major MDI)?",
   "What tyre brands and sizes are actually stocked or fitted (Maxxis Trepador, Goodyear Wrangler, BFG, Apollo Actigrip)?",
   "Who fabricates your canvas soft-tops (local Coorg upholsterer, military surplus, or custom waterproof PVC)?",
   "Please provide real high-resolution photographs of your workshop and completed MM540 builds so we can replace all placeholder visuals!"
  ]
 },
 {
  "t": "In Situ Pricing, Negotiation & Billing Process",
  "d": "How the workshop quotes, bills, and handles customer engagements for vehicle overhauls and custom modifications.",
  "q": [
   "What is your standard consultation process (customer brings vehicle to the workshop vs technician visits estate for inspection)?",
   "What is your deposit policy for custom projects (e.g. 50% advance for donor parts/fabrication, balance on road test)?",
   "Is pricing completely on-call and tailored to each client?",
   "What is the best phone number and primary WhatsApp number for new client inquiries?"
  ]
 }
];

function createForm() {
  const form = FormApp.create('CAW workshop questionnaire');
  form.setDescription('Coorg Auto Works. Answer in your own words; short answers are fine. If you do not know, write "ask the workshop" and who to ask.');
  form.addTextItem().setTitle('Your name').setRequired(true);
  form.addTextItem().setTitle('Your role at the workshop').setRequired(true);
  let n = 0;
  SECTIONS.forEach(function (s, i) {
    form.addPageBreakItem().setTitle((i + 1) + '. ' + s.t).setHelpText(s.d);
    s.q.forEach(function (text) {
      n++;
      form.addParagraphTextItem().setTitle(n + '. ' + text);
    });
  });
  Logger.log('Fill-in link: ' + form.getPublishedUrl());
  Logger.log('Edit link: ' + form.getEditUrl());
}
