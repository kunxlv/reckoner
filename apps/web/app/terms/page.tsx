import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = {
  title: 'Terms of Use | Reckoner',
  description: 'Terms and conditions for using Reckoner financial calculators.',
};

const h2Style = { fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: '32px 0 10px' };
const pStyle = { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', color: 'var(--color-ink-deep)' };
const ulStyle = { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', paddingLeft: 20, color: 'var(--color-ink-deep)' };

export default function TermsPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 8 }}>Last updated: July 2025</p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 20px' }}>Terms of Use</h1>
          <p style={pStyle}>
            Please read these Terms of Use carefully before using reckoner.tools (the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these terms. If you do not agree, please do not use the Service.
          </p>

          <h2 style={h2Style}>1. Information Only - Not Financial Advice</h2>
          <p style={pStyle}>
            Reckoner provides financial calculators for general information and educational purposes only. <strong>Nothing on this website constitutes financial advice, investment advice, mortgage advice, tax advice, or any other professional advice.</strong>
          </p>
          <p style={pStyle}>
            All results produced by the calculators are estimates based solely on the values you input and published reference rates. They do not account for:
          </p>
          <ul style={ulStyle}>
            <li>Your individual financial circumstances, credit history, or eligibility</li>
            <li>Lender fees, arrangement fees, or exit charges</li>
            <li>Local taxes, stamp duty, or government levies beyond illustrative estimates</li>
            <li>Insurance requirements or costs</li>
            <li>Changes in interest rates after the calculation date</li>
            <li>Market conditions or economic factors</li>
          </ul>
          <p style={pStyle}>
            Before making any borrowing, investment, or financial decision, consult a qualified and authorised financial adviser, mortgage broker, or other relevant professional. The Service is not a substitute for professional advice.
          </p>

          <h2 style={h2Style}>2. Accuracy of Information</h2>
          <p style={pStyle}>
            We take reasonable care to ensure the calculators use correct formulas and that prefilled reference rates are reasonably current. However, we make no warranty - express or implied - that:
          </p>
          <ul style={ulStyle}>
            <li>Any result is accurate, complete, or up to date</li>
            <li>Prefilled interest rates reflect rates available to you from any lender</li>
            <li>The Service is free from errors or interruptions</li>
          </ul>
          <p style={pStyle}>
            Reference rates shown are national averages sourced from published data and may not reflect your location, credit profile, or current market conditions. Rates change frequently; always verify current rates directly with lenders.
          </p>

          <h2 style={h2Style}>3. No Offer of Credit</h2>
          <p style={pStyle}>
            Nothing on the Service constitutes an offer or agreement to provide credit, a loan, or any financial product. Use of the calculators does not create any obligation on the part of any lender, nor does it guarantee you will qualify for any particular rate or product.
          </p>

          <h2 style={h2Style}>4. Limitation of Liability</h2>
          <p style={pStyle}>
            To the fullest extent permitted by applicable law, Reckoner and its operators shall not be liable for any loss or damage - direct, indirect, incidental, consequential, or otherwise - arising from:
          </p>
          <ul style={ulStyle}>
            <li>Your reliance on any calculation, estimate, or information provided by the Service</li>
            <li>Any financial decision made based on information from the Service</li>
            <li>Errors, inaccuracies, or omissions in the information provided</li>
            <li>Interruption or unavailability of the Service</li>
          </ul>
          <p style={pStyle}>
            Your use of the Service is entirely at your own risk.
          </p>

          <h2 style={h2Style}>5. Intellectual Property</h2>
          <p style={pStyle}>
            All content on the Service - including text, calculator logic, design, graphics, and code - is owned by or licensed to Reckoner and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the Service without our express written consent.
          </p>
          <p style={pStyle}>
            Personal, non-commercial use of individual calculation results (e.g. copying a figure for your own records) is permitted.
          </p>

          <h2 style={h2Style}>6. Advertising</h2>
          <p style={pStyle}>
            The Service displays advertisements served by Google AdSense and may display advertisements from other third-party networks. Advertisements are clearly distinguished from editorial content. We do not endorse any advertiser or the products and services they promote. We have no control over the content of third-party advertisements.
          </p>
          <p style={pStyle}>
            If you click on an advertisement, you will be directed to a third-party website. Your use of that site is governed by that site&apos;s own terms and privacy policy. We are not responsible for the content or practices of third-party sites.
          </p>

          <h2 style={h2Style}>7. Third-Party Links</h2>
          <p style={pStyle}>
            The Service may contain links to third-party websites for reference purposes. These links are provided as a convenience only. We do not endorse the linked sites and are not responsible for their content, accuracy, or practices.
          </p>

          <h2 style={h2Style}>8. Acceptable Use</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={ulStyle}>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the Service</li>
            <li>Scrape, crawl, or systematically harvest data from the Service without our consent</li>
            <li>Transmit any malicious code, viruses, or other harmful material</li>
            <li>Interfere with or disrupt the operation of the Service</li>
          </ul>

          <h2 style={h2Style}>9. Governing Law</h2>
          <p style={pStyle}>
            These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Reckoner is operated. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of that jurisdiction.
          </p>

          <h2 style={h2Style}>10. Changes to These Terms</h2>
          <p style={pStyle}>
            We may update these Terms of Use from time to time. The date at the top of this page reflects the most recent revision. Continued use of the Service after updated Terms are posted constitutes your acceptance of the revised Terms.
          </p>

          <h2 style={h2Style}>11. Contact</h2>
          <p style={pStyle}>
            Questions about these Terms? Email us at <a href="mailto:developer@kunalv.com" style={{ color: 'var(--color-focus)' }}>developer@kunalv.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
