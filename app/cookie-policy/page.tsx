import Link from "next/link";
import SiteNavbar from "@/components/SiteNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cookie Policy — editte",
  description: "Cookie Policy for the editte marketplace.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen bg-salt">
        <div className=" text-cacao pt-28 pb-12 px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl">Cookie Policy</h1>
        </div>

        <main className="max-w-3xl mx-auto px-6 py-6">
          <div className="prose-editte">
          <h2>1. About This Cookie Policy</h2>
          <p>1.1. This Cookie Policy explains how Editte uses cookies, pixels, tags, local storage and similar technologies (collectively, &ldquo;Cookies&rdquo;) on <strong>shopeditte.com</strong> (the &ldquo;Site&rdquo;).</p>
          <p>1.2. This Cookie Policy should be read together with Editte&rsquo;s <Link href="/privacy-policy" className="text-cacao underline hover:text-sage">Privacy Policy</Link> and <Link href="/term-condition" className="text-cacao underline hover:text-sage">Terms and Conditions</Link>.</p>

          <h2>2. What Are Cookies?</h2>
          <p>2.1. Cookies are small text files or similar identifiers placed on your device when you visit a website. They help the Site recognise your device, remember preferences, maintain sessions, provide security, and understand how the Site is used.</p>

          <h2>3. Types of Cookies We Use</h2>
          <p><strong>3.1. Strictly Necessary Cookies:</strong> These are required for the basic operation, security and functionality of the Site, including login, shopping cart, checkout, fraud prevention and session management.</p>
          <p><strong>3.2. Functional Cookies:</strong> These remember choices and preferences such as language, region, saved settings and other features that improve your experience.</p>
          <p><strong>3.3. Analytics/Performance Cookies:</strong> These help us understand how visitors use the Site, measure performance, identify errors and improve our services and user experience.</p>
          <p><strong>3.4. Marketing/Advertising Cookies:</strong> Where used and where required by applicable law, these may help us measure campaigns, personalise communications and show more relevant offers or advertisements.</p>
          <p><strong>3.5. Third-Party Cookies:</strong> Payment providers, analytics providers, logistics partners, security providers and other service providers may place or access Cookies where necessary to provide their services to Editte.</p>

          <h2>4. Cookie Consent</h2>
          <p>4.1. When you first visit the Site, Editte may display a Cookie Consent Banner requesting your consent for non-essential Cookies.</p>
          <p>4.2. The Cookie Pop-up may provide the following options: &ldquo;Accept All&rdquo;, &ldquo;Reject Non-Essential&rdquo; and &ldquo;Manage Preferences&rdquo;. Strictly necessary Cookies may remain active because they are required for the Site to function.</p>
          <p>4.3. Your Cookie preferences may be stored so that Editte can remember your choice. You may withdraw or modify your consent at any time through the &ldquo;Cookie Settings&rdquo; link made available on the Site.</p>
          <p>4.4. Refusing or disabling certain Cookies may affect the availability or functionality of some features of the Site.</p>

          <h2>5. Purposes for Which Cookies Are Used</h2>
          <p>5.1. We may use Cookies to keep you signed in, remember your shopping cart, process orders, maintain security, prevent fraud, remember preferences, analyse traffic, monitor performance, improve product curation and user experience, and, where permitted, support marketing activities.</p>

          <h2>6. Your Choices</h2>
          <p>6.1. You can manage Cookies through the Cookie Settings available on the Site and through your browser settings.</p>
          <p>6.2. Browser-level controls may allow you to delete existing Cookies or block future Cookies. However, blocking necessary Cookies may prevent certain Site functions from operating correctly.</p>

          <h2>7. Changes to This Cookie Policy</h2>
          <p>7.1. Editte may update this Cookie Policy from time to time to reflect changes in technology, law, business practices or the Cookies used on the Site. The &ldquo;Last Updated&rdquo; date will indicate the latest version.</p>

          <h2>8. Contact</h2>
          <p>8.1. For questions regarding this Cookie Policy or your Cookie preferences, contact us at <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a>.</p>
        </div>
      </main>
      </div>
      <Footer />
    </>
  );
}
