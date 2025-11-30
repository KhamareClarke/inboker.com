# Evaluation of Webpage Design and Usability
## B&Q (diy.com) Website Assessment

**Student Number:** [INSERT YOUR 8-DIGIT STUDENT NUMBER]

**Date:** November 2025

**Website Evaluated:** https://www.diy.com (B&Q)

---

## 1. Introduction

This report presents a comprehensive evaluation of the design and usability of the B&Q website (diy.com), one of the United Kingdom's leading DIY and home improvement retailers. The evaluation employs established usability guidelines including Nielsen's 10 Usability Heuristics, Nielsen's Homepage Usability Guidelines, and principles from the Lynch & Horton Web Style Guide to assess the website's effectiveness in supporting user tasks.

The evaluation focuses on key user journeys, including product search, navigation, and information discovery. Through systematic analysis of interface elements, navigation structures, and interaction patterns, this report identifies both strengths and areas for improvement in the website's design.

---

## 2. Homepage Design and Navigation

### 2.1 Navigation Structure

The B&Q homepage demonstrates a well-organised navigation system that follows Nielsen's heuristic of "Recognition rather than recall" (Nielsen, 1994). The primary navigation bar is consistently positioned at the top of the page, featuring clear visual icons and text labels for key sections: Menu, Hello B&Q, Ideas & Advice, Services, Stores, and Basket.

**Figure 1: Primary Navigation Bar**
*[Screenshot showing: Top navigation with Menu, Hello B&Q, Ideas & Advice, Services, Stores, and Basket icons with text labels]*

**Analysis:** The navigation follows Nielsen's Homepage Usability Guideline #1: "Make it immediately clear what the site offers" (Nielsen & Tahir, 2001). The use of both icons and text labels supports accessibility and reduces cognitive load. However, the "Menu" button's functionality could be more explicit—users must click to discover the full category structure, which may violate the "Visibility of system status" heuristic if the menu structure is not immediately apparent.

**Recommendation:** Consider adding a visual indicator (such as a dropdown arrow) or a brief preview of main categories on hover to improve discoverability without requiring a click.

### 2.2 Skip to Content Link

The website includes a "Skip to content" link at the very top of the page, which is excellent for accessibility compliance and follows WCAG 2.1 guidelines.

**Analysis:** This feature demonstrates adherence to accessibility best practices and supports users who navigate via keyboard or screen readers. This aligns with Nielsen's heuristic #7: "Flexibility and efficiency of use" by providing shortcuts for experienced users.

### 2.3 Postcode Entry for Delivery Options

A prominent postcode entry feature appears below the main navigation, allowing users to enter their location for delivery and collection options.

**Figure 2: Postcode Entry Section**
*[Screenshot showing: "For delivery & collection options - Enter your postcode" button]*

**Analysis:** This feature follows Nielsen's Homepage Guideline #3: "Help users find what they need" by providing location-specific information early in the user journey. However, the implementation could be improved—the button label "Enter your postcode" suggests an input field, but clicking reveals a modal or form, which may violate the "Match between system and the real world" heuristic (Nielsen, 1994).

**Recommendation:** Replace the button with an actual input field or change the label to "Set your location" to better match user expectations.

### 2.4 Main Navigation Menu Structure

The primary navigation menu is accessed via a hamburger menu button, revealing a comprehensive category structure when opened.

**Figure 7: Menu Navigation**
*[Screenshot showing: Open navigation menu with categories including All Categories, Offers & Trends, Christmas, Painting & Decorating, Home & Furniture, Building & Hardware, Garden & Landscaping, Kitchen & Appliances, Bathroom & Showers, and Tiling & Flooring]*

**Analysis:** The menu structure demonstrates several usability strengths and weaknesses:

**Strengths:**
1. **Clear Hierarchy:** The menu presents a logical categorisation system that aligns with how users think about DIY products (e.g., "Painting & Decorating", "Building & Hardware").
2. **Sign-in Integration:** The menu includes "Sign in" and "Register" options at the top, providing easy access to account features.
3. **Expandable Categories:** Chevron icons (>) indicate that categories have sub-menus, following the "Visibility of system status" heuristic.
4. **Scrollable Design:** The menu includes a scrollbar, indicating additional categories are available below the fold.

**Weaknesses:**
1. **Hidden Navigation:** The menu is completely hidden until clicked, which violates Nielsen's Homepage Guideline #1: "Make it immediately clear what the site offers." Users cannot see the full site structure without interaction.
2. **No Preview:** Unlike mega-menu designs, users cannot preview subcategories without clicking, potentially increasing interaction cost.
3. **Accessibility Concerns:** The menu overlay may trap keyboard focus, and the close button (X) placement may not be immediately obvious to all users.

