import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export function LegalModal({ isOpen, onClose, type = 'privacy' }) {
  if (!isOpen) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      updated: 'October 2026',
      intro: 'Opplyra is designed to protect student data. We collect only the information necessary to match opportunities and calculate eligibility.',
      sections: [
        {
          heading: 'What We Collect',
          body: 'When you create or update your student profile, we record basic academic details such as course of study, graduation year, academic standing, and general state of residence. We never request banking credentials, government passwords, or sensitive family IDs.'
        },
        {
          heading: 'How Your Information is Used',
          body: 'Your profile data is strictly evaluated locally against stated opportunity eligibility criteria to help you determine if an opportunity fits your qualifications. We do not sell, rent, or monetize student records to third-party ad networks or brokers.'
        },
        {
          heading: 'Safety Checks & Privacy',
          body: 'When you paste announcement text or links into the Scam and Safety Check tool, we evaluate common fraud heuristics (such as upfront payment requests or spoofed domains). We do not store private WhatsApp conversations or personal attachments.'
        },
        {
          heading: 'Your Controls & Rights',
          body: 'You may update or clear your student profile details at any time through the profile settings dialog. All stored reminders and saved opportunities can be removed with one click.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      updated: 'October 2026',
      intro: 'Please review these simple terms before using Opplyra. By using our platform, you agree to these guiding principles.',
      sections: [
        {
          heading: 'Platform Purpose',
          body: 'Opplyra is an educational aggregator and discovery platform designed to assist students in finding scholarships, internships, competitive exams, and career opportunities.'
        },
        {
          heading: 'Official Portals & Verification',
          body: 'Opplyra summarizes publicly available announcements and directs students to official organization websites. While we check announcements for known warning signs, you are always responsible for reading the complete official notification on the issuing authority’s official domain before submitting applications or fees.'
        },
        {
          heading: 'No Guarantee of Selection or Awards',
          body: 'Opplyra does not guarantee scholarship awards, interview selections, job offers, or financial outcomes. Selection decisions are made solely by the respective conducting bodies and institutions.'
        },
        {
          heading: 'Acceptable Student Use',
          body: 'You agree not to misuse the platform, attempt denial-of-service against the API, or scrape data in violation of fair use policies.'
        }
      ]
    },
    safety: {
      title: 'Safety & Disclaimer Notice',
      icon: AlertTriangle,
      updated: 'October 2026',
      intro: 'Our deterministic rule checker is a defensive educational aid to help students identify common scams.',
      sections: [
        {
          heading: 'Guidance, Not a Guarantee',
          body: 'A status of "No Warning Indicators Detected" means that common known scam patterns (such as personal UPI payment demands or free email recruiters) were not found in the submitted text. It does NOT guarantee that the notice is 100% genuine.'
        },
        {
          heading: 'Crucial Rules for Students',
          body: '1. Genuine government schemes never demand money via UPI or Google Pay to an individual mobile number.\n2. Genuine recruitment notices never interview students solely over Telegram or WhatsApp groups.\n3. Always verify circulars directly on the official `.gov.in`, `.nic.in`, or verified university portal.'
        }
      ]
    }
  };

  const active = content[type] || content.privacy;
  const Icon = active.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.95)] backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="font-bold text-[#F7F5FC] text-base font-display">{active.title}</h2>
              <p className="text-[11px] text-[#91899F]">Last updated {active.updated}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#91899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intro */}
        <div className="p-3.5 rounded-xl bg-[rgba(22,18,31,0.6)] border border-[rgba(255,255,255,0.08)] text-xs text-[#B7B0C7] mb-4 leading-relaxed">
          {active.intro}
        </div>

        {/* Sections */}
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {active.sections.map((sec, i) => (
            <div key={i} className="space-y-1">
              <h3 className="text-xs font-bold text-[#F7F5FC] font-display">{sec.heading}</h3>
              <p className="text-xs text-[#B7B0C7] leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[rgba(255,255,255,0.10)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

