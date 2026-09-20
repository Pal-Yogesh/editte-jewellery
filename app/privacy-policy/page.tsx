import Link from "next/link";
import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — editte",
  description: "Privacy Policy for the editte marketplace.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <ZaraNavbar actions={<NavbarActions />} />
      <div className="min-h-screen bg-salt">
        {/* Title banner */}
        <div className=" text-cacao pt-28 pb-12 px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl">Privacy Policy</h1>
        </div>

        <main className="max-w-3xl mx-auto px-6 py-14">
          <div className="prose-editte">
          <p className="lead">
            Editte Exports (&ldquo;Editte&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our website <strong>shopeditte.com</strong> (the &ldquo;Site&rdquo;).
          </p>

          <h2>1. Who We Are</h2>
          <p>1.1. Editte is a curated multi-designer marketplace for jewellery and accessories, operated by Editte Exports, a company registered in India in Coimbatore, Tamil Nadu.</p>
          <p>1.2. Under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;), Editte Exports is the Data Fiduciary responsible for your personal data.</p>
          <p>1.3. For any privacy-related concerns or to exercise your rights, you can contact us at <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a>.</p>

          <h2>2. Scope of This Policy</h2>
          <p>2.1. This policy applies to all visitors, registered customers, and vendor partners of the Site.</p>
          <p>2.2. As we manage the entire customer experience, we act as the primary controller of your data. Our vendors and service providers act as Data Processors, who process your data only on our instructions and for specific purposes, such as order fulfilment.</p>

          <h2>3. The Data We Collect</h2>
          <p><strong>3.1. Data You Provide Directly:</strong></p>
          <ul>
            <li><strong>Identity and Contact Data:</strong> Name, email address, phone number, delivery and billing addresses.</li>
            <li><strong>Account Data:</strong> Login credentials, saved preferences, and wishlists.</li>
            <li><strong>Order Data:</strong> Details of items purchased, order history, and communications with our support team.</li>
            <li><strong>User Content:</strong> Reviews, messages, or support requests you submit.</li>
          </ul>
          <p><strong>3.2. Data We Collect Automatically:</strong></p>
          <ul>
            <li><strong>Device and Usage Data:</strong> IP address, browser type, operating system, pages viewed, referring links, and other analytics data collected via cookies and similar technologies.</li>
          </ul>
          <p><strong>3.3. Data We Receive from Third Parties:</strong></p>
          <ul>
            <li><strong>Payment Data:</strong> Confirmation of payment and fraud signals from our payment gateway partners. We do not receive or store your full card details.</li>
            <li><strong>Delivery Data:</strong> Updates on delivery status from our courier partners.</li>
          </ul>
          <p>3.4. We do not knowingly collect personal data from individuals under the age of 18.</p>
          <p>3.5. <strong>AI Feature Data:</strong> If you use our AI-powered virtual try-on or image-generation feature, we may process the photograph or image you submit to generate the requested visualisation and to provide, secure, maintain, and improve the AI Feature.</p>

          <h2>4. Why We Use Your Data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul>
            <li>To process and deliver your orders</li>
            <li>To manage your account and provide customer support</li>
            <li>To communicate with you about your orders and our services</li>
            <li>To improve our Site and services through analytics</li>
            <li>To prevent fraud and maintain security</li>
            <li>To comply with legal obligations</li>
            <li>To send you marketing communications where you have consented</li>
          </ul>
          <p>You can withdraw your consent for marketing at any time by using the &ldquo;unsubscribe&rdquo; link in our emails or by contacting us.</p>

          <h2>5. How We Share Your Data</h2>
          <p>We share your data only when necessary to operate our marketplace. We do not sell your personal data.</p>
          <p>5.1. <strong>With Vendor Partners:</strong> We share limited information (your name, delivery address, and order contents) with the relevant Vendor solely for them to pack and ship your order on our behalf.</p>
          <p>5.2. <strong>With Service Providers:</strong> We engage third-party service providers for functions like payment processing, logistics, IT hosting, analytics, and marketing communications.</p>
          <p>5.3. <strong>With Professional Advisers and Authorities:</strong> We may share your data where required by law, a court order, or to protect our legal rights.</p>
          <p>5.4. <strong>In Business Transfers:</strong> If Editte undergoes a merger, acquisition, or sale of assets, your data may be transferred to the successor entity.</p>

          <h2>6. Where Your Data Is Stored</h2>
          <p>6.1. Your personal data is primarily stored and processed on secure servers located within India.</p>
          <p>6.2. We do not currently transfer your personal data outside of India. Should this change, we will update this policy and ensure compliance with the DPDP Act.</p>

          <h2>7. How Long We Keep Your Data</h2>
          <p>7.1. We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, and to comply with our legal obligations.</p>
          <p>7.2. <strong>Account and Order Data:</strong> Retained for the life of your account and for a period thereafter to comply with tax and commercial laws.</p>
          <p>7.3. <strong>Marketing Data:</strong> Retained until you unsubscribe or withdraw your consent.</p>

          <h2>8. Your Rights Under the DPDP Act</h2>
          <ul>
            <li><strong>Right to Access:</strong> To obtain a summary of your personal data that we process.</li>
            <li><strong>Right to Correction &amp; Erasure:</strong> To correct inaccurate data or have your data erased where it is no longer necessary.</li>
            <li><strong>Right to Withdraw Consent:</strong> To withdraw your consent for processing that is based on consent.</li>
            <li><strong>Right of Grievance Redressal:</strong> To raise a complaint with our Grievance Officer.</li>
            <li><strong>Right to Nominate:</strong> To nominate another person to exercise your rights in the event of your death or incapacity.</li>
          </ul>
          <p>To exercise any of these rights, please contact us at <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a>.</p>

          <h2>9. Cookies</h2>
          <p>9.1. We use cookies and similar technologies to keep you signed in, remember your preferences, analyse traffic, and improve the Site&rsquo;s functionality.</p>
          <p>9.2. You can control the use of cookies through your browser settings. For more details, please refer to our <Link href="/cookie-policy" className="text-cacao underline hover:text-sage">Cookie Policy</Link>.</p>

          <h2>10. How We Protect Your Data</h2>
          <p>10.1. We implement reasonable technical and organisational security measures to protect your data from unauthorised access, loss, or misuse. These include encryption in transit (SSL), access controls, and secure payment processing.</p>
          <p>10.2. While we strive to protect your data, no system is completely secure. In the event of a reportable data breach, we will notify you and the relevant authorities as required by law.</p>

          <h2>11. Third-Party Links</h2>
          <p>11.1. The Site may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.</p>

          <h2>12. Changes to This Policy</h2>
          <p>12.1. We may update this Privacy Policy from time to time. The &ldquo;Last Updated&rdquo; date at the top indicates the latest version.</p>

          <h2>13. Contact Us</h2>
          <p>For any questions regarding this Privacy Policy, please contact us at:</p>
          <p><strong>Email:</strong> <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a></p>
          <p><strong>Entity Name:</strong> Editte Exports</p>
          <p><strong>Registered Address:</strong> Saibaba Colony, Coimbatore, Tamil Nadu, 641011</p>
        </div>
      </main>
      </div>
      <Footer />
    </>
  );
}