**Recommendation:** Consider implementing a hybrid approach: display top-level categories in the header while using the menu for detailed subcategories. Alternatively, add a preview on hover for desktop users to improve discoverability without requiring clicks.

---

## 3. Search Functionality

### 3.1 Search Bar Design and Autocomplete

The search functionality is prominently placed in the header, featuring a combobox that provides real-time autocomplete suggestions as users type.

**Figure 3: Search with Autocomplete Suggestions**
*[Screenshot showing: Search bar with "paint" typed, displaying 12 suggestions including "paint", "paint roller", "paint brush", "bathroom paint", etc.]*

**Analysis:** The search implementation demonstrates excellent adherence to several usability principles:

1. **Visibility of System Status (Heuristic #1):** The autocomplete dropdown appears immediately as users type, providing clear feedback that the system is processing their input.

2. **Recognition rather than Recall (Heuristic #6):** The suggestions help users discover related products without needing to remember exact product names or terminology.

3. **Error Prevention (Heuristic #5):** By showing suggestions, the system helps prevent spelling errors and guides users toward valid search terms.

The search provides 12 relevant suggestions for the query "paint", including specific product types (paint roller, paint brush) and use cases (bathroom paint, paint for walls and wood). The suggestions are well-organised and appear to be ranked by relevance.

**Strengths:**
- Clear visual feedback with expanded listbox
- Accessible implementation using proper ARIA attributes (combobox, listbox, options)
- Screen reader support indicated by "12 search suggestions available" announcement
- Clear button to dismiss suggestions

**Recommendation:** Consider adding keyboard navigation indicators or highlighting the first suggestion by default to support power users who prefer keyboard navigation.

### 3.2 Search Results Page

When users submit a search query, they are directed to a search results page that displays matching products.

**Figure 13: Search Results Page**
*[Screenshot showing: Full search results page for "paint" query with product listings, filters, sorting options, and pagination]*

**Analysis:** The search results page is critical for user success in finding products. Key observations:

**Strengths:**
1. **Breadcrumb Navigation:** The page includes breadcrumbs (Home > Painting & Decorating), supporting user orientation and navigation (Nielsen's Heuristic #8: Help and documentation).
2. **Filter Options:** Left sidebar provides filtering capabilities, allowing users to narrow results by price, brand, features, etc.
3. **Sorting Options:** Users can sort results by relevance, price, rating, etc., providing control over result presentation.
4. **Result Count:** The page displays the number of results found, providing system status feedback.
5. **Product Cards:** Consistent product card design maintains visual consistency across the site.

**Areas for Improvement:**
1. **Filter Visibility:** Filters may be collapsed or hidden on smaller screens, reducing discoverability.
2. **Applied Filters Display:** No clear indication of which filters are currently active, violating "Visibility of system status."
3. **No Results Handling:** The page structure suggests handling for zero results, but this was not tested.

**Recommendation:** Ensure filters are always visible or clearly accessible. Display active filters prominently with clear "remove" options. Implement helpful messaging for zero-result searches with suggestions for alternative queries.

---

## 4. Homepage Content Organisation

### 4.1 Value Propositions and Trust Signals

The homepage features four prominent value proposition cards displayed horizontally:

1. Click + Collect (15 minutes)
2. Free delivery on 1000s of products
3. 90 day returns policy
4. Join B&Q Club (Save up to £100 a year)

**Figure 4: Value Proposition Cards**
*[Screenshot showing: Four cards with icons and headings for delivery options, returns, and membership]*

**Analysis:** This layout follows Nielsen's Homepage Guideline #2: "Communicate what the site does" and Guideline #4: "Show examples of the site's content" (Nielsen & Tahir, 2001). The cards effectively communicate key benefits and build trust through clear messaging about delivery speed, returns policy, and savings opportunities.

However, the placement of these trust signals below the navigation but above the main content creates a visual hierarchy that may compete with the primary call-to-action (Black Friday promotion). This could violate the "Aesthetic and minimalist design" heuristic (Nielsen, 1994) by presenting too many competing elements.

**Recommendation:** Consider consolidating these into a more compact format or moving them to the footer, allowing the promotional content to have greater visual prominence.

### 4.2 Promotional Content and Black Friday Campaign

The homepage is dominated by Black Friday promotional content, with a large hero banner and multiple product carousels.

**Analysis:** While promotional content is important for e-commerce, the extensive Black Friday messaging creates several usability concerns:

1. **Information Overload:** Multiple carousels and promotional sections may overwhelm users seeking specific products, violating the "Aesthetic and minimalist design" heuristic.

2. **Content Hierarchy:** The promotional content takes precedence over category navigation, which may hinder users with specific shopping goals.

3. **Temporal Relevance:** The heavy promotion of a time-limited sale may create urgency but could frustrate users who arrive after the sale ends if the content is not updated promptly.

**Recommendation:** Implement a more balanced approach with clear separation between promotional content and core navigation. Consider a collapsible promotional banner that users can dismiss.

---

## 5. Product Listings and Information Architecture

### 5.1 Product Card Design

Product listings on the homepage feature cards with images, titles, ratings, prices, and "Add to basket" buttons.

**Figure 5: Product Card Example**
*[Screenshot showing: Product card with image, title "Soudal Trade White Decorators caulk 290ml", star rating (3.3/5 from 253 reviews), price (£1, was £1.50), and "Add to basket" button]*

**Analysis:** The product cards follow several best practices:

1. **Consistency and Standards (Heuristic #4):** All product cards follow the same layout structure, making it easy for users to scan and compare products.

2. **User Control and Freedom (Heuristic #3):** Each product is clickable, allowing users to view details before adding to basket.

3. **Recognition rather than Recall:** Product images, clear titles, and ratings provide sufficient information without requiring users to remember product details.

**Strengths:**
- Clear pricing with original price and savings highlighted
- Star ratings with review counts provide social proof
- Prominent "Add to basket" button with clear labelling
- Unit pricing displayed (£3.45 per l) aids comparison

**Areas for Improvement:**
- Some product titles are truncated (e.g., "Emma hybrid premiu double mattress" appears cut off)
- The "Black Friday Event" badge on some products may not be immediately distinguishable from other badges

**Recommendation:** Ensure product titles are fully visible or provide hover tooltips. Standardise badge design for better visual hierarchy.

### 5.2 Category Navigation and Carousel Design

The "Find your favourites" section presents categories in a carousel format, including Offers, Gift cards, Heating, Christmas trees, and various product categories.

**Figure 11: Homepage Category Carousel**
*[Screenshot showing: "Find your favourites" section with circular category icons in a carousel, including Offers, Gift cards, Heating, Christmas trees, Christmas decorations, and Insulation, with navigation dots and arrows]*

**Analysis:** The carousel implementation allows for space-efficient presentation of many categories, but carousels can present usability challenges:

1. **Discoverability:** Users may not realise additional categories exist beyond the visible items, violating "Visibility of system status."

2. **Accessibility:** Carousel navigation may be difficult for users with motor impairments or those using assistive technologies.

3. **Mobile Usability:** While carousels can work on mobile, they may be less intuitive than a grid layout.

**Positive Aspects:**
- The carousel includes navigation dots (indicating "1 of 3") which partially addresses discoverability concerns
- Circular icons with images provide visual recognition cues
- Previous/Next arrows are present for navigation

**Recommendation:** Consider adding category indicators (e.g., "1 of 3") more prominently and ensure keyboard navigation is fully supported. Alternatively, provide a "View all categories" link to a dedicated categories page. Consider implementing auto-pause on hover to prevent accidental navigation.

### 5.3 Product Detail Page Analysis

When users click on a product, they are taken to a detailed product page that provides comprehensive information.

**Figure 18: Detailed Product Page**
*[Screenshot showing: Full product detail page for "Soudal Trade White Decorators caulk 290ml" with product images, title, pricing, ratings, specifications, breadcrumbs, and purchase options]*

**Analysis:** Product detail pages are critical for conversion and user decision-making. Detailed observations:

**Strengths:**
1. **Comprehensive Information Architecture:**
   - Breadcrumb navigation (Home > Painting & decorating > Decorating tools & supplies > Caulk) provides clear context
   - Product information section with detailed description
   - Features and benefits clearly listed
   - Specifications table with structured data
   - Health and safety information prominently displayed

2. **Clear Call-to-Action:**
   - "Add to basket" button is prominently placed and clearly labeled
   - Quantity selector allows users to adjust quantity before adding
   - Postcode entry for delivery options is integrated into the product page

3. **Social Proof:**
   - Customer ratings displayed (3.3/5 from 253 reviews)
   - Review count provides credibility
   - "Added to bag 141 times in the last 12 hours" creates urgency and social validation

4. **Pricing Transparency:**
   - Current price (£1) clearly displayed
   - Original price (£1.50) shown with savings (£0.50)
   - Unit pricing (£3.45 per l) aids comparison

5. **Trust Signals:**
   - "Sold & shipped by B&Q" indicates authenticity
   - "Item in stock for Home Delivery" provides availability information
   - Health and safety data sheets (SDS) accessible

**Areas for Improvement:**
1. **Image Gallery:** Single product image visible; multiple images may require interaction to discover
2. **Stock Information:** Availability information requires postcode entry, which may delay decision-making
3. **Related Products:** Not immediately visible; may require scrolling
4. **Wishlist Functionality:** Present but may not be immediately obvious

**Recommendation:** Ensure multiple product images are visible without requiring clicks. Display stock availability without requiring postcode entry initially. Add related products section above the fold. Make wishlist functionality more prominent for users who want to save items for later.

### 5.4 Category Pages and Filtering

Category pages present products within a specific category with filtering and sorting capabilities.

**Figure 14: Category Page with Filters**
*[Screenshot showing: Christmas Trees category page with left sidebar filters, product grid, sorting options, and breadcrumb navigation]*

**Analysis:** Category pages serve as critical navigation points in the user journey:

**Strengths:**
1. **Breadcrumb Navigation:** Clear path showing user location (Home > Christmas > Christmas trees)
2. **Filter Sidebar:** Left sidebar provides comprehensive filtering options
3. **Product Grid:** Consistent product card layout facilitates scanning
4. **Sorting Options:** Multiple sort criteria (price, rating, popularity) available
5. **Category Description:** Some category pages include helpful descriptions

**Filter Implementation Analysis:**
- Filters appear to be organised logically (Price, Brand, Features, etc.)
- Checkbox/radio button controls follow standard patterns
- Filter application may require page refresh or dynamic update

**Potential Issues:**
1. **Filter Discoverability:** Filters may be hidden on mobile or require scrolling
2. **Active Filter Indication:** May not clearly show which filters are applied
3. **Filter Reset:** No clear "Clear all filters" option visible
4. **Filter Count:** May not show number of results per filter option

**Recommendation:** Implement persistent filter visibility with clear active state indicators. Add "Clear all" functionality. Show result counts for each filter option. Ensure filters work without page refresh for better user experience. Consider implementing filter chips above results to show active filters.

### 5.4 Recommended Products Section

The homepage includes a "Recommended for you" section that displays personalised product suggestions.

**Figure 12: Recommended Products Section**
*[Screenshot showing: "Find your favourites" and "Seasonal inspiration" sections with category carousels and product recommendations]*

**Analysis:** Personalisation features can enhance user experience by reducing search effort, but they must be implemented carefully:

**Strengths:**
1. **Relevance:** If recommendations are accurate, they can significantly reduce user effort in finding products.
2. **Visual Consistency:** Recommended products follow the same card design as other product listings, maintaining consistency.

**Potential Issues:**
1. **Privacy Concerns:** Users may be uncomfortable with personalisation if not clearly explained.
2. **Accuracy:** Poor recommendations can frustrate users and reduce trust.
3. **Discoverability:** Users may not realise these are personalised recommendations.

**Recommendation:** Clearly label personalised sections and provide an option to view all products or adjust personalisation preferences. Ensure recommendations are relevant and update based on user behaviour.

---

## 6. Footer Design and Information Architecture

### 6.1 Footer Structure

The footer is comprehensive, organised into five main sections: Business, Services, Products, Help & Support, and Partner Sites.

**Figure 6: Footer Navigation**
*[Screenshot showing: Footer with five columns of links, social media icons, and legal links]*

**Analysis:** The footer follows Lynch & Horton's principle of providing comprehensive site navigation and supporting information (Lynch & Horton, 2009). The organisation is logical and supports users seeking specific information types.

**Strengths:**
- Clear section headings facilitate scanning
- Logical grouping of related links
- Social media links are easily accessible
- Legal and policy links are present (Terms & Conditions, Privacy Policy, Cookie Preferences)

**Areas for Improvement:**
- The footer is quite extensive, which may require scrolling on smaller screens
- Some links open external sites (e.g., bandqcareers.com) without clear indication

**Recommendation:** Add visual indicators (such as an external link icon) for links that navigate away from the main site. Consider implementing an accordion-style footer for mobile devices to reduce scrolling.

### 6.2 Cookie Preferences and Privacy

The footer includes a "Cookie Preferences" button, demonstrating compliance with GDPR requirements.

**Analysis:** This feature supports user control and transparency, aligning with Nielsen's heuristic #3: "User control and freedom." However, the placement in the footer may make it less discoverable for users who want to manage their privacy settings immediately.

**Recommendation:** Consider displaying a cookie consent banner on first visit with a prominent link to cookie preferences, in addition to the footer link.

---

## 7. Store Finder and Location Services

### 7.1 Store Locator Functionality

The website includes a store finder feature accessible via the "Stores" button in the navigation.

**Figure 9: Store Finder Modal**
*[Screenshot showing: "Find a store" modal with postcode/town input field and "Use my current location" option]*

**Analysis:** The store finder implementation demonstrates several usability considerations:

**Strengths:**
1. **Clear Purpose:** The modal title "Find a store" immediately communicates the feature's function.
2. **Multiple Input Methods:** Users can enter a postcode/town or use their current location, providing flexibility (Nielsen's Heuristic #7: Flexibility and efficiency of use).
3. **Accessible Design:** The input field is clearly visible with proper focus states (orange border).
4. **Clear Dismissal:** The X button in the top-right corner provides an obvious exit path (Nielsen's Heuristic #3: User control and freedom).

**Areas for Improvement:**
1. **Modal vs. Page:** Using a modal for store location may interrupt the user's flow. Some users may prefer a dedicated page.
2. **Location Permission:** The "Use my current location" feature requires browser permissions, which may not be immediately clear to users.
3. **Error Handling:** The modal does not show examples of valid input formats, which could lead to errors.

**Recommendation:** Consider providing both modal and page options. Add input validation feedback and examples of valid postcode formats. Clearly explain location permission requirements before requesting access.

---

## 8. Shopping Basket and Checkout Flow

### 8.1 Empty Basket State

The shopping basket page provides feedback when no items are present.

**Figure 10: Empty Basket Page**
*[Screenshot showing: Empty basket with illustration, "Your basket is empty" message, and "Sign in" call-to-action]*

**Analysis:** The empty basket state demonstrates good error prevention and user guidance:

**Strengths:**
1. **Clear Communication:** The message "Your basket is empty" immediately informs users of the current state (Nielsen's Heuristic #1: Visibility of system status).
2. **Visual Feedback:** The illustration of an empty basket provides visual confirmation of the state.
3. **Actionable Next Steps:** The "Sign in" button offers a clear path forward, with text explaining the benefit ("Sign in to retrieve and shop your saved items").
4. **Consistent Design:** The page maintains the site's visual identity while clearly communicating the empty state.

**Potential Improvements:**
1. **Alternative Actions:** The page could offer additional options such as "Continue shopping" or links to popular categories.
2. **Contextual Help:** For first-time visitors, the page might benefit from explaining how to add items to the basket.

**Recommendation:** Add a "Continue shopping" button or link to help users return to product browsing. Consider showing recently viewed items or popular products as suggestions to re-engage users.

---

## 9. Content Pages and Information Architecture

### 9.1 Ideas & Advice Page

The "Ideas & Advice" section provides educational content and project inspiration.

**Figure 15: Ideas & Advice Page**
*[Screenshot showing: Ideas & Advice landing page with category grid, calculators section, customer projects showcase, and content team information]*

**Analysis:** This page demonstrates B&Q's commitment to supporting customers beyond product sales:

**Strengths:**
1. **Clear Purpose Statement:** The page opens with a clear value proposition: "Create a home to be proud of with our inspirational ideas and practical advice."
2. **Category Organisation:** Content organised into 12 categories matching product categories (Kitchens, Bathroom, Painting & Decorating, etc.)
3. **Practical Tools:** "Calculators" section provides utility tools (paint calculators, paving calculators, etc.)
4. **Social Proof:** "Customer projects" section showcases user-generated content with Instagram integration
5. **Breadcrumb Navigation:** Clear navigation path (Home > Ideas & Advice)

**Content Strategy:**
- The page balances inspiration (customer projects) with practical help (calculators)
- Categories align with product categories, creating natural pathways to products
- Social media integration (#BandQit) encourages user engagement

**Areas for Improvement:**
1. **Content Discoverability:** The page may benefit from featured articles or trending content
2. **Search Functionality:** No visible search within Ideas & Advice content
3. **Content Freshness:** No clear indication of when content was last updated

**Recommendation:** Add a search function specific to Ideas & Advice content. Include "Featured" or "Popular" content sections. Add publication dates to articles. Consider adding tags or topics for better content discovery.

### 9.2 Services Page

The Services page presents B&Q's additional service offerings beyond product sales.

**Figure 16: Services Page**
*[Screenshot showing: Services landing page with service categories, descriptions, and links to detailed service pages]*

**Analysis:** The Services page communicates B&Q's value-added offerings:

**Strengths:**
1. **Service Categories:** Services are clearly categorised (Installation, Finance, Delivery, etc.)
2. **Clear Descriptions:** Each service includes a brief description of what it offers
3. **Visual Hierarchy:** Services are presented in a grid layout that's easy to scan
4. **Breadcrumb Navigation:** Consistent navigation structure

**Service Offerings Observed:**
- Installation services
- Finance options
- Delivery services
- Click + Collect
- Paint mixing
- Kitchen planning
- And more

**Potential Improvements:**
1. **Service Discovery:** Users may not immediately understand all available services
2. **Pricing Information:** Limited pricing information visible on landing page
3. **Service Comparison:** No easy way to compare different service options

**Recommendation:** Add a "Popular Services" or "Most Used Services" section. Include pricing ranges or "From £X" indicators where appropriate. Consider adding service comparison tools or decision guides.

### 9.3 Customer Support Page

The Customer Support page provides comprehensive help and support information.

**Figure 17: Customer Support Page**
*[Screenshot showing: Customer Support page with sidebar navigation, FAQ sections, contact information, and support topic cards]*

**Analysis:** The Customer Support page demonstrates comprehensive help architecture:

**Strengths:**
1. **Organised Navigation:** Left sidebar provides clear navigation to support topics:
   - Customer support
   - Home delivery
   - Free Click + Collect
   - Policies
   - Aftersales

2. **Quick Access Cards:** Grid of support topics provides quick access to common questions:
   - Verified sellers
   - Home delivery
   - Returns & refunds
   - Click + Collect

3. **Contact Information:** Clear link to "How to contact us" page
4. **Policy Transparency:** Comprehensive policy links (Terms & Conditions, Privacy Policy, Cookies Policy, etc.)
5. **Aftersales Support:** Dedicated section for product-specific aftersales support

**Information Architecture:**
- The page follows a logical hierarchy
- Support topics are grouped by user need
- Policies are clearly separated from operational support

**Areas for Improvement:**
1. **Search Functionality:** No visible search within support content
2. **FAQ Prominence:** Frequently asked questions may not be immediately visible
3. **Contact Methods:** May benefit from displaying contact methods directly on the page

**Recommendation:** Add a search function for support content. Make FAQs more prominent. Display contact methods (phone, email, chat) directly on the page. Consider adding a "Most Popular Questions" section.

### 9.4 Login and Authentication

The login page provides access to user accounts and personalised features.

**Figure 19: Login Page**
*[Screenshot showing: Sign in page with email and password fields, "Reset my password" link, and "Register" option]*

**Analysis:** The login page demonstrates several usability considerations:

**Strengths:**
1. **Clear Purpose:** "Sign in" heading immediately communicates the page's function
2. **Simple Form:** Minimal form fields reduce cognitive load
3. **Helpful Placeholders:** Email field includes example format ("E.g. username@domain.com")
4. **Password Visibility Toggle:** "Show" button allows users to verify password entry
5. **Recovery Options:** "Reset my password" link provides account recovery path
6. **Registration Link:** Clear path for new users ("Don't have an account? Register")
7. **Contact Information:** Phone number visible in header ("Want to talk about your order? 0333 014 3357")

**Form Design:**
- Required fields are clearly marked
- Form validation likely present (though not tested)
- Clean, uncluttered design focuses attention on the form

**Potential Improvements:**
1. **Social Login:** No visible social media login options (Google, Facebook, etc.)
2. **Remember Me:** No "Remember me" checkbox visible
3. **Error Messages:** Error handling not tested but should provide clear, actionable feedback
4. **Security Indicators:** No visible security indicators (SSL, two-factor authentication options)

**Recommendation:** Consider adding social login options for faster authentication. Include "Remember me" functionality. Ensure error messages are clear and helpful. Display security indicators to build trust.

### 9.5 Promotional Landing Pages

Promotional pages like the Black Friday page showcase special offers and deals.

**Figure 20: Promotional Landing Page**
*[Screenshot showing: Black Friday deals page with product categories, featured deals, filtering options, and promotional messaging]*

**Analysis:** Promotional landing pages serve both marketing and navigation functions:

**Strengths:**
1. **Clear Promotional Messaging:** "Black Friday deals 2025" immediately communicates the page purpose
2. **Category Organisation:** Deals organised by product category
3. **Breadcrumb Navigation:** Maintains navigation context
4. **Filtering Options:** Users can filter deals by category, price, etc.
5. **Visual Hierarchy:** Promotional content is visually distinct

**Promotional Strategy:**
- Time-sensitive messaging creates urgency
- Multiple product categories ensure broad appeal
- Featured deals highlight key promotions

**Potential Issues:**
1. **Content Overload:** Multiple deals and categories may overwhelm users
2. **Temporal Relevance:** Heavy promotion of time-limited sales may frustrate users after sale ends
3. **Navigation Balance:** Promotional content may obscure core navigation

**Recommendation:** Implement clear expiration dates for promotional content. Provide easy navigation back to regular site structure. Consider implementing a "View all deals" option with better filtering. Ensure promotional pages don't completely replace core navigation.

---

## 10. Accessibility and Technical Considerations

### 10.1 ARIA Implementation

The website demonstrates good use of ARIA (Accessible Rich Internet Applications) attributes, as evidenced by proper roles and labels in the HTML structure.

**Analysis:** The search combobox uses appropriate ARIA attributes (combobox, expanded, listbox, options), and screen reader announcements are provided (e.g., "12 search suggestions available"). This supports users with assistive technologies and aligns with WCAG 2.1 Level AA guidelines.

### 10.2 Responsive Design Considerations

While this evaluation focuses on desktop viewing, the website structure suggests responsive design considerations are in place.

**Recommendation:** Conduct separate mobile usability testing to evaluate touch target sizes, navigation patterns, and content prioritisation on smaller screens.

### 10.3 Breadcrumb Navigation

Throughout the site, breadcrumb navigation is consistently implemented on category and product pages.

**Analysis:** Breadcrumb navigation supports several usability principles:

1. **User Orientation (Nielsen's Heuristic #8):** Breadcrumbs help users understand their location within the site hierarchy
2. **Navigation Efficiency:** Users can quickly navigate to parent categories without using browser back button
3. **Consistency:** Breadcrumbs appear in the same location across pages, following "Consistency and standards" heuristic

**Implementation Quality:**
- Breadcrumbs are clearly visible and clickable
- Format: Home > Category > Subcategory > Product
- Visual separators (>) clearly indicate hierarchy

**Recommendation:** Ensure breadcrumbs are always visible and don't require scrolling. Consider adding current page indicator (non-clickable) to show final position in hierarchy.

### 10.4 Form Design and Input Validation

Forms appear throughout the site (search, login, postcode entry, etc.).

**Analysis:** Form design follows several best practices:

**Strengths:**
1. **Clear Labels:** Form fields have descriptive labels
2. **Required Field Indication:** Required fields are marked
3. **Placeholder Text:** Helpful examples provided (e.g., email format)
4. **Input Types:** Appropriate input types used (email, password, etc.)

**Areas Requiring Testing:**
- Real-time validation feedback
- Error message clarity and placement
- Success confirmation messages
- Accessibility of form controls

**Recommendation:** Ensure all forms provide immediate, clear validation feedback. Error messages should be specific and actionable. Success messages should confirm user actions. Verify keyboard navigation works for all form elements.

---

## 11. Task-Based Evaluation: Finding a Product Under £20

To structure the evaluation, a specific user task was defined: "Searching for a product under £20."

### 11.1 Task Flow Analysis

**Step 1: Search Initiation**
- User types "paint" in the search bar
- Autocomplete provides relevant suggestions
- User can select a suggestion or proceed with full search

**Step 2: Results and Filtering**
- Search results page would display paint products
- User would need to apply price filters to find products under £20
- Product cards would show prices, allowing quick scanning

**Analysis:** The search functionality supports this task well through autocomplete and clear product pricing. However, the ability to filter by price directly from the search results was not observable from the homepage.

**Recommendation:** Ensure price filters are prominently available on search results pages, and consider adding a "Under £20" quick filter option for common price ranges.

---

## 12. Additional Usability Observations

### 11.1 Information Architecture and Content Organisation

The B&Q website demonstrates a complex information architecture designed to support multiple user goals:

**Category Organisation:**
- The menu structure reveals a hierarchical organisation that aligns with product types (e.g., "Painting & Decorating", "Building & Hardware")
- This organisation supports users who know what they're looking for but may challenge users with less specific needs

**Content Prioritisation:**
- Promotional content (Black Friday) dominates the homepage, potentially obscuring core navigation
- Value propositions are placed prominently but may compete with primary calls-to-action

**Analysis:** The information architecture follows Lynch & Horton's principle of organising content by user tasks and information needs (Lynch & Horton, 2009). However, the heavy emphasis on promotional content may violate the "Aesthetic and minimalist design" heuristic by creating visual clutter.

**Recommendation:** Implement a more balanced content hierarchy that prioritises core navigation while maintaining promotional visibility. Consider A/B testing different layouts to determine optimal content prioritisation.

### 11.2 Error Prevention and Recovery

Throughout the evaluation, several error prevention mechanisms were observed:

1. **Search Autocomplete:** Prevents spelling errors and guides users to valid search terms
2. **Form Validation:** Input fields include placeholders and likely validation (though not fully tested)
3. **Clear Navigation:** Consistent navigation reduces the likelihood of users becoming lost

**Areas for Improvement:**
- No observed 404 error pages or "page not found" handling
- Limited observed feedback for invalid inputs (e.g., invalid postcodes in store finder)
- No observed confirmation dialogs for critical actions (e.g., removing items from basket)

**Recommendation:** Implement comprehensive error handling with clear, actionable error messages. Provide helpful suggestions when users encounter errors (e.g., "Did you mean...?" for search queries).

### 11.3 Consistency and Standards

The website demonstrates strong consistency in several areas:

**Visual Consistency:**
- Consistent use of orange (#FF6900) as the primary brand colour
- Uniform product card design across listings
- Consistent navigation placement and styling

**Interaction Consistency:**
- Standardised button styles and hover states
- Consistent modal/dialog patterns
- Uniform form input styling

**Analysis:** Consistency supports Nielsen's Heuristic #4: "Consistency and standards" by reducing cognitive load and helping users build accurate mental models of the interface.

**Minor Inconsistencies Observed:**
- Some product titles are truncated while others are not
- Badge designs vary (e.g., "Black Friday Event" vs. "Offer" vs. "Prices nailed")
- Navigation menu structure differs from footer organisation

**Recommendation:** Conduct a comprehensive design audit to identify and standardise all interface elements. Create a design system document to ensure future consistency.

---

## 13. Conclusions

The B&Q website demonstrates a generally well-designed interface that follows many established usability principles. Key strengths include:

1. **Strong Navigation Structure:** Clear primary navigation with consistent placement and labelling
2. **Effective Search Functionality:** Autocomplete with relevant suggestions supports user discovery
3. **Comprehensive Information Architecture:** Well-organised footer and category structure
4. **Accessibility Considerations:** Skip links, ARIA attributes, and keyboard navigation support
5. **Trust Signals:** Clear communication of delivery options, returns policy, and value propositions

However, several areas require improvement:

1. **Content Hierarchy:** Promotional content may overwhelm core navigation and product discovery
2. **Information Density:** Multiple carousels and promotional sections may create cognitive overload
3. **Discoverability:** Some features (like cookie preferences) may be less discoverable in footer placement
4. **Visual Consistency:** Product title truncation and badge design could be standardised

---

## 14. Recommendations

### Priority 1 (High Impact)

1. **Balance Promotional and Functional Content:** Reduce visual weight of promotional banners or make them dismissible to improve focus on core navigation.

2. **Improve Postcode Entry UX:** Replace button with actual input field or clarify interaction model to match user expectations.

3. **Enhance Search Results Filtering:** Ensure price filters are prominent and easily accessible on search results pages.

### Priority 2 (Medium Impact)

4. **Optimise Product Card Display:** Fix product title truncation and standardise badge design for better visual hierarchy.

5. **Improve Category Discoverability:** Add visual indicators for carousel navigation and provide "View all" alternatives.

6. **Enhance Footer Usability:** Add external link indicators and consider accordion layout for mobile devices.

### Priority 3 (Enhancement)

7. **Cookie Consent Management:** Add prominent cookie banner on first visit in addition to footer link.

8. **Keyboard Navigation:** Add visual indicators for keyboard-focused navigation states.

9. **Mobile-Specific Testing:** Conduct comprehensive mobile usability evaluation with separate recommendations.

---

## References

Lynch, P. J., & Horton, S. (2009). *Web Style Guide: Basic Design Principles for Creating Web Sites* (3rd ed.). Yale University Press.

Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/

Nielsen, J., & Tahir, M. (2001). *Homepage Usability: 50 Websites Deconstructed*. New Riders Publishing.

U.S. Department of Health and Human Services. (2006). *Research-Based Web Design & Usability Guidelines*. U.S. Government Printing Office.

World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. https://www.w3.org/TR/WCAG21/

---

**Word Count:** Approximately 5,800 words (excluding references and figure captions)

**Total Figures:** 20 screenshots documenting comprehensive aspects of the website's design and functionality, including:
- Homepage elements (navigation, search, value propositions, product cards, footer)
- Navigation structures (menu, breadcrumbs)
- Search and filtering (autocomplete, results pages, category pages)
- Product pages (detail pages, specifications)
- Functional pages (basket, store finder, login)
- Content pages (Ideas & Advice, Services, Customer Support)
- Promotional pages (Black Friday landing page)

**Note:** Screenshots should be inserted at the indicated locations in the final document. Each screenshot should be clearly labelled and referenced in the text.

