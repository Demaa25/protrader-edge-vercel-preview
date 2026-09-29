import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Top strip: Follow + Newsletter */}
        <div className={styles.topStrip}>
          <div className={styles.container}>
            <div className={styles.follow}>
              <span className={styles.followLabel}>Follow Us</span>

              <div className={styles.socials} aria-label="Social media links">
                {/* Replace hrefs with your real social links later */}
                <a className={styles.socialBtn} href="#" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a className={styles.socialBtn} href="#" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a className={styles.socialBtn} href="#" aria-label="LinkedIn">
                  <FaLinkedinIn />
                </a>
                <a className={styles.socialBtn} href="#" aria-label="X (Twitter)">
                  <FaXTwitter />
                </a>
                <a className={styles.socialBtn} href="#" aria-label="YouTube">
                  <FaYoutube />
                </a>
              </div>
            </div>

            <div className={styles.newsletter}>
              <span className={styles.newsletterLabel}>
                Subscribe To Our <span className={styles.gold}>Newsletter</span>
              </span>

              <form
                className={styles.newsletterForm}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className={styles.newsletterInput}
                  aria-label="Email address"
                />

                <button type="submit" className={styles.subscribeBtn}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <h4 className={styles.h}>Programs</h4>
            <Link className={styles.a} href="/programs">Core Programs</Link>
            <Link className={styles.a} href="/programs/specialist">Specialist Certifications</Link>
          </div>

          <div>
            <h4 className={styles.h}>Resources</h4>
            <Link className={styles.a} href="/resources/research">Research</Link>
            <Link className={styles.a} href="/resources/frameworks">Frameworks</Link>
            <Link className={styles.a} href="/resources/tools">Trading Tools</Link>
            <Link className={styles.a} href="/resources/articles">Articles</Link>
          </div>

          <div>
            <h4 className={styles.h}>Company</h4>
            <Link className={styles.a} href="/about">About Us</Link>
            <Link className={styles.a} href="/how-progression-works">How Progression Works</Link>
          </div>

          <div>
            <h4 className={styles.h}>Legal</h4>
            <Link className={styles.a} href="/legal/risk-disclosures">Risk Disclosures</Link>
            <Link className={styles.a} href="/legal/ethics-and-standards">Ethics &amp; Standards</Link>
            <Link className={styles.a} href="/legal/legal-and-compliance">Legal &amp; Compliance</Link>
            <Link className={styles.a} href="/legal/privacy-policy">Privacy Policy</Link>
            <Link className={styles.a} href="/legal/terms-of-use">Terms of Use</Link>
            <Link className={styles.a} href="/legal/refund-policy">Refund Policy</Link>
          </div>

          <div>
            <h4 className={styles.h}>Support</h4>
            <Link className={styles.a} href="/faqs">FAQs</Link>
            <Link className={styles.a} href="/contact">Contact Us</Link>
            <Link className={styles.a} href="/login">Login</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} ProTrader Edge Limited. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
