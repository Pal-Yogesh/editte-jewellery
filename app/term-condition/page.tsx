import Link from "next/link";
import SiteNavbar from "@/components/SiteNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions — editte",
  description: "Terms and Conditions for using the editte marketplace.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen bg-salt">
        {/* Title banner */}
        <div className=" text-cacao pt-28 pb-12 px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl">Terms & Conditions</h1>
        </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="prose-editte">
          <p className="lead">
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the website{" "}
            <strong>shopeditte.com</strong> (the &ldquo;Site&rdquo;) and the services offered thereon. The Site is owned and operated by{" "}
            <strong>Editte Exports</strong>, a company incorporated under the laws of India, having its registered office in Coimbatore, Tamil Nadu (&ldquo;Editte&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
          <p>
            By accessing the Site, creating an account, or placing an order, you signify your unconditional agreement to be bound by these Terms. Please read them carefully.
          </p>

          {/* Section 1 */}
          <h2>1. About These Terms</h2>
          <p>1.1. This document constitutes a legally binding agreement between you, the user of the Site (&ldquo;you&rdquo;, &ldquo;your&rdquo;, &ldquo;customer&rdquo;).</p>
          <p>1.2. Your use of the Site and any services provided are conditional upon your acceptance of and compliance with these Terms and our <Link href="/privacy-policy" className="text-cacao underline hover:text-sage">Privacy Policy</Link>. If you do not agree to these Terms, you must not use the Site.</p>

          {/* Section 2 */}
          <h2>2. What Editte Is</h2>
          <p>2.1. Editte is a curated, managed marketplace for fashion jewellery and accessories. We showcase collections from various independent designers, boutiques, and brands (&ldquo;Vendors&rdquo;).</p>
          <p>2.2. We manage the entire customer experience. This includes, but is not limited to, curating and approving all product listings, ensuring the accuracy of information, processing all orders and payments, arranging the customer-facing aspects of fulfilment, managing all returns and exchanges, and providing all customer support.</p>
          <p>2.3. When you place an order on the Site, you are entering into a contract of sale directly with Editte and Editte is the seller of record for all transactions. You do not have a direct contractual relationship with the individual Vendors for the purpose of the sale, payment, or returns.</p>

          {/* Section 3 */}
          <h2>3. Eligibility and Your Account</h2>
          <p>3.1. To place an order on the Site, you must be at least 18 years of age and capable of entering into a legally binding contract.</p>
          <p>3.2. You are responsible for providing and maintaining accurate, current, and complete information in your account profile.</p>
          <p>3.3. You are solely responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.</p>
          <p>3.4. We reserve the right to suspend or terminate your account at our sole discretion if you breach these Terms, or if we believe your actions may cause legal liability for you, our users, or us.</p>

          {/* Section 4 */}
          <h2>4. Products, Curation and Pricing</h2>
          <p>4.1. All products listed on the Site are curated, approved, and listed by Editte. We work closely with our Vendors to ensure the accuracy of product descriptions, specifications, and images.</p>
          <p>4.2. Despite our best efforts, colours, finishes, and textures of products may vary slightly from the images shown on your screen due to differences in display settings and the handmade nature of many items. Such variations shall not be considered defects.</p>
          <p>4.3. All prices are displayed in Indian Rupees and are inclusive of applicable taxes, which will be indicated at checkout. Delivery charges are additional unless specified otherwise.</p>
          <p>4.4. We and our Vendors strive for accuracy in pricing. However, in the event of an obvious and inadvertent pricing error, we reserve the right to cancel the order. In such cases, any amount paid by you will be refunded in full.</p>
          <p>4.5. Editte reserves the right to change prices, withdraw any products from the Site, or update product listings at any time without prior notice.</p>
          <p>4.6. <strong>Authenticity and Curation:</strong> Editte undertakes a rigorous curation process to partner with reputable Vendors and to ensure the authenticity and quality of the products offered. We rely on the representations and warranties provided by our Vendors regarding the origin, materials, and craftsmanship of their products. While we take all reasonable steps to verify this information, the ultimate responsibility for the product&rsquo;s authenticity and compliance with its description lies with the Vendor under their agreement with us. Your primary recourse for any issue remains with Editte as the seller of record.</p>

          {/* Section 5 */}
          <h2>5. Orders</h2>
          <p>5.1. Placing an item in your cart does not reserve it. An order is placed when you complete the checkout process. Your order constitutes a formal offer to Editte to purchase the selected product(s).</p>
          <p>5.2. A binding contract is formed only when we send you an order confirmation email.</p>
          <p>5.3. We reserve the right to decline or cancel an order for any reason, including but not limited to: the item being out of stock, failure of payment authorisation, or the identification of a pricing or product description error.</p>
          <p>5.4. If we cancel your order after payment has been processed, the full amount paid will be refunded to your original mode of payment.</p>
          <p>5.5. All decisions regarding order acceptance, decline, or cancellation are made solely by Editte. Our Vendors do not have the authority to accept or cancel customer orders.</p>

          {/* Section 6 */}
          <h2>6. Payment</h2>
          <p>6.1. All payments are to be made via the Site at the time of checkout. We use a secure third-party payment gateway to process all transactions.</p>
          <p>6.2. Editte does not collect or store your full credit/debit card details or other sensitive financial information. This information is securely transmitted directly to our payment gateway provider.</p>
          <p>6.3. By placing an order, you confirm that the payment details provided are valid and correct and that you are the authorised user of the payment instrument.</p>
          <p>6.4. All payments are received by Editte. We then settle the Vendor&rsquo;s share after deducting our commission and other applicable charges, as per our separate agreement with the Vendor.</p>

          {/* Section 7 */}
          <h2>7. Shipping and Delivery</h2>
          <p>7.1. Orders are packed and dispatched directly by the respective Vendors on behalf of Editte, using packaging and guidelines provided by us.</p>
          <p>7.2. Any delivery timelines provided on the Site are estimates only and are not guaranteed. Delays may occur due to factors beyond our reasonable control.</p>
          <p>7.3. Editte shall not be liable for any delay in delivery caused by courier partners, weather conditions, customs clearance, governmental actions, or other force majeure events.</p>
          <p>7.4. The risk of loss or damage to the goods passes to you upon delivery of the product to the address specified in your order.</p>

          {/* Section 8 */}
          <h2>8. Returns, Exchanges and Cancellations</h2>
          <p>8.1. <strong>We do not accept returns or exchanges for change of mind. All sales are final.</strong></p>
          <p>8.2. Returns or replacements will only be accepted if the item delivered is faulty, defective, or damaged in transit.</p>
          <p>8.3. You must report any such issue to us at <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a> within 3 (three) days of the delivery date, providing your order details and supporting evidence.</p>
          <p>8.4. <strong>Mandatory Unboxing Proof:</strong> To process any claim for a damaged or missing product, you must provide clear and continuous photographic and video evidence of the parcel being opened. The unboxing video must be unedited and show the outer packaging, shipping label, and the product, clearly demonstrating the damage or discrepancy from the moment the outer seal is broken. Claims submitted without this mandatory unboxing proof may be rejected at our sole discretion.</p>
          <p>8.5. All return claims are handled end-to-end by Editte. You are not required to contact the Vendor directly. We will assess your claim and, if it is deemed valid, arrange for a replacement or refund as per our Returns Policy.</p>
          <p>8.6. For a valid claim, any refund will be processed within a reasonable timeframe after the claim is approved by us.</p>
          <p>8.7. The cost of reverse shipping for a faulty product shall be borne by the Vendor. The cost for a product damaged in transit shall be claimed from the shipping agent. In either case of a valid claim, the reverse shipping cost will not be passed on to you.</p>
          <p>8.8. Certain items, such as earrings (for hygiene reasons) or customised products, are non-returnable. Such items will be clearly marked as non-returnable on the product page.</p>
          <p>8.9. Once an order is confirmed, it cannot be cancelled by you, except where Editte cancels the order under the provisions of Section 5.</p>

          {/* Section 9 */}
          <h2>9. Vendor Relationship and Responsibility</h2>
          <p>9.1. Our Vendors are independent suppliers who have agreed to list their products on our marketplace and fulfil orders on our behalf.</p>
          <p>9.2. Your contract of sale is with Editte. We are your single point of contact and are responsible for the order, its accuracy as listed, payment processing, returns, and all customer support.</p>
          <p>9.3. While Vendors are responsible to Editte for the quality, safety, and legality of their products under our vendor agreement, you are not required to deal with or pursue any claims against individual Vendors. All issues must be raised with Editte.</p>
          <p>9.4. <strong>Vendor Responsibility for Defective, Damaged, Missing or Incorrect Items:</strong> The Vendor shall be solely responsible for ensuring that every product dispatched to Editte&rsquo;s customer is complete, correct, properly packed, of merchantable quality, free from manufacturing defects, and in conformity with the product description, specifications, images and other representations approved by Editte.</p>
          <p>9.5. Where an item is found to be defective, damaged prior to handover to the logistics partner, missing from the package, incomplete, incorrect, counterfeit, materially different from the listing, or otherwise not in conformity with the applicable order, and the claim is determined by Editte to be valid, the Vendor shall bear and reimburse Editte for all costs, losses and expenses arising from such issue.</p>
          <p>9.6. In case of a missing item, shortage, wrong item or defective item attributable to the Vendor, Editte may, without prejudice to its other rights and remedies, deduct the corresponding amount and all applicable costs from any amount payable or becoming payable to the Vendor.</p>
          <p>9.7. The Vendor shall not pass on any such cost to the customer. Editte shall remain the customer&rsquo;s single point of contact and may, at its discretion, provide the customer with a refund, replacement, store credit or other appropriate remedy in accordance with the Returns Policy and applicable law.</p>

          {/* Section 10 */}
          <h2>10. Reviews and User Content</h2>
          <p>10.1. You may post reviews, comments, and other content, provided it is honest, lawful, and your own original work.</p>
          <p>10.2. You agree not to post content that is false, defamatory, obscene, offensive, infringing upon any third party&rsquo;s intellectual property rights, or otherwise unlawful.</p>
          <p>10.3. By posting content, you grant Editte a non-exclusive, royalty-free, perpetual, and irrevocable license to use, reproduce, modify, adapt, publish, and display such content to operate and promote the marketplace.</p>
          <p>10.4. We reserve the right, but not the obligation, to moderate, edit, or remove any user content that violates these Terms.</p>

          {/* Section 11 */}
          <h2>11. AI-Powered Virtual Try-On and Image Generation</h2>
          <p>11.1. Editte may provide an AI-powered feature that allows you to upload a photograph or image for the purpose of generating a visual representation of jewellery or accessories on or with that image (the &ldquo;AI Feature&rdquo;).</p>
          <p>11.2. By using the AI Feature, you acknowledge that AI-generated content may be probabilistic and may contain inaccuracies or visual inconsistencies. You agree to independently verify the product information before purchasing.</p>
          <p>11.3. To the maximum extent permitted by applicable law, Editte shall not be responsible for inaccuracies, distortions, artefacts, unintended alterations, or other errors in AI-generated images, nor for any decision made by you solely on the basis of an AI-generated visualisation.</p>
          <p>11.4. You must not upload images containing unlawful, obscene, defamatory, threatening, fraudulent, infringing, or otherwise prohibited content, or use the AI Feature to impersonate, harass, defame, deceive, or violate the rights of another person.</p>
          <p>11.5. AI-generated images are illustrative and for visualisation purposes only. They may not accurately reproduce the actual appearance, size, fit, colour, finish, proportions, placement, gemstones, materials, or other characteristics of the jewellery. The actual product page specifications shall prevail.</p>
          <p>11.6. By uploading an image for use with the AI Feature, you represent and warrant that you have all necessary rights, permissions, licences, and consents to upload, process, modify, and use the image for this purpose.</p>

          {/* Section 12 */}
          <h2>12. Intellectual Property</h2>
          <p>12.1. The Editte name, logo, site design, text, graphics, and other content created by us are the exclusive property of our brand or its licensors and are protected by intellectual property laws. You may not use them without our prior written permission.</p>
          <p>12.2. The brand names, logos, and product images of the Vendors are the property of the respective Vendors.</p>
          <p>12.3. You are prohibited from copying, scraping, reproducing, or distributing any content from the Site for commercial purposes without explicit permission.</p>

          {/* Section 13 */}
          <h2>13. Acceptable Use</h2>
          <p>13.1. You agree not to misuse the Site. Prohibited actions include, but are not limited to: attempting to gain unauthorised access to our systems, disrupting the service, scraping data, uploading malicious code or viruses, or using the Site for any unlawful or fraudulent purpose.</p>

          {/* Section 14 */}
          <h2>14. Electronic Communications</h2>
          <p>14.1. When you use the Site or send emails to us, you are communicating with us electronically. You consent to receive communications from us electronically. You agree that all agreements, notices, disclosures, and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing.</p>

          {/* Section 15 */}
          <h2>15. Limitation of Liability</h2>
          <p>15.1. Nothing in these Terms shall limit or exclude any liability that cannot be excluded by law.</p>
          <p>15.2. To the fullest extent permitted by law, Editte shall not be liable for any indirect, incidental, special, or consequential loss or damages, including but not limited to loss of profits, data, or goodwill.</p>
          <p>15.3. Our total aggregate liability to you for any claim arising out of or in connection with an order shall be limited to the amount paid by you for that specific order.</p>

          {/* Section 16 */}
          <h2>16. Indemnity</h2>
          <p>16.1. You agree to indemnify, defend, and hold harmless Editte, its directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, and expenses arising from or in any way connected with your breach of these Terms or your misuse of the Site.</p>

          {/* Section 17 */}
          <h2>17. Force Majeure</h2>
          <p>17.1. Editte shall not be held liable for any failure or delay in performing its obligations if such failure or delay is due to a Force Majeure Event, including but not limited to acts of God, fire, flood, war, terrorism, governmental actions, lockdowns, epidemics, pandemics, strikes, or failure of public utilities or transport networks.</p>

          {/* Section 18 */}
          <h2>18. Suspension and Termination</h2>
          <p>18.1. We may suspend or withdraw access to the Site or your account temporarily or permanently for any reason, including for maintenance, security, or legal reasons, or if you are in breach of these Terms.</p>

          {/* Section 19 */}
          <h2>19. Grievance Redressal</h2>
          <p>19.1. In compliance with the Consumer Protection (E-Commerce) Rules, 2020, we have a grievance redressal mechanism. Any complaints should be addressed to our Grievance Officer at <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a>.</p>
          <p>19.2. We will acknowledge the receipt of your complaint within 48 hours and will aim to resolve it within the timeframe prescribed by applicable law.</p>

          {/* Section 20 */}
          <h2>20. Governing Law and Dispute Resolution</h2>
          <p>20.1. These Terms and your use of the Site shall be governed by and construed in accordance with the laws of India.</p>
          <p>20.2. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts at New Delhi, India.</p>

          {/* Section 21 */}
          <h2>21. Changes to These Terms</h2>
          <p>21.1. We reserve the right to amend these Terms from time to time. The current version will always be indicated by the &ldquo;Last Updated&rdquo; date at the top.</p>
          <p>21.2. Your continued use of the Site after any changes are posted will be deemed as your acceptance of the revised Terms.</p>

          {/* Section 22 */}
          <h2>22. Contact Information</h2>
          <p>For any general queries, please contact us at: <a href="mailto:hello@shopeditte.com" className="text-cacao underline hover:text-sage">hello@shopeditte.com</a></p>
          <p><strong>Entity Name:</strong> Editte Exports</p>
          <p><strong>Registered Address:</strong> Saibaba Colony, Coimbatore, Tamil Nadu.</p>
        </div>
      </main>
      </div>
      <Footer />
    </>
  );
}
