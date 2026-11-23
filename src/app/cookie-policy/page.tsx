import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie policy for ADALIA OIL AND GAS LTD website: essential cookies, consent management and how we handle your data.",
  keywords: ["ADALIA OIL AND GAS LTD", "cookie policy", "cookies", "privacy"]
};

export default function CookiePolicyPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Cookie Policy</h1>
        <p className="mt-3 text-gold-300">How ADALIA OIL AND GAS LTD uses cookies on this website</p>
      </div>
      <section className="section-padding bg-white">
        <div className="prose prose-slate mx-auto max-w-4xl px-4 md:px-6">
          <p>
            This Cookie Policy explains how ADALIA OIL AND GAS LTD uses cookies and similar technologies on our website (the &quot;Site&quot;). We use cookies to improve how the Site works, to remember preferences, and to make enquiry submission reliable.
          </p>

          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They allow the website to remember your browser session and store preferences. Some cookies are set by us (first-party); others may be set by third parties.
          </p>

          <h2>2. Cookies used on this Site</h2>
          <ul>
            <li><strong>Essential/Strictly necessary cookies:</strong> These are required for the Site to function. They include the administrator session cookie used on the private admin console (HttpOnly, SameSite=Strict) and a cookie remembering your cookie-consent choice. These do not require your prior consent because they are strictly necessary.</li>
            <li><strong>Non-essential cookies:</strong> We do not currently use analytics, advertising or tracking cookies that process personal data for third parties. If we add such technologies in the future, we will implement a consent mechanism and update this policy.</li>
          </ul>

          <h2>3. Managing cookies</h2>
          <p>
            You can manage your cookie preferences with the cookie-consent banner on this Site, or by adjusting your browser settings. Disabling essential cookies may affect the function of the admin console.
          </p>
          <p>
            For instructions on how to manage cookies in your browser: Chrome, Firefox, Safari and Edge each provide settings to view and delete cookies. The way you access this menu differs by browser.
          </p>

          <h2>4. Third-party cookies</h2>
          <p>
            We do not allow third parties to place advertising or tracking cookies through our Site. Where the Site loads external resources (social media links), you may be subject to the privacy practices of those third-party services when you interact with them.
          </p>

          <h2>5. Cookie consent</h2>
          <p>
            Before using any non-essential cookie or tracking technology, we display a consent banner. Accepting records your choice in a cookie; withdrawing consent stops further use of non-essential cookies, though essential functionality continues to work.
          </p>

          <h2>6. Contact</h2>
          <p>
            If you have questions about our cookie use or wish to withdraw consent, contact us through the Contact page of ADALIA OIL AND GAS LTD.
          </p>

          <p className="text-sm text-slate-500 mt-8">This Cookie Policy is reviewed periodically and updated in accordance with applicable laws and regulations.</p>
        </div>
      </section>
    </div>
  );
}
