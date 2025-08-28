import React from 'react';
import {
  shieldCheckmarkOutline,
  documentTextOutline,
  peopleOutline,
  mailOutline,
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

const TermsAndPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Top Taskbar */}
      <header className="bg-[var(--primary-dark)] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--accent-gold)]">YourApp</h1>
        <nav className="space-x-4 text-sm">
          <a href="/tabs/home" className="hover:underline text-[var(--accent-yellow)]">Home</a>
          <a href="/tabs/profile" className="hover:underline text-[var(--accent-yellow)]">Profile</a>
          <a href="/tabs/menu" className="hover:underline text-[var(--accent-yellow)]">Menu</a>
        </nav>
      </header>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white dark:bg-[var(--primary-dark)] border border-[var(--primary-medium)] rounded-2xl shadow-lg p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <IonIcon icon={shieldCheckmarkOutline} className="text-[var(--accent-gold)] text-2xl" />
            <h2 className="text-2xl font-bold dark:text-[var(--accent-yellow)]">Terms & Privacy Policy</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--accent-gold)]">
            Effective Date: April 9, 2025
          </p>

          {/* Sections */}
          <div className="space-y-4">
            <section>
              <h3 className="flex items-center text-lg font-semibold text-[var(--primary-medium)] dark:text-[var(--accent-gold)] mb-1">
                <IonIcon icon={documentTextOutline} className="mr-2 text-xl" />
                Introduction
              </h3>
              <p className="text-[var(--text-secondary)] dark:text-[var(--accent-yellow)]">
                By accessing our app, you agree to these terms. This policy explains your rights and how we handle your data.
              </p>
            </section>

            <section>
              <h3 className="flex items-center text-lg font-semibold text-[var(--primary-medium)] dark:text-[var(--accent-gold)] mb-1">
                <IonIcon icon={peopleOutline} className="mr-2 text-xl" />
                Your Data & Privacy
              </h3>
              <p className="text-[var(--text-secondary)] dark:text-[var(--accent-yellow)]">
                We collect minimal data needed for functionality. Your data is secure and never sold to third parties.
              </p>
            </section>

            <section>
              <h3 className="flex items-center text-lg font-semibold text-[var(--primary-medium)] dark:text-[var(--accent-gold)] mb-1">
                <IonIcon icon={shieldCheckmarkOutline} className="mr-2 text-xl" />
                Usage Guidelines
              </h3>
              <p className="text-[var(--text-secondary)] dark:text-[var(--accent-yellow)]">
                Please use our services responsibly. Misuse or abuse may result in account suspension.
              </p>
            </section>

            <section>
              <h3 className="flex items-center text-lg font-semibold text-[var(--primary-medium)] dark:text-[var(--accent-gold)] mb-1">
                <IonIcon icon={documentTextOutline} className="mr-2 text-xl" />
                Updates to Policy
              </h3>
              <p className="text-[var(--text-secondary)] dark:text-[var(--accent-yellow)]">
                We may update terms periodically. You will be notified of major changes within the app.
              </p>
            </section>
          </div>

          {/* Footer */}
          <footer className="border-t border-[var(--primary-medium)] pt-4 text-sm text-[var(--text-secondary)] dark:text-[var(--accent-yellow)]">
            <p className="flex items-center">
              <IonIcon icon={mailOutline} className="mr-2 text-base" />
              Contact us at <a href="mailto:support@yourapp.com" className="ml-1 font-medium text-[var(--accent-gold)] hover:underline">support@yourapp.com</a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default TermsAndPolicy;
