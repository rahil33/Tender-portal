Get App
Based on your requirements and the provided websites, I have designed a multi-page corporate tender portal structure and a detailed folder hierarchy for development.

Here is the proposed structure, which is directly derived from the content strategy of the competitor websites you shared and the Figma design concept.

📄 Proposed Website Page Structure
Instead of a single-page layout, this structure organizes content into distinct, SEO-friendly pages.

Homepage (/)

Hero Section: Value proposition for Ahmedabad businesses (e.g., "Win Government Tenders with Expert GeM Support").

Key Services Summary: Icons linking to GeM Registration, Tender Bidding, and OEM Panel services.

Latest Tenders Feed: A live list of the most recent tender notices in Ahmedabad (pulled from data).

Why Choose Us: Trust signals, statistics, and client logos.

Call to Action (CTA): Consultation booking form or contact button.

GeM Consultant (/gem-consultant)

Overview: Benefits of having a local GeM consultant in Ahmedabad.

Services List: Detailed cards for Registration, Catalogue Upload, Vendor Assessment, etc.

Process Flow: Step-by-step guide on how the consultancy works.

Pricing/Packages: Clear plans for MSMEs, OEMs, and startups.

Tenders (/tenders)

Search & Filter: Bar to search by keyword, category (e.g., Construction, IT), or closing date.

Active Tenders List: Paginated table with columns: Title, Authority, Last Date, Value, and an "Apply" or "View Details" button.

GeM Bids Section: Specific category for GeM Custom/BOQ bids.

Services (/services)

GeM Registration Assistance: Detailed sub-page.

Tender Bidding Support: Detailed sub-page.

OEM Panel Setup: Detailed sub-page.

Catalogue & Profile Management: Detailed sub-page.

About Us (/about)

Company story, mission, team expertise.

Years of experience and success metrics.

Resources/FAQ (/resources)

Blog/Articles: Guides on GeM policies.

FAQs: Consolidated list of 10-12 common questions (like the ones from Tender18).

Videos/Tutorials: Visual guides for the portal.

Contact Us (/contact)

Phone, Email, Address (Ahmedabad location).

Contact form.

Map integration.

📁 Folder Structure for Development
This structure follows a Next.js (App Router) pattern, which is ideal for multi-page, SEO-optimized applications. It separates concerns into components, data, and utilities.

text
my-tender-portal/
├── public/                     # Static assets (images, favicons)
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── logos/
│   │   └── team/
│   └── fonts/
│
├── src/
│   ├── app/                    # Next.js App Router (Pages)
│   │   ├── layout.tsx          # Root layout (Header, Footer, SEO meta)
│   │   ├── page.tsx            # Homepage
│   │   ├── gem-consultant/
│   │   │   └── page.tsx        # /gem-consultant
│   │   ├── tenders/
│   │   │   ├── page.tsx        # /tenders (Active list)
│   │   │   └── [id]/
│   │   │       └── page.tsx    # /tenders/123 (Dynamic tender detail)
│   │   ├── services/
│   │   │   ├── page.tsx        # /services (Overview)
│   │   │   ├── registration/
│   │   │   │   └── page.tsx    # /services/registration
│   │   │   ├── bidding/
│   │   │   │   └── page.tsx    # /services/bidding
│   │   │   └── oem-panel/
│   │   │       └── page.tsx    # /services/oem-panel
│   │   ├── about/
│   │   │   └── page.tsx        # /about
│   │   ├── resources/
│   │   │   ├── page.tsx        # /resources (Blog/FAQ listing)
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # /resources/gem-registration-guide
│   │   ├── contact/
│   │   │   └── page.tsx        # /contact
│   │   └── api/                # API routes (for fetching tenders)
│   │       └── tenders/
│   │           └── route.ts    # API endpoint to fetch tender data
│   │
│   ├── components/             # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── LatestTenders.tsx
│   │   │   └── ServicesPreview.tsx
│   │   ├── tenders/
│   │   │   ├── TenderFilters.tsx
│   │   │   ├── TenderTable.tsx
│   │   │   └── TenderDetailCard.tsx
│   │   ├── ui/                 # Shadcn/ui or custom basic elements
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── forms/
│   │       └── ContactForm.tsx
│   │
│   ├── lib/                    # Utility functions & data logic
│   │   ├── constants.ts        # Static data (phone, email, service list)
│   │   ├── utils.ts            # Helper functions
│   │   └── tenderScraper.ts    # Logic to fetch/filter tender data
│   │
│   ├── styles/
│   │   └── globals.css         # Tailwind/CSS imports
│   │
│   └── types/
│       └── index.ts            # TypeScript interfaces (Tender, Service, etc.)
│
├── .env.local                  # Environment variables (API keys)
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
🛠️ Key Implementation Notes
Tender Data Integration: The lib/tenderScraper.ts file would contain functions to either:

