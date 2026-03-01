import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const TermsOfService = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-10">Last updated: February 27, 2026</p>

            <div className="prose-custom space-y-8">
              <section>
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Yeszz ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms are governed by Indian law.</p>
              </section>

              <section>
                <h2>2. User Accounts</h2>
                <ul>
                  <li>You must provide accurate and complete information when creating an account.</li>
                  <li>You are responsible for maintaining the security of your account credentials.</li>
                  <li>You must be at least 13 years old to use the Platform.</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                </ul>
              </section>

              <section>
                <h2>3. Content Guidelines</h2>
                <p>All content published on Yeszz must be:</p>
                <ul>
                  <li>Original or properly attributed</li>
                  <li>Technology-related and relevant to our categories</li>
                  <li>Free from hate speech, harassment, or illegal content</li>
                  <li>Compliant with India's IT Act, 2000 and related regulations</li>
                </ul>
              </section>

              <section>
                <h2>4. Creator Program</h2>
                <p>Creators who join our program agree to:</p>
                <ul>
                  <li>Produce original, high-quality content</li>
                  <li>Disclose sponsored content and affiliate relationships</li>
                  <li>Follow our editorial guidelines and brand standards</li>
                  <li>Revenue share is subject to our Creator Agreement terms</li>
                </ul>
              </section>

              <section>
                <h2>5. Intellectual Property</h2>
                <p>Content you publish remains yours, but you grant Yeszz a non-exclusive license to display, distribute, and promote it. Yeszz's branding, design, and code are our intellectual property.</p>
              </section>

              <section>
                <h2>6. Sponsorships & Advertising</h2>
                <p>All sponsored content is clearly marked. Brand partners must comply with ASCI (Advertising Standards Council of India) guidelines. Yeszz reserves the right to reject sponsorship content that doesn't meet our quality standards.</p>
              </section>

              <section>
                <h2>7. Limitation of Liability</h2>
                <p>Yeszz provides its services "as is" without warranty. We are not liable for damages arising from your use of the Platform, to the maximum extent permitted by Indian law.</p>
              </section>

              <section>
                <h2>8. Dispute Resolution</h2>
                <p>Any disputes shall be resolved through arbitration in Bangalore, Karnataka, India, in accordance with the Arbitration and Conciliation Act, 1996.</p>
              </section>

              <section>
                <h2>9. Changes to Terms</h2>
                <p>We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>
              </section>

              <section>
                <h2>10. Contact</h2>
                <p>For questions about these Terms, contact us at <a href="mailto:legal@yeszz.com">legal@yeszz.com</a> or visit our <a href="/contact">Contact page</a>.</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
