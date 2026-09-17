import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Privacy Notice | Manila Wine Collector's Choice",
  description: "How Manila Wine collects, uses, and protects your data during the Collector's Choice campaign.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-ivory">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gold hover:underline mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaign
        </Link>

        <div className="p-4 rounded-lg bg-wine/20 border border-wine/40 text-xs text-wine-light mb-10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Subject to Manila Wine Compliance Review:</strong>
            This privacy notice is drafted to comply with the Philippine Data Privacy Act of 2012 (RA 10173) and modern global transparency standards.
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-ivory mb-4">
          Privacy Notice
        </h1>
        <p className="text-xs text-ivory/50 uppercase tracking-wider mb-10">
          Effective Date: September 2026 • Manila Wine
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-ivory/80 leading-relaxed font-light">
          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">1. Information We Collect</h2>
            <p>During your participation in the Manila Wine Collector&apos;s Choice microsite, we collect the following categories of data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Identity:</strong> Your verified email address, optional display name, and avatar provided via Google, Facebook, or passwordless email sign-in.</li>
              <li><strong>Age Verification:</strong> Your declaration confirming that you are at least 18 years of age.</li>
              <li><strong>Voting Activity:</strong> The single concept design you selected, timestamp of your vote, and any subsequent vote-change timestamps.</li>
              <li><strong>Expression of Interest (Pledge):</strong> Your preference tier, optional preferred bottle number (1–100), and related consent selections.</li>
              <li><strong>Campaign Attribution:</strong> Non-personally identifying campaign source tags (UTM parameters, referral headers) to measure marketing effectiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">2. Purpose of Collection</h2>
            <p>We process your data strictly for legitimate operational purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To enforce our one-vote-per-collector rule and ensure democratic integrity of the community vote.</li>
              <li>To compile aggregate voting totals and assess design demand across the Philippine collector base.</li>
              <li>To contact registered participants with essential campaign updates, winning design announcements, and advance purchase access windows.</li>
              <li>To protect against abuse, bot voting, and unauthorized tampering.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">3. Separation of Consents</h2>
            <p>
              In accordance with privacy best practices, Manila Wine maintains strict separation between campaign-essential notifications 
              and general marketing communications:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Campaign Updates:</strong> Essential communications regarding the outcome of your vote, winning design announcement, and priority-sale opening.</li>
              <li><strong>General Marketing:</strong> Optional newsletter, fine wine promotions, and broader Manila Wine store updates. Marketing consent is unchecked by default and completely voluntary.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">4. Data Retention & Privacy Rights</h2>
            <p>
              Your cast vote and pledge history may be retained in secure audit archives to verify results and prevent duplicate votes. 
              Under the Data Privacy Act of 2012, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Withdraw your expression of purchase interest at any time via the microsite interface or email request.</li>
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Request correction of inaccurate information or deletion of your account record, subject to legitimate campaign audit retention obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">5. Contact Our Privacy Team</h2>
            <p>
              For inquiries regarding this privacy policy or your personal data rights, please contact our Data Protection Officer at:
            </p>
            <p className="text-ivory">
              <strong>Email:</strong> <a href="mailto:privacy@manila-wine.com" className="text-gold hover:underline">privacy@manila-wine.com</a><br />
              <strong>Customer Support:</strong> +63917 860 0808<br />
              <strong>Address:</strong> Manila Wine, Metro Manila, Philippines
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