Fetch data via API from sources like bidassist.com (if an API key is available).

Parse the provided URLs (like https://bidassist.com/gujarat-tenders/ahmedabad-city/active) to display live data, ensuring you comply with their terms of service.

Design System: The Figma design you linked (Corporate Tender Portal Design) should be implemented using a component library (like Shadcn/ui) in the components/ui/ folder to maintain consistency.

GeM Services Content: The detailed service descriptions (FAQs, benefits) from the tender18.com link should populate the content on the /gem-consultant and /services pages.

Would you like me to help you generate the code for a specific page from this structure, such as the Tenders Listing Page or the GeM Consultant Service Page?

No I want my website page should be not a single landing pages instead I want next next pages
I understand now! You want a multi-page website where users navigate through separate pages (like a traditional website) rather than a single scrolling landing page. Based on the competitor sites and your Figma design, here's the complete multi-page structure and folder hierarchy.

📄 Multi-Page Website Structure (Separate Pages)
Page 1: Home Page (/)
Hero section with value proposition

Featured services overview

Trust indicators (clients, stats)

Latest tender notices preview

CTA section

Page 2: GeM Consultant Services (/gem-consultant)
Comprehensive GeM registration services

OEM panel assistance

Vendor assessment process

Why choose local consultant

Page 3: Tenders Listings (/tenders)
Active tenders in Ahmedabad

Search and filter functionality

Category-wise tender listing

GeM tenders section

Page 4: Tender Details (/tenders/[id])
Individual tender specifications

Eligibility criteria

Documents required

How to apply

Bid submission deadline

Page 5: Services Overview (/services)
All services offered

GeM registration

Tender bidding support

Catalogue management

Training services

Page 6: Service Detail Pages (Multiple sub-pages)
/services/gem-registration

/services/tender-bidding

/services/oem-panel

/services/catalogue-management

/services/training

Page 7: About Company (/about)
Company story

Team members

Years of experience

Success metrics

Mission & vision

Page 8: Resources/Blog (/resources)
Articles about GeM portal

Government procurement guides

Video tutorials

Success stories

Page 9: Blog Post Detail (/resources/[slug])
Full article content

Related posts

Author information

Page 10: FAQ (/faq)
Common questions about GeM

Registration queries

Bidding process questions

Support information

Page 11: Contact Us (/contact)
Contact form

Office address (Ahmedabad)

Phone numbers

Email addresses

Google Maps location

Business hours

Page 12: Privacy Policy (/privacy)
Page 13: Terms & Conditions (/terms)
📁 Complete Folder Structure for Multi-Page Website
text
tender-portal-website/
│
├── public/                         # Static assets
│   ├── images/
│   │   ├── hero/
│   │   │   ├── hero-bg.jpg
│   │   │   └── hero-illustration.svg
│   │   ├── services/
│   │   │   ├── gem-registration.svg
│   │   │   ├── tender-bidding.svg
│   │   │   └── oem-panel.svg
│   │   ├── team/
│   │   │   ├── founder.jpg
│   │   │   └── consultant-1.jpg
│   │   ├── clients/
│   │   │   ├── client-1.png
│   │   │   └── client-2.png
│   │   └── blog/
│   │       ├── blog-1.jpg
│   │       └── blog-2.jpg
│   ├── icons/
│   │   ├── phone.svg
│   │   ├── email.svg
│   │   └── location.svg
│   ├── documents/
│   │   └── tender-guide.pdf
│   └── favicon.ico
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with Header & Footer
│   │   ├── page.tsx                 # Home page
│   │   │
│   │   ├── gem-consultant/          # Page 2
│   │   │   └── page.tsx
│   │   │
│   │   ├── tenders/                 # Page 3 & 4
│   │   │   ├── page.tsx             # All tenders listing
│   │   │   └── [id]/                # Dynamic route
│   │   │       └── page.tsx         # Individual tender detail
│   │   │
│   │   ├── services/                # Page 5 & 6
│   │   │   ├── page.tsx             # Services overview
│   │   │   ├── gem-registration/
│   │   │   │   └── page.tsx         # GeM registration detail
│   │   │   ├── tender-bidding/
│   │   │   │   └── page.tsx         # Tender bidding detail
│   │   │   ├── oem-panel/
│   │   │   │   └── page.tsx         # OEM panel detail
│   │   │   ├── catalogue-management/
│   │   │   │   └── page.tsx         # Catalogue management
│   │   │   └── training/
│   │   │       └── page.tsx         # Training services
│   │   │
│   │   ├── about/                   # Page 7
│   │   │   └── page.tsx
│   │   │
│   │   ├── resources/               # Page 8 & 9
│   │   │   ├── page.tsx             # Blog listing
│   │   │   └── [slug]/              # Dynamic blog posts
│   │   │       └── page.tsx
│   │   │
│   │   ├── faq/                     # Page 10
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/                 # Page 11
│   │   │   └── page.tsx
│   │   │
│   │   ├── privacy/                 # Page 12
│   │   │   └── page.tsx
│   │   │
│   │   ├── terms/                   # Page 13
│   │   │   └── page.tsx
│   │   │
│   │   └── api/                     # API routes for dynamic data
│   │       ├── tenders/
│   │       │   ├── route.ts         # GET all tenders
│   │       │   └── [id]/
│   │       │       └── route.ts     # GET single tender
│   │       └── contact/
│   │           └── route.ts         # POST contact form
│   │
│   ├── components/                   # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Navigation menu
│   │   │   ├── Footer.tsx           # Footer with links
│   │   │   ├── MobileNav.tsx        # Mobile responsive menu
│   │   │   └── Breadcrumbs.tsx      # Page navigation
│   │   │
│   │   ├── home/                    # Home page components
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedServices.tsx
│   │   │   ├── TrustIndicators.tsx
│   │   │   ├── LatestTendersPreview.tsx
│   │   │   └── Testimonials.tsx
│   │   │
│   │   ├── gem-consultant/          # GeM page components
│   │   │   ├── ServicesList.tsx
│   │   │   ├── ProcessSteps.tsx
│   │   │   └── WhyChooseUs.tsx
│   │   │
│   │   ├── tenders/                 # Tenders page components
│   │   │   ├── TenderFilters.tsx
│   │   │   ├── TenderTable.tsx
│   │   │   ├── TenderCard.tsx
│   │   │   ├── TenderDetails.tsx
│   │   │   └── ApplyButton.tsx
│   │   │
│   │   ├── services/                # Services page components
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── ServiceFeatureList.tsx
│   │   │   └── PricingPlans.tsx
│   │   │
│   │   ├── about/                   # About page components
│   │   │   ├── TeamMember.tsx
│   │   │   ├── CompanyStats.tsx
│   │   │   └── Timeline.tsx
│   │   │
│   │   ├── resources/               # Blog components
│   │   │   ├── BlogCard.tsx
│   │   │   ├── BlogSidebar.tsx
│   │   │   ├── AuthorBio.tsx
│   │   │   └── RelatedPosts.tsx
│   │   │
│   │   ├── faq/                     # FAQ components
│   │   │   ├── FAQCategory.tsx
│   │   │   ├── FAQItem.tsx
│   │   │   └── SearchFAQs.tsx
│   │   │
│   │   ├── contact/                 # Contact page components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ContactInfo.tsx
│   │   │   └── Map.tsx
│   │   │
│   │   ├── ui/                      # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   └── shared/                  # Shared components
│   │       ├── PageHeader.tsx
│   │       ├── CTASection.tsx
│   │       └── NewsletterSignup.tsx
│   │
│   ├── lib/                         # Utilities & data
│   │   ├── constants/
│   │   │   ├── navigation.ts        # Menu items
│   │   │   ├── services.ts          # Services data
│   │   │   ├── companyInfo.ts       # Contact & about info
│   │   │   └── faqs.ts              # FAQ data
│   │   ├── utils/
│   │   │   ├── dateFormatter.ts
│   │   │   ├── tenderFilter.ts
│   │   │   └── validation.ts
│   │   ├── api/
│   │   │   ├── tenderAPI.ts         # Tender API calls
│   │   │   └── blogAPI.ts           # Blog API calls
│   │   └── db/
│   │       ├── tenders.json         # Mock tender data
│   │       └── blog.json            # Mock blog data
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes/
│   │       └── corporate.css
│   │
│   ├── types/                       # TypeScript types
│   │   ├── tender.ts
│   │   ├── service.ts
│   │   ├── blog.ts
│   │   └── user.ts
│   │
│   └── hooks/                       # Custom React hooks
│       ├── useTenders.ts
│       ├── useScrollToTop.ts
│       └── useFormSubmit.ts
│
├── .env.local                       # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
🔄 Navigation Flow (Multi-Page Experience)
text
[Home] 
  ↓
[GeM Consultant] → [Services] → [Service Details]
  ↓                        ↓
[Tenders] → [Tender Details]
  ↓
[About]
  ↓
[Resources] → [Blog Posts]
  ↓
[FAQ]
  ↓
[Contact]
🎯 Key Features for Multi-Page Experience
Consistent Header: Same navigation menu across all pages

Breadcrumbs: Shows user location (e.g., Home > Services > GeM Registration)

Footer Links: Quick access to important pages

Active States: Highlight current page in navigation

Page Transitions: Smooth animations between pages

SEO Optimization: Each page has unique meta tags

Sitemap: XML sitemap for search engines

🚀 Implementation Priority
Week 1: Home, GeM Consultant, Services pages

Week 2: Tenders listing, Tender details pages

Week 3: About, Contact, FAQ pages

Week 4: Resources/Blog, Privacy/Terms pages

Week 5: API integration, testing, deployment