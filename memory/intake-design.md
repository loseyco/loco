# Intake Form Design: Motorsports & Automotive Restoration

Based on research into high-conversion patterns and the 'gold-standard' aesthetics of Singer, AMS, and Hennessey, this intake form is designed to capture high-intent leads while maintaining a premium, high-velocity brand feel.

---

## 1. Aesthetic Tokens ('The Look')

To convey speed, precision, and performance, the UI should use the following design system:

| Token | Specification | Rationale |
| :--- | :--- | :--- |
| **Background** | `#0A0A0A` (Deep Onyx) | High-contrast, premium, dark-mode default. |
| **Primary Accent** | `#FF1E1E` (Pit Lane Red) | Urgency, passion, and performance. |
| **Secondary Accent** | `#00D1FF` (Nitrous Blue) | Technical, cooling, modern precision. |
| **Typography (H)** | *Saira Stencil* (Bold/Italic/Caps) | Aggressive, industrial, "race-spec" feel. |
| **Typography (B)** | *Roboto Mono* | Technical, data-driven, engineering aesthetic. |
| **Button Style** | Angled edges, Carbon Fiber hover | Parallelogram shapes evoke forward motion. |
| **Progress Bar** | Tachometer/Redline UI | Gamifies the experience; feels like "revving up" to finish. |

---

## 2. Multi-Step Layout & Logic ('The Flow')

The form follows a 4-step "Velocity Path" to minimize friction and maximize data quality.

### Step 1: The Machine (Vehicle Identity)
*Goal: Quick wins. User identifies their vehicle immediately.*
- **Fields:**
    - **Year / Make / Model:** Cascading dropdowns with high-performance presets (e.g., Porsche 911, Nissan GT-R).
    - **VIN (Optional):** Input field with "Lookup Performance Specs" helper text to add value.
    - **Current Condition:** Interactive slider (1-5) from "Barn Find" to "Showroom Ready."
- **Logic:** Autocomplete model names to save keystrokes.

### Step 2: The Vision (Project Goals)
*Goal: Segment leads into Restoration vs. Performance.*
- **Primary Selector:** Large, high-impact toggle buttons:
    - **[ RESTORATION ]** (Period correct, Concours, Preservation)
    - **[ PERFORMANCE ]** (Restomod, Track Prep, High-Output)
- **Dynamic Fieldsets:**
    - *If Restoration:* Checkboxes for Paint/Body, Interior, Period Engine, Suspension.
    - *If Performance:* Checkboxes for Turbo/Supercharger, Aero, Racing Suspension, ECU Tuning.
- **The "Hook" Question:** "What is your primary goal? (e.g., Beat my lap time, Win at Pebble Beach, Daily-driver perfection)."

### Step 3: The Fuel (Budget & Timeline)
*Goal: Qualify the lead based on investment level.*
- **Investment Tiers (Radio Cards):**
    - **Enthusiast (<$25k):** Maintenance and light upgrades.
    - **Evolution ($25k - $75k):** Significant performance or cosmetic overhaul.
    - **Signature ($75k - $150k):** Comprehensive ground-up build.
    - **Ultimate ($150k+):** No-compromise, bespoke engineering (Singer-style).
- **Timeline Selector:** [ ASAP | 3-6 Months | 6-12 Months | Planning Phase ].

### Step 4: The Driver (Lead Info)
*Goal: Final capture with trust-building elements.*
- **Fields:** Full Name, Email, Phone, Zip Code.
- **Trust Badge:** "Confidentiality Guaranteed. We respect the machine and the owner."
- **Submit Button:** **[ INITIATE BUILD ]** with a haptic/visual 'start button' animation.

---

## 3. High-Conversion Patterns

1. **Micro-Animations:** As the user moves between steps, a car icon (or wireframe) "drives" across the progress line.
2. **Value-Added Inputs:** When a user enters their Model (e.g., "911 964"), show a small tooltip: *"We specialize in 964 air-cooled restorations."*
3. **Ghosting Text:** Use technical terminology in placeholders (e.g., *"Enter Chassis Number"* instead of just *"VIN"*).
4. **Hennessey-Style Stats:** On the final step, show a summary: *"Targeting: 800hp Restoration"* to reinforce their vision before they hit submit.

---

## 4. Integration with Inspiration
- **Singer-Style:** Lead with the "Philosophy First" intro page—no fields, just a beautiful image and a "Begin Your Journey" button.
- **AMS-Style:** Use high-res technical icons for Step 2 checkboxes (e.g., a stylized turbocharger icon).
- **F1-Style:** The Progress Bar should look like an F1 steering wheel display or a race track map.
