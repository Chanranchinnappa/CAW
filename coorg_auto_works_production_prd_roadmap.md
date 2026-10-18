# Coorg Auto Works - Production-Ready PRD & Master Blueprint

## 1. Product Requirements Document (PRD)

### 1.1 Project Overview
**Coorg Auto Works** is a pro-bono digital transformation initiative for a local automobile workshop located in Matturu (near Ponnampet, Coorg). The immediate goal is to establish a lightning-fast, highly optimized, zero-maintenance static website to showcase engine care, custom modifications, restorations, and upcoming builds. The architecture must be lightweight to ensure optimal performance on mobile networks in rural/semi-urban settings, while laying a scalable foundation for a future dynamic vehicle customization module.

### 1.2 Target Audience & User Personas
* **Local Vehicle Owners:** Seeking reliable mechanical repairs, engine overhauls, and routine servicing.
* **Enthusiasts & Collectors:** Looking for custom bodywork, vintage restorations, and performance upgrades.
* **Travelers / Tourists:** Needing emergency roadside or local mechanical support in the Coorg region.

### 1.3 Key Functional Requirements
1. **Landing & Hero Section:** Clear value proposition, high-impact imagery, and instant conversion triggers (Call/WhatsApp).
2. **Services Catalog:** Detailed breakdown of engine refurbishment, servicing, diagnostic repairs, and custom modifications.
3. **Project Showcase Gallery:** Filterable grid displaying finished builds with high-res photography and brief spec sheets.
4. **Upcoming Pipeline:** Teaser section for vehicles currently in the workshop.
5. **Interactive Location & Contact Hub:** Embedded Google Maps, operating hours, direct phone dialing, and instant WhatsApp chat link.
6. **Future-Proof Modular Scalability:** Designed to support a future interactive customization module (make, model, color, upholstery, suspension lifts).

---

## 2. Technical Requirements Document (TRD) & Cost-Optimization Strategy

### 2.1 Technology Stack (Lightweight & High Quality)
* **Architecture:** Static Site Generation (SSG) or pure HTML5/CSS3/Vanilla JS (or lightweight Next.js/Astro) to eliminate server-side rendering overhead.
* **Styling Framework:** Tailwind CSS via CDN or minimal compiled utility classes to maintain sub-50KB asset sizes.
* **Media Optimization:** Next-gen image formats (`.webp`), responsive sizing (`srcset`), and lazy loading to prevent latency on mobile networks.

### 2.2 Cost-Cutting & Cost-Effectiveness Plan ($0 Initial Burn Rate)
* **Hosting ($0/month):** Deploy exclusively on **Vercel's Free Hobby Tier**. Vercel provides global CDN edge caching, automatic HTTPS SSL certificates, and continuous Git deployment at zero cost.
* **Domain Strategy ($0 or Minimal Cost):** 
  * *Option A ($0):* Utilize Vercel’s free subdomain (`*.vercel.app`) during initial rollout to test traction before incurring costs.
  * *Option B (Minimal Annual Cost):* If a custom domain (`coorgautoworks.com` or `.in`) is mandatory, purchase strictly through low-markup registrars (Namecheap/Porkbun) avoiding unnecessary upsells like paid privacy protection or malware scanners.
* **Maintenance ($0):** Zero backend database requirements, eliminating server maintenance, security patching overhead, and database hosting fees.

---

## 3. Master Vivid To-Do List (Actionable by Engineering Team)

### Phase 1: Asset Audit, Content Strategy & Cost Guardrails
* [ ] **1.1 Content & Media Gathering**
  * [ ] Source high-resolution, unedited photos of the workshop, mechanic tools, and detailed close-ups of engine bays and custom paint jobs.
  * [ ] Compile official business details: Exact GPS coordinates for Matturu (near Coorg Sports Club, Balale Road), accurate operating hours, primary phone number, and dedicated WhatsApp business line.
  * [ ] Draft concise, punchy copy highlighting the workshop's USP (precision engineering + custom modifications).
* [ ] **1.2 Technical & Hosting Setup**
  * [ ] Initialize a lightweight Git repository (GitHub) with clear folder structures (`/assets/images`, `/css`, `/js`).
  * [ ] Set up a free Vercel account linked to the GitHub repository for automated CI/CD deployments.
  * [ ] Evaluate domain registration choices; configure DNS records (A and CNAME records) directly through the registrar pointing to Vercel without purchasing third-party bundled add-ons.

### Phase 2: Frontend Development & Lightweight Optimization
* [ ] **2.1 UI/UX Layout Implementation (Modern Industrial Theme)**
  * [ ] Code the responsive navigation bar featuring quick links (Services, Gallery, Upcoming, Contact) and a prominent "Call Us" CTA button.
  * [ ] Build the Hero section using matte-black/charcoal dark-mode aesthetics with metallic silver accents and high-contrast typography.
  * [ ] Develop the Services grid highlighting engine care, refurbishment, and custom fabrication.
* [ ] **2.2 Interactive Gallery & Pipeline Modules**
  * [ ] Implement a lightweight CSS/JS filterable grid for "Finished Projects" vs "Upcoming Builds".
  * [ ] Add a clean modal or lightbox feature for users to inspect high-resolution project photos without layout shift (CLS).
* [ ] **2.3 Communication Integration**
  * [ ] Integrate click-to-call (`tel:`) and direct WhatsApp deep links (`https://wa.me/...`) for instant client acquisition.
  * [ ] Embed a lightweight, responsive Google Maps iframe showing the exact workshop location in Matturu.

### Phase 3: Mobile Performance Engineering & Rigorous Testing
* [ ] **3.1 Mobile Speed & Asset Optimization**
  * [ ] Convert all raster images to `.webp` format and compress them to target under 150KB per image.
  * [ ] Implement native HTML `loading="lazy"` on all below-the-fold images to optimize Initial Page Load.
  * [ ] Audit CSS and JavaScript payloads to ensure total page weight stays under 500KB.
* [ ] **3.2 Device & Network Emulation Testing**
  * [ ] Run Google Lighthouse audits targeting **95+ scores** across Performance, Accessibility, Best Practices, and SEO.
  * [ ] Test responsiveness and touch-target sizes across multiple mobile viewports (iOS Safari, Android Chrome, budget mobile devices).
  * [ ] Test page load performance under simulated slow 4G/3G network throttling to replicate local regional network conditions in Coorg.

### Phase 4: Production Deployment & Handoff
* [ ] **4.1 Final Deployment Verification**
  * [ ] Push final code to the `main` branch and verify automated deployment triggers successfully on Vercel.
  * [ ] Verify SSL certificate activation, custom domain propagation (if applicable), and HTTP-to-HTTPS redirects.
* [ ] **4.2 Client Handoff & Training**
  * [ ] Provide a simple guide to the workshop owner on how to submit new project photos and updates for future content rollouts.