Remove two specific sections from the 13-page corporate tender portal design OR replace them with better alternatives as described below.

Sections to Remove:
Section 1: "Numbers That Speak for Themselves" (Stats Section)

Current content: "50,000+ Active Clients" and "10+ Years Experience"

Action: DELETE this entire section completely from all pages (especially Homepage and About Us page)

Remove any related components: stat cards, counter animations, background patterns

Ensure no empty space remains – adjacent sections should connect seamlessly

Section 2: "Trusted by Leading Organizations" (Client Logos)

Current content: Client logos (CLIENT 1 through CLIENT 6) with badges (ISO, 4.9 rating, GDPR)

Action: DELETE this entire section completely from all pages

Remove logo grids, carousels, and trust badges

Close the gap between remaining sections with proper spacing (80px vertical)

Alternative Replacements (Choose One):
Option A: No Replacement (Clean Removal)

Simply delete both sections

Adjust the page flow:

Homepage: 3D Carousel → Latest Tenders → Services Grid → Testimonials → Get Started Section

About Us: Company Story → Team Members → Mission/Vision → Office Location

Maintain 80px spacing between all remaining sections

Option B: Replace with "Why Choose Us" Section (Single replacement)

Create ONE new section that combines credibility without stats or logos

3 columns with icons and short text:

Column 1: "Expert GeM Consultants" – "Certified professionals with deep platform knowledge"

Column 2: "End-to-End Support" – "From registration to winning bids, we handle everything"

Column 3: "Proven Track Record" – "Trusted by businesses across Ahmedabad"

Style: Glassmorphism cards, gold icons, no numbers or client names

Placement: Between Services Grid and Testimonials

Option C: Replace with "Our Certifications" Section (Subtle credibility)

Small, minimal section with 3 certification badges only

Badges: "ISO 9001:2015 Certified", "MSME Registered", "GeM Authorized Consultant"

No client logos, no rating numbers

Style: Small circular or rounded badges with checkmark icons

Placement: Footer area (above footer, small footprint)

Specific Removal Instructions for Figma:
For the Stats Section (Numbers):

Locate frames/layers named: "Stats", "Numbers", "Counter", "Achievements", "Trusted Nationwide"

Delete all child components: stat cards, number counters, "10+ Years" text, "50,000+" text

Remove background containers and decorative elements

Re-connect the parent sections above and below (e.g., connect "Our Services" to "Testimonials")

For the Client Logos Section:

Locate layers named: "Clients", "Trusted By", "Logos", "Partners", "Organizations"

Delete logo grids, carousel components, individual client logos (CLIENT 1-6)

Delete trust badges: "ISO 9001:2015 Certified", "4.9/5 Client Rating", "GDPR Compliant"

Remove any divider lines or background patterns

Page-by-Page Cleanup Checklist:
Homepage: Both sections removed, page flows without gaps

About Us: Stats section removed, team section moves up

GeM Consultant: No stats or logos appear in sidebar or footer

Services: No trust badges on service detail pages

Contact: No logo carousel above contact form

All other pages: Verify no remnants of these sections exist

Spacing Fixes After Removal:
Standard vertical spacing between remaining sections: 80px (desktop), 48px (tablet), 32px (mobile)

Example homepage flow with correct spacing:

text
3D Carousel (Hero)
[80px gap]
Latest Tenders Preview
[80px gap]
Our Services Grid
[80px gap]
Testimonials
[80px gap]
Get Started Today Section
[80px gap]
Footer
Output: Provide the cleaned Figma file with both sections completely removed, no empty containers, and proper spacing restored. Show before/after if possible.

🛠️ Quick CSS to Hide These Sections (Temporary Fix)
If you need to remove them from your live website immediately while you redesign, add this CSS:

css
/* Remove the Numbers/Stats section */
section:has(.stats-container),
section:has(.numbers-section),
section:has(.achievements),
section:has([class*="stats"]),
section:has([class*="counter"]),
div:has(> .stats-wrapper) {
  display: none !important;
}

/* Remove the Client Logos section */
section:has(.clients-section),
section:has(.trusted-by),
section:has(.logo-carousel),
section:has([class*="client"]),
section:has([class*="partner"]),
div:has(> .logos-grid) {
  display: none !important;
}

/* Adjust spacing after removal */
section:not(:hidden) + section:not(:hidden) {
  margin-top: 80px;
}

@media (max-width: 768px) {
  section:not(:hidden) + section:not(:hidden) {
    margin-top: 48px;
  }
}
🎯 Alternative: Simplified Trust Indicator (Recommended)
Instead of the cluttered stats and logos, add this single, elegant trust line somewhere subtle (e.g., above footer or next to CTA):

css
/* Simple trust bar - replaces both sections */
.trust-bar {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 24px;
  background: rgba(10, 37, 64, 0.05);
  border-radius: 12px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #0A2540;
}

.trust-item::before {
  content: "✓";
  color: #FFB347;
  font-weight: bold;
  font-size: 18px;
}

@media (max-width: 768px) {
  .trust-bar {
    gap: 24px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
HTML for the simplified trust bar:

html
<div class="trust-bar">
  <div class="trust-item">ISO 9001:2015 Certified</div>
  <div class="trust-item">4.9/5 Client Rating</div>
  <div class="trust-item">10+ Years Experience</div>
  <div class="trust-item">GeM Authorized Consultant</div>
</div>
✅ Summary
Action	Method
Remove both sections in Figma	Use the Figma prompt above
Remove from live website	Use the CSS display:none code
Replace with minimalist trust bar	Use the HTML/CSS trust bar code
Complete removal	Verify all 13 pages have no remnants