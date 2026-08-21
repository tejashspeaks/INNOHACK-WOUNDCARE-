import React, { useState, useEffect } from 'react';
import { EmergencyContact, PatientMode, Language } from '../types';
import { Send, Phone, User, Plus, Trash2, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CaretakerSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast: boolean;
  currentLang?: Language;
  woundType?: string;
  severity?: string;
  firstAidSummary?: string;
  patientMode?: PatientMode;
}

export const CaretakerSmsModal: React.FC<CaretakerSmsModalProps> = ({
  isOpen,
  onClose,
  highContrast,
  currentLang = 'en',
  woundType = 'Laceration',
  severity = 'Severe',
  firstAidSummary = 'Deep wound with active bleeding. Clean irrigation and pressure applied.',
  patientMode = 'adult'
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('ASHA Worker');
  const [sendingSms, setSendingSms] = useState<boolean>(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const t = {
    en: {
      title: 'Emergency Caretaker SMS Alert (Twilio / Gateway)',
      patient: 'Patient:',
      child: 'Child (<18 Yrs)',
      adult: 'Adult (18+)',
      severityBadge: 'SEVERITY',
      woundTypeLabel: 'Wound Type:',
      firstAidLabel: 'First Aid Summary:',
      liveGps: 'Live GPS:',
      selectContact: 'Select Recipient Caretaker Contact:',
      addContact: 'Add Emergency Contact',
      namePlaceholder: 'Name (e.g. Dr. Vijay / ASHA)',
      phonePlaceholder: 'Phone (e.g. +91 9876543210)',
      saveContactBtn: 'Save Contact Number',
      cancel: 'Cancel',
      sendBtn: 'SEND EMERGENCY SMS NOW',
      sending: 'Dispatching SMS...',
      alertDispatched: 'Emergency alert dispatched to',
      failed: 'Failed to send SMS.',
      serverError: 'Server connectivity error while sending SMS.',
      enterBoth: 'Please enter both name and phone number.',
      limitReached: 'You can save up to 3 emergency contacts.',
      selectPrompt: 'Please select a caretaker contact number.'
    },
    hi: {
      title: 'आपातकालीन देखभालकर्ता एसएमएस अलर्ट (Twilio / SMS)',
      patient: 'रोगी:',
      child: 'बच्चा (<18 वर्ष)',
      adult: 'वयस्क (18+)',
      severityBadge: 'गंभीरता',
      woundTypeLabel: 'घाव का प्रकार:',
      firstAidLabel: 'प्राथमिक उपचार सारांश:',
      liveGps: 'लाइव जीपीएस:',
      selectContact: 'देखभालकर्ता / आशा कार्यकर्ता चुनें:',
      addContact: 'आपातकालीन संपर्क जोड़ें',
      namePlaceholder: 'नाम (उदा. डॉ. विजय / आशा दीदी)',
      phonePlaceholder: 'फोन (उदा. +91 9876543210)',
      saveContactBtn: 'संपर्क नंबर सेव करें',
      cancel: 'रद्द करें',
      sendBtn: 'तुरंत आपातकालीन एसएमएस भेजें',
      sending: 'एसएमएस भेजा जा रहा है...',
      alertDispatched: 'आपातकालीन अलर्ट सफलतापूर्वक भेजा गया:',
      failed: 'एसएमएस भेजने में असमर्थ।',
      serverError: 'एसएमएस भेजते समय सर्वर त्रुटि।',
      enterBoth: 'कृपया नाम और फोन नंबर दोनों दर्ज करें।',
      limitReached: 'आप अधिकतम 3 आपातकालीन संपर्क सहेज सकते हैं।',
      selectPrompt: 'कृपया देखभालकर्ता संपर्क नंबर चुनें।'
    },
    ta: {
      title: 'அவசர பராமரிப்பாளர் SMS எச்சரிக்கை (Twilio / SMS)',
      patient: 'நோயாளி:',
      child: 'குழந்தை (<18 வயது)',
      adult: 'பெரியவர் (18+)',
      severityBadge: 'தீவிரம்',
      woundTypeLabel: 'காயத்தின் வகை:',
      firstAidLabel: 'முதலுதவி சுருக்கம்:',
      liveGps: 'நேரலை GPS:',
      selectContact: 'பெறுநர் தொடர்பு எண்ணைத் தேர்ந்தெடுக்கவும்:',
      addContact: 'அவசர தொடர்பைச் சேர்க்கவும்',
      namePlaceholder: 'பெயர் (उदा. டாக்டர் விஜய் / ஆஷா)',
      phonePlaceholder: 'தொலைபேசி (+91 9876543210)',
      saveContactBtn: 'தொடர்பு எண்ணைச் சேமிக்கவும்',
      cancel: 'ரத்து செய்',
      sendBtn: 'அவசர SMS உடனடியாக அனுப்பவும்',
      sending: 'SMS அனுப்பப்படுகிறது...',
      alertDispatched: 'அவசர எச்சரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது:',
      failed: 'SMS அனுப்புவதில் தோல்வி.',
      serverError: 'SMS அனுப்பும் போது சேவையக பிழை.',
      enterBoth: 'பெயர் மற்றும் தொலைபேசி எண் இரண்டையும் உள்ளிடவும்.',
      limitReached: 'நீங்கள் 3 தொடர்புகள் வரை சேமிக்கலாம்.',
      selectPrompt: 'பராமரிப்பாளர் தொடர்பு எண்ணைத் தேர்ந்தெடுக்கவும்.'
    }
  }[currentLang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woundcare_emergency_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setContacts(parsed);
        if (parsed.length > 0) setSelectedContactId(parsed[0].id);
      } else {
        const initialContacts: EmergencyContact[] = [
          { id: 'c1', name: 'Ramesh (Primary Caretaker)', phone: '+91 98765 43210', relation: 'Family / Guardian' },
          { id: 'c2', name: 'Lakshmi (ASHA Health Worker)', phone: '+91 91234 56789', relation: 'Village ASHA Worker' }
        ];
        setContacts(initialContacts);
        setSelectedContactId('c1');
        localStorage.setItem('woundcare_emergency_contacts', JSON.stringify(initialContacts));
      }
    } catch (e) {
      console.warn('Failed to load emergency contacts', e);
    }

    // Acquire GPS for SMS dispatch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn('Geolocation for SMS denied:', err)
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem('woundcare_emergency_contacts', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save contacts:', e);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) {
      alert(t.enterBoth);
      return;
    }
    if (contacts.length >= 3) {
      alert(t.limitReached);
      return;
    }

    const newContact: EmergencyContact = {
      id: 'c-' + Date.now(),
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation
    };

    const updated = [...contacts, newContact];
    saveContacts(updated);
    setSelectedContactId(newContact.id);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
  };

  const handleSendSms = async () => {
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) {
      alert(t.selectPrompt);
      return;
    }

    setSendingSms(true);
    setSmsStatusMessage(null);

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: contact.phone,
          patientMode,
          woundType,
          severity,
          firstAidSummary,
          gpsCoords
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSmsStatusMessage(`✅ ${t.alertDispatched} ${contact.name} (${contact.phone})!`);
      } else {
        setSmsStatusMessage(`⚠️ ${data.error || t.failed}`);
      }
    } catch (err: any) {
      setSmsStatusMessage(`⚠️ ${t.serverError}`);
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={`p-6 rounded-[24px] border max-w-lg w-full text-stone-900 shadow-2xl space-y-4 ${
              highContrast ? 'bg-zinc-900 text-yellow-300 border-yellow-400' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-stone-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {t.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Wound Alert Info */}
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>{t.patient} {patientMode === 'child' ? t.child : t.adult}</span>
                <span className="uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-red-600 text-white">
                  {severity} {t.severityBadge}
                </span>
              </div>
              <p><strong>{t.woundTypeLabel}</strong> {woundType}</p>
              <p><strong>{t.firstAidLabel}</strong> {firstAidSummary}</p>
              {gpsCoords && (
                <p className="flex items-center gap-1 text-[11px] text-red-700 font-mono font-medium">
                  <MapPin className="w-3 h-3" /> {t.liveGps} {gpsCoords.latitude.toFixed(4)}°N, {gpsCoords.longitude.toFixed(4)}°E
                </p>
              )}
            </div>

            {/* Saved Emergency Contacts List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t.selectContact}
              </label>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    selectedContactId === contact.id
                      ? 'border-emerald-600 bg-emerald-50/70 font-bold shadow-2xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="contact"
                      checked={selectedContactId === contact.id}
                      onChange={() => setSelectedContactId(contact.id)}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-bold text-stone-900">{contact.name}</div>
                      <div className="text-[11px] text-stone-500">{contact.phone} • {contact.relation}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(contact.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    title="Remove contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Contact Form (Up to 3) */}
            {contacts.length < 3 && (
              <form onSubmit={handleAddContact} className="pt-2 border-t border-stone-200 space-y-2 text-xs">
                <span className="block font-bold text-stone-600 text-[11px] uppercase tracking-wider">
                  {t.addContact} ({contacts.length}/3):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="p-2 border border-stone-300 rounded-xl bg-white text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                  />
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="p-2 border border-stone-300 rounded-xl bg-white text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.saveContactBtn}
                </button>
              </form>
            )}

            {smsStatusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{smsStatusMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSendSms}
                disabled={sendingSms || contacts.length === 0}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                <span>{sendingSms ? t.sending : t.sendBtn}</span>
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
