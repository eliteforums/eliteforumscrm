import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <h1 className="text-4xl font-display font-extrabold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Elite CRM, a product by Elite Forums (<a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">eliteforums.in</a>), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elite CRM is an enterprise-grade Customer Relationship Management platform that provides contact management, call tracking, deal pipeline management, task management, email integration, workflow automation, and AI-powered assistance. The platform is available as a Progressive Web App (PWA) accessible via web browsers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Elite CRM is an invite-only platform. Accounts are created by Super Admins.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must not share your account with others or allow unauthorized access.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the platform for any unlawful purpose</li>
              <li>Upload or transmit viruses, malware, or malicious code</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data</li>
              <li>Interfere with or disrupt the platform's infrastructure</li>
              <li>Use the platform to send unsolicited communications (spam)</li>
              <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
              <li>Use automated systems (bots, scrapers) to access the platform without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">5. Data Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all data you input into Elite CRM, including contacts, leads, deals, notes, and call records. We do not claim ownership over your data. You grant us a limited license to process and store your data solely for the purpose of providing our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">6. Role-Based Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elite CRM implements role-based access control (Super Admin, Admin, Manager, Employee). Access to features and data is determined by your assigned role. Organization administrators are responsible for managing user roles and permissions appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may perform scheduled maintenance with prior notice. We are not liable for any downtime, data loss, or service interruption due to factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elite CRM, its logo, design, and all related intellectual property are owned by Elite Forums. You may not use our branding, trademarks, or proprietary materials without written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Elite Forums shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform. Our total liability shall not exceed the amount you paid for the service in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to Elite CRM at any time for violation of these terms. Upon termination, your right to use the platform ceases immediately. You may request export of your data within 30 days of termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-foreground mb-3">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions regarding these Terms, please contact us at{" "}
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
