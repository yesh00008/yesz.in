import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const PrivacyPolicy = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-10">Last updated: February 27, 2026</p>

            <div className="prose-custom space-y-8">
              <section>
                <h2>1. Introduction</h2>
                <p>Yeszz ("we", "our", "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. We comply with India's Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023 (DPDPA).</p>
              </section>

              <section>
                <h2>2. Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                <ul>
                  <li><strong>Personal Data:</strong> Name, email address, and profile information when you create an account.</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, device information, and IP address.</li>
                  <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience.</li>
                  <li><strong>Newsletter Data:</strong> Email address when you subscribe to our newsletter.</li>
                </ul>
              </section>

              <section>
                <h2>3. How We Use Your Information</h2>
                <ul>
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To allow you to participate in interactive features</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis so we can improve our service</li>
                  <li>To send you newsletters and marketing communications (with your consent)</li>
                  <li>To detect, prevent, and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2>4. Data Sharing</h2>
                <p>We do not sell your personal data. We may share data with trusted third-party service providers who help us operate our platform (analytics, email delivery, hosting), and only to the extent necessary.</p>
              </section>

              <section>
                <h2>5. Data Retention</h2>
                <p>We retain your personal data only for as long as necessary for the purposes outlined in this policy. You may request deletion of your data at any time by contacting us.</p>
              </section>

              <section>
                <h2>6. Your Rights (DPDPA 2023)</h2>
                <ul>
                  <li>Right to access your personal data</li>
                  <li>Right to correction and erasure</li>
                  <li>Right to grievance redressal</li>
                  <li>Right to nominate someone to exercise your rights</li>
                </ul>
              </section>

              <section>
                <h2>7. Security</h2>
                <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your data.</p>
              </section>

              <section>
                <h2>8. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@yeszz.com">privacy@yeszz.com</a> or visit our <a href="/contact">Contact page</a>.</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
