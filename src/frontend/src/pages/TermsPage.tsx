import { ArrowLeft } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="terms.back_button"
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: "#6B7280" }} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #4ECDC4, #2D9B94)" }}
          >
            S
          </div>
          <span className="font-bold text-sm" style={{ color: "#111827" }}>
            StagePro
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
          Terms of Service
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div
          className="prose max-w-none space-y-6 text-sm leading-relaxed"
          style={{ color: "#374151" }}
        >
          <p>
            The words of which the initial letter is capitalized have meanings
            defined under the following conditions. The following definitions
            shall have the same meaning regardless of whether they appear in
            singular or in plural.
          </p>

          <Section title="Definitions">
            <p>For the purposes of these Terms of Service:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>"Affiliate"</strong> means an entity that controls, is
                controlled by or is under common control with a party, where
                "control" means ownership of 50% or more of the shares, equity
                interest or other securities entitled to vote for election of
                directors or other managing authority.
              </li>
              <li>
                <strong>"Account"</strong> means a unique account created for
                You to access our Service or parts of our Service.
              </li>
              <li>
                <strong>"Company"</strong> (referred to as either "the Company",
                "We", "Us" or "Our" in this Agreement) refers to Stagepro.ai.
              </li>
              <li>
                <strong>"Country"</strong> refers to India.
              </li>
              <li>
                <strong>"Content"</strong> refers to content such as text,
                images, or other information that can be posted, uploaded,
                linked to or otherwise made available by You, regardless of the
                form of that content.
              </li>
              <li>
                <strong>"Device"</strong> means any device that can access the
                Service such as a computer, a cell phone or a digital tablet.
              </li>
              <li>
                <strong>"Feedback"</strong> means feedback, innovations or
                suggestions sent by You regarding the attributes, performance or
                features of our Service.
              </li>
              <li>
                <strong>"Service"</strong> refers to the Website.
              </li>
              <li>
                <strong>"Terms of Service"</strong> (also referred as "Terms")
                mean these Terms of Service that form the entire agreement
                between You and the Company regarding the use of the Service.
              </li>
              <li>
                <strong>"Third-party Social Media Service"</strong> means any
                services or content (including data, information, products or
                services) provided by a third-party that may be displayed,
                included or made available by the Service.
              </li>
              <li>
                <strong>"Website"</strong> refers to Stagepro.ai, accessible
                from Stagepro.ai.
              </li>
              <li>
                <strong>"You"</strong> means the individual accessing or using
                the Service, or the company, or other legal entity on behalf of
                which such individual is accessing or using the Service, as
                applicable.
              </li>
            </ul>
          </Section>

          <Section title="Acknowledgment">
            <p>
              These are the Terms of Service governing the use of this Service
              and the agreement that operates between You and the Company. These
              Terms of Service set out the rights and obligations of all users
              regarding the use of the Service.
            </p>
            <p className="mt-3">
              Your access to and use of the Service is conditioned on Your
              acceptance of and compliance with these Terms of Service. These
              Terms of Service apply to all visitors, users and others who
              access or use the Service.
            </p>
            <p className="mt-3">
              By accessing or using the Service You agree to be bound by these
              Terms of Service. If You disagree with any part of these Terms of
              Service then You may not access the Service.
            </p>
            <p className="mt-3">
              Your access to and use of the Service is also conditioned on Your
              acceptance of and compliance with the Privacy Policy of the
              Company. Our Privacy Policy describes Our policies and procedures
              on the collection, use and disclosure of Your personal information
              when You use the Application or the Website and tells You about
              Your privacy rights and how the law protects You. Please read Our
              Privacy Policy carefully before using Our Service.
            </p>
          </Section>

          <Section title="User Accounts">
            <p>
              When You create an account with Us, You must provide Us
              information that is accurate, complete, and current at all times.
              Failure to do so constitutes a breach of the Terms, which may
              result in immediate termination of Your account on Our Service.
            </p>
            <p className="mt-3">
              You are responsible for safeguarding the password that You use to
              access the Service and for any activities or actions under Your
              password, whether Your password is with Our Service or a
              Third-Party Social Media Service.
            </p>
            <p className="mt-3">
              You agree not to disclose Your password to any third party. You
              must notify Us immediately upon becoming aware of any breach of
              security or unauthorized use of Your account.
            </p>
            <p className="mt-3">
              You may not use as a username the name of another person or entity
              or that is not lawfully available for use, a name or trademark
              that is subject to any rights of another person or entity other
              than You without appropriate authorization, or a name that is
              otherwise offensive, vulgar or obscene.
            </p>
          </Section>

          <Section title="Content">
            <h3 className="font-semibold mb-2" style={{ color: "#111827" }}>
              Your Right to Post Content
            </h3>
            <p>
              Our Service allows You to post Content. You are responsible for
              the Content that You post to the Service, including its legality,
              reliability, and appropriateness.
            </p>
            <p className="mt-3">
              By posting Content to the Service, You grant Us the right and
              license to use, modify, publicly perform, publicly display,
              reproduce, and distribute such Content on and through the Service.
              You retain any and all of Your rights to any Content You submit,
              post or display on or through the Service and You are responsible
              for protecting those rights. You agree that this license includes
              the right for Us to make Your Content available to other users of
              the Service, who may also use Your Content subject to these Terms.
            </p>
            <p className="mt-3">
              You represent and warrant that: (i) the Content is Yours (You own
              it) or You have the right to use it and grant Us the rights and
              license as provided in these Terms, and (ii) the posting of Your
              Content on or through the Service does not violate the privacy
              rights, publicity rights, copyrights, contract rights or any other
              rights of any person.
            </p>

            <h3
              className="font-semibold mb-2 mt-5"
              style={{ color: "#111827" }}
            >
              Content Restrictions
            </h3>
            <p>
              The Company is not responsible for the content of the Service's
              users. You expressly understand and agree that You are solely
              responsible for the Content and for all activity that occurs under
              your account, whether done so by You or any third person using
              Your account.
            </p>
            <p className="mt-3">
              You may not transmit any Content that is unlawful, offensive,
              upsetting, intended to disgust, threatening, libelous, defamatory,
              obscene or otherwise objectionable. Examples of such objectionable
              Content include, but are not limited to, the following:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Unlawful or promoting unlawful activity.</li>
              <li>
                Defamatory, discriminatory, or mean-spirited content, including
                references or commentary about religion, race, sexual
                orientation, gender, national/ethnic origin, or other targeted
                groups.
              </li>
              <li>
                Spam, machine – or randomly – generated, constituting
                unauthorized or unsolicited advertising, chain letters, any
                other form of unauthorized solicitation, or any form of lottery
                or gambling.
              </li>
              <li>
                Containing or installing any viruses, worms, malware, trojan
                horses, or other content that is designed or intended to
                disrupt, damage, or limit the functioning of any software,
                hardware or telecommunications equipment.
              </li>
              <li>
                Infringing on any proprietary rights of any party, including
                patent, trademark, trade secret, copyright, right of publicity
                or other rights.
              </li>
              <li>
                Impersonating any person or entity including the Company and its
                employees or representatives.
              </li>
              <li>Violating the privacy of any third person.</li>
              <li>False information and features.</li>
            </ul>

            <h3
              className="font-semibold mb-2 mt-5"
              style={{ color: "#111827" }}
            >
              Content Backups
            </h3>
            <p>
              Although regular backups of Content are performed, the Company
              does not guarantee there will be no loss or corruption of data.
              Corrupt or invalid backup points may be caused by, without
              limitation, Content that is corrupted prior to being backed up or
              that changes during the time a backup is performed.
            </p>
            <p className="mt-3">
              The Company will provide support and attempt to troubleshoot any
              known or discovered issues that may affect the backups of Content.
              But You acknowledge that the Company has no liability related to
              the integrity of Content or the failure to successfully restore
              Content to a usable state.
            </p>
            <p className="mt-3">
              You agree to maintain a complete and accurate copy of any Content
              in a location independent of the Service.
            </p>
          </Section>

          <Section title="Copyright Policy">
            <h3 className="font-semibold mb-2" style={{ color: "#111827" }}>
              Intellectual Property Infringement
            </h3>
            <p>
              We respect the intellectual property rights of others. It is Our
              policy to respond to any claim that Content posted on the Service
              infringes a copyright or other intellectual property infringement
              of any person.
            </p>
            <p className="mt-3">
              If You are a copyright owner, or authorized on behalf of one, and
              You believe that the copyrighted work has been copied in a way
              that constitutes copyright infringement that is taking place
              through the Service, You must submit Your notice in writing to the
              attention of our copyright agent via email (
              <a
                href="mailto:coilandvirtualstaging@outlook.com"
                className="underline"
              >
                coilandvirtualstaging@outlook.com
              </a>
              ) and include in Your notice a detailed description of the alleged
              infringement.
            </p>
            <p className="mt-3">
              You may be held accountable for damages (including costs and
              attorneys' fees) for misrepresenting that any Content is
              infringing Your copyright.
            </p>

            <h3
              className="font-semibold mb-2 mt-5"
              style={{ color: "#111827" }}
            >
              DMCA Notice and DMCA Procedure for Copyright Infringement Claims
            </h3>
            <p>
              You may submit a notification pursuant to the Digital Millennium
              Copyright Act (DMCA) by providing our Copyright Agent with the
              following information in writing (see 17 U.S.C 512(c)(3) for
              further detail):
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                An electronic or physical signature of the person authorized to
                act on behalf of the owner of the copyright's interest.
              </li>
              <li>
                A description of the copyrighted work that You claim has been
                infringed, including the URL of the location where the
                copyrighted work exists or a copy of the copyrighted work.
              </li>
              <li>
                Identification of the URL or other specific location on the
                Service where the material that You claim is infringing is
                located.
              </li>
              <li>Your address, telephone number, and email address.</li>
              <li>
                A statement by You that You have a good faith belief that the
                disputed use is not authorized by the copyright owner, its
                agent, or the law.
              </li>
              <li>
                A statement by You, made under penalty of perjury, that the
                above information in Your notice is accurate and that You are
                the copyright owner or authorized to act on the copyright
                owner's behalf.
              </li>
            </ul>
            <p className="mt-3">
              You can contact our copyright agent via email (
              <a
                href="mailto:coilandvirtualstaging@outlook.com"
                className="underline"
              >
                coilandvirtualstaging@outlook.com
              </a>
              ). Upon receipt of a notification, the Company will take whatever
              action, in its sole discretion, it deems appropriate, including
              removal of the challenged content from the Service.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              The Service and its original content (excluding Content provided
              by You or other users), features and functionality are and will
              remain the exclusive property of the Company and its licensors.
            </p>
            <p className="mt-3">
              The Service is protected by copyright, trademark, and other laws
              of both the Country and foreign countries.
            </p>
            <p className="mt-3">
              Our trademarks and trade dress may not be used in connection with
              any product or service without the prior written consent of the
              Company.
            </p>
          </Section>

          <Section title="Your Feedback to Us">
            <p>
              You assign all rights, title and interest in any Feedback You
              provide the Company. If for any reason such assignment is
              ineffective, You agree to grant the Company a non-exclusive,
              perpetual, irrevocable, royalty free, worldwide right and license
              to use, reproduce, disclose, sub-license, distribute, modify and
              exploit such Feedback without restriction.
            </p>
          </Section>

          <Section title="Links to Other Websites">
            <p>
              Our Service may contain links to third-party web sites or services
              that are not owned or controlled by the Company.
            </p>
            <p className="mt-3">
              The Company has no control over, and assumes no responsibility
              for, the content, privacy policies, or practices of any third
              party web sites or services. You further acknowledge and agree
              that the Company shall not be responsible or liable, directly or
              indirectly, for any damage or loss caused or alleged to be caused
              by or in connection with the use of or reliance on any such
              content, goods or services available on or through any such web
              sites or services.
            </p>
            <p className="mt-3">
              We strongly advise You to read the terms and conditions and
              privacy policies of any third-party web sites or services that You
              visit.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              We may terminate or suspend Your Account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if You breach these Terms of Service.
            </p>
            <p className="mt-3">
              Upon termination, Your right to use the Service will cease
              immediately. If You wish to terminate Your Account, You may simply
              discontinue using the Service.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              Notwithstanding any damages that You might incur, the entire
              liability of the Company and any of its suppliers under any
              provision of this Terms and Your exclusive remedy for all of the
              foregoing shall be limited to the amount actually paid by You
              through the Service or 100 USD if You haven't purchased anything
              through the Service.
            </p>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, in no event
              shall the Company or its suppliers be liable for any special,
              incidental, indirect, or consequential damages whatsoever
              (including, but not limited to, damages for loss of profits, loss
              of data or other information, for business interruption, for
              personal injury, loss of privacy arising out of or in any way
              related to the use of or inability to use the Service, third-party
              software and/or third-party hardware used with the Service, or
              otherwise in connection with any provision of this Terms), even if
              the Company or any supplier has been advised of the possibility of
              such damages and even if the remedy fails of its essential
              purpose.
            </p>
            <p className="mt-3">
              Some states do not allow the exclusion of implied warranties or
              limitation of liability for incidental or consequential damages,
              which means that some of the above limitations may not apply. In
              these states, each party's liability will be limited to the
              greatest extent permitted by law.
            </p>
          </Section>

          <Section title='"AS IS" and "AS AVAILABLE" Disclaimer'>
            <p>
              The Service is provided to You "AS IS" and "AS AVAILABLE" and with
              all faults and defects without warranty of any kind. To the
              maximum extent permitted under applicable law, the Company, on its
              own behalf and on behalf of its Affiliates and its and their
              respective licensors and service providers, expressly disclaims
              all warranties, whether express, implied, statutory or otherwise,
              with respect to the Service, including all implied warranties of
              merchantability, fitness for a particular purpose, title and
              non-infringement, and warranties that may arise out of course of
              dealing, course of performance, usage or trade practice. Without
              limitation to the foregoing, the Company provides no warranty or
              undertaking, and makes no representation of any kind that the
              Service will meet Your requirements, achieve any intended results,
              be compatible or work with any other software, applications,
              systems or services, operate without interruption, meet any
              performance or reliability standards or be error free or that any
              errors or defects can or will be corrected.
            </p>
            <p className="mt-3">
              Without limiting the foregoing, neither the Company nor any of the
              company's provider makes any representation or warranty of any
              kind, express or implied: (i) as to the operation or availability
              of the Service, or the information, content, and materials or
              products included thereon; (ii) that the Service will be
              uninterrupted or error-free; (iii) as to the accuracy,
              reliability, or currency of any information or content provided
              through the Service; or (iv) that the Service, its servers, the
              content, or e-mails sent from or on behalf of the Company are free
              of viruses, scripts, trojan horses, worms, malware, timebombs or
              other harmful components.
            </p>
            <p className="mt-3">
              Some jurisdictions do not allow the exclusion of certain types of
              warranties or limitations on applicable statutory rights of a
              consumer, so some or all of the above exclusions and limitations
              may not apply to You. But in such a case the exclusions and
              limitations set forth in this section shall be applied to the
              greatest extent enforceable under applicable law.
            </p>
          </Section>

          <Section title="Governing Law">
            <p>
              The laws of the Country, excluding its conflicts of law rules,
              shall govern this Terms and Your use of the Service. Your use of
              the Application may also be subject to other local, state,
              national, or international laws.
            </p>
          </Section>

          <Section title="Disputes Resolution">
            <p>
              If You have any concern or dispute about the Service, You agree to
              first try to resolve the dispute informally by contacting the
              Company.
            </p>
          </Section>

          <Section title="For European Union (EU) Users">
            <p>
              If You are a European Union consumer, you will benefit from any
              mandatory provisions of the law of the country in which you are
              resident in.
            </p>
          </Section>

          <Section title="United States Legal Compliance">
            <p>
              You represent and warrant that (i) You are not located in a
              country that is subject to the United States government embargo,
              or that has been designated by the United States government as a
              "terrorist supporting" country, and (ii) You are not listed on any
              United States government list of prohibited or restricted parties.
            </p>
          </Section>

          <Section title="Severability and Waiver">
            <h3 className="font-semibold mb-2" style={{ color: "#111827" }}>
              Severability
            </h3>
            <p>
              If any provision of these Terms is held to be unenforceable or
              invalid, such provision will be changed and interpreted to
              accomplish the objectives of such provision to the greatest extent
              possible under applicable law and the remaining provisions will
              continue in full force and effect.
            </p>
            <h3
              className="font-semibold mb-2 mt-4"
              style={{ color: "#111827" }}
            >
              Waiver
            </h3>
            <p>
              Except as provided herein, the failure to exercise a right or to
              require performance of an obligation under these Terms shall not
              effect a party's ability to exercise such right or require such
              performance at any time thereafter nor shall the waiver of a
              breach constitute a waiver of any subsequent breach.
            </p>
          </Section>

          <Section title="Changes to These Terms of Service">
            <p>
              We reserve the right, at Our sole discretion, to modify or replace
              these Terms at any time. If a revision is material We will make
              reasonable efforts to provide at least 30 days' notice prior to
              any new terms taking effect. What constitutes a material change
              will be determined at Our sole discretion.
            </p>
            <p className="mt-3">
              By continuing to access or use Our Service after those revisions
              become effective, You agree to be bound by the revised terms. If
              You do not agree to the new terms, in whole or in part, please
              stop using the website and the Service.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions about these Terms of Service, You can
              contact us:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                By visiting this page on our website:{" "}
                <a
                  href="https://stagepro.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  stagepro.ai
                </a>
              </li>
              <li>
                By sending us an email:{" "}
                <a
                  href="mailto:coilandvirtualstaging@outlook.com"
                  className="underline"
                >
                  coilandvirtualstaging@outlook.com
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </main>

      <footer
        className="py-6 text-center text-xs border-t mt-10"
        style={{
          borderColor: "#E2E8F0",
          color: "#9CA3AF",
          backgroundColor: "#FFFFFF",
        }}
      >
        © {new Date().getFullYear()} StagePro. All rights reserved.
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-lg font-bold mb-3 pb-2"
        style={{ color: "#111827", borderBottom: "1px solid #E5E7EB" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
