import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <h1 className="text-4xl font-display font-extrabold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elite CRM, a product by Elite Forums (<a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">eliteforums.in</a>), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our CRM platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, company name, and job title provided during registration or account setup.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent.</li>
              <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, device identifiers, and IP address.</li>
              <li><strong className="text-foreground">Contact Data:</strong> Information you store within the CRM, including contacts, leads, deals, and call logs.</li>
              <li><strong className="text-foreground">Phone Contacts:</strong> When you use the Contact Picker feature, we access only the contacts you explicitly select. We do not bulk-access your phone's contact list.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our CRM services</li>
              <li>To authenticate users and manage access controls</li>
              <li>To send important service-related notifications</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To respond to customer support inquiries</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, and regular security audits. Your data is stored on secure, SOC 2-compliant infrastructure. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist us in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, your data will be permanently removed within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and download your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of non-essential communications</li>
              <li>Data portability — export your CRM data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and session management. We do not use third-party tracking cookies. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">eliteforums.in</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Elite CRM. A product by{" "}
            <a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Elite Forums
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
