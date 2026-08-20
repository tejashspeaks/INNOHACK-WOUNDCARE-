import React, { useState } from 'react';
import { UserCheck, ShieldAlert, Heart, Activity, Check, Plus, Trash2, Save, User, Phone, Baby } from 'lucide-react';
import { AllergyProfile, EmergencyContact, Language, PatientMode } from '../types';

interface PatientProfileTabProps {
  allergies: AllergyProfile;
  onUpdateAllergies: (updated: AllergyProfile) => void;
  isDiabeticMode: boolean;
  onToggleDiabeticMode: (val: boolean) => void;
  patientMode: PatientMode;
  onTogglePatientMode: (mode: PatientMode) => void;
  emergencyContacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  currentLang?: Language;
  highContrast?: boolean;
}

export const PatientProfileTab: React.FC<PatientProfileTabProps> = ({
  allergies,
  onUpdateAllergies,
  isDiabeticMode,
  onToggleDiabeticMode,
  patientMode,
  onTogglePatientMode,
  emergencyContacts,
  onAddContact,
  onDeleteContact,
  currentLang = 'en',
  highContrast
}) => {
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  const dictionary = {
    en: {
      badge: 'Clinical Safety & Personal Preferences',
      title: 'Patient Medical Profile & Safety Guardrails',
      allergyTitle: 'Allergy Safe First-Aid Filter',
      allergyBadge: 'Auto-Filters First Aid',
      allergyDesc: 'Select materials and medications you are allergic to. AI will automatically substitute or remove allergic items from first aid protocols and medicine suggestions.',
      allergyIodine: 'Povidone-Iodine / Betadine Antiseptic',
      allergyLatex: 'Latex Gloves & Bandages',
      allergyAdhesive: 'Adhesive Tape / Sticky Plasters',
      allergyPenicillin: 'Penicillin / Amoxicillin Antibiotics',
      allergyAspirin: 'Aspirin / NSAID Pain Relievers',
      diabeticTitle: 'Diabetic Foot & Delayed Healing Mode',
      diabeticBadge: 'Chronic Care Protocol',
      diabeticDesc: 'Enables high-alert monitoring for microvascular complications, peripheral neuropathy, and slow wound healing.',
      diabeticToggle: 'Activate Diabetic Healing Protocol',
      pediatricTitle: 'Age-Specific Dose & Triage Mode',
      adultMode: 'Adult Mode',
      childMode: 'Pediatric Mode (<18 Years)',
      contactsTitle: 'Designated Caretaker Emergency Contacts',
      contactNamePlaceholder: 'Caretaker / ASHA Worker Name',
      contactPhonePlaceholder: 'Mobile Phone Number',
      contactRelationPlaceholder: 'Relation (e.g. ASHA Worker, Family)',
      btnAddContact: 'Add Contact',
      noContacts: 'No emergency contacts registered. Add local ASHA or family members for instant SOS alerts.'
    },
    hi: {
      badge: 'चिकित्सीय सुरक्षा व व्यक्तिगत प्राथमिकताएं',
      title: 'रोगी मेडिकल प्रोफ़ाइल व सुरक्षा गाइड',
      allergyTitle: 'एलर्जी-सुरक्षित प्राथमिक उपचार फिल्टर',
      allergyBadge: 'स्वचालित एलर्जी फिल्टर',
      allergyDesc: 'उन दवाओं और सामग्रियों को चुनें जिनसे आपको एलर्जी है। एआई स्वचालित रूप से उपचार सूची से इन हानिकारक पदार्थों को हटा देगा।',
      allergyIodine: 'पोवीडोन-आयोडीन / बीटाडीन एंटीसेप्टिक',
      allergyLatex: 'लेटेक्स दस्ताने और पट्टियां',
      allergyAdhesive: 'चिपकने वाली टेप / प्लास्टर',
      allergyPenicillin: 'पेनिसिलिन / एमोक्सीसिलिन एंटीबायोटिक्स',
      allergyAspirin: 'एस्पिरिन / दर्द निवारक दवाएं',
      diabeticTitle: 'मधुमेह (डायबिटीज) व घाव देखभाल मोड',
      diabeticBadge: 'विशेष सुरक्षा प्रोटोकॉल',
      diabeticDesc: 'मधुमेह रोगियों में घाव भरने की गति धीमी होती है। यह मोड संक्रमण के शुरुआती संकेतों की विशेष निगरानी करता है।',
      diabeticToggle: 'डायबिटिक घाव सुरक्षा सक्रिय करें',
      pediatricTitle: 'आयु-विशिष्ट डोज व जांच मोड',
      adultMode: 'वयस्क मोड',
      childMode: 'बच्चे / बाल मोड (<18 वर्ष)',
      contactsTitle: 'आपातकालीन संपर्क व आशा कार्यकर्ता सूची',
      contactNamePlaceholder: 'आशा कार्यकर्ता या परिजन का नाम',
      contactPhonePlaceholder: 'मोबाइल नंबर',
      contactRelationPlaceholder: 'संबंध (जैसे आशा कार्यकर्ता, परिवार)',
      btnAddContact: 'संपर्क जोड़ें',
      noContacts: 'कोई आपातकालीन संपर्क नहीं जुड़ा है। तत्काल एसएमएस अलर्ट के लिए आशा कार्यकर्ता का नंबर जोड़ें।'
    },
    ta: {
      badge: 'மருத்துவ பாதுகாப்பு வழிகாட்டுதல்',
      title: 'நோயாளி மருத்துவ சுயவிவரம் மற்றும் பாதுகாப்பு',
      allergyTitle: 'ஒவ்வாமை (Allergy) பாதுகாப்பு வடிகட்டி',
      allergyBadge: 'தானியங்கி பாதுகாப்பு',
      allergyDesc: 'உங்களுக்கு ஒவ்வாமை உள்ள மருந்துகள் மற்றும் பொருட்களை தேர்ந்தெடுக்கவும். AI தானாகவே அவற்றை முதலுதவி பரிந்துரைகளில் இருந்து நீக்கும்.',
      allergyIodine: 'போவிடோன் அயோடின் / பெட்டாடின்',
      allergyLatex: 'லேடெக்ஸ் கையுறைகள் மற்றும் கட்டுகள்',
      allergyAdhesive: 'பிளாஸ்டர் ஒட்டு துணி',
      allergyPenicillin: 'பெனிசிலின் / அமோக்ஸிசிலின் மாத்திரைகள்',
      allergyAspirin: 'ஆஸ்பிரின் வலி நிவாரணி',
      diabeticTitle: 'சர்க்கரை நோய் (நீரிழிவு) பாதுகாப்பு முறை',
      diabeticBadge: 'நீரிழிவு சிறப்பு நெறிமுறை',
      diabeticDesc: 'சர்க்கரை நோயாளிகளுக்கு காயம் மெதுவாக குணமடையும் என்பதால், இந்த முறை தீவிர தொற்று தடுப்பு வழிமுறைகளை வழங்குகிறது.',
      diabeticToggle: 'சர்க்கரை நோய் பராமரிப்பு முறையை இயக்கு',
      pediatricTitle: 'வயதுக்கு ஏற்ற அளவு முறை',
      adultMode: 'பெரியவர் பிரிவு',
      childMode: 'குழந்தை பிரிவு (<18 வயது)',
      contactsTitle: 'அவசர கால தொடர்புகள் மற்றும் ஆஷா பணியாளர்கள்',
      contactNamePlaceholder: 'ஆஷா பணியாளர் அல்லது குடும்பத்தினர் பெயர்',
      contactPhonePlaceholder: 'கைபேசி எண்',
      contactRelationPlaceholder: 'உறவுமுறை (எ.கா. ஆஷா பணியாளர், குடும்பம்)',
      btnAddContact: 'தொடர்பை சேர்',
      noContacts: 'அவசர தொடர்புகள் எதுவும் சேர்க்கப்படவில்லை. அவசர உதவிக்காக எண்களை சேர்க்கவும்.'
    }
  };

  const t = dictionary[currentLang] || dictionary.en;

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    onAddContact({
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation || 'Family'
    });
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
  };

  return (
    <div id="patient-profile-tab" className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-3xl border shadow-xs flex flex-wrap items-center justify-between gap-4 ${
        highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xl border border-sky-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-sky-600 block">
              {t.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {t.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Allergy Safe First Aid Screen */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-xs ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-yellow-300">
                {t.allergyTitle}
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              {t.allergyBadge}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-yellow-400/80 leading-relaxed">
            {t.allergyDesc}
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: 'iodine', label: t.allergyIodine, checked: allergies.iodine },
              { id: 'latex', label: t.allergyLatex, checked: allergies.latex },
              { id: 'adhesiveBandages', label: t.allergyAdhesive, checked: allergies.adhesiveBandages },
              { id: 'penicillin', label: t.allergyPenicillin, checked: allergies.penicillin },
              { id: 'aspirin', label: t.allergyAspirin, checked: allergies.aspirin }
            ].map((item) => (
              <label
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  item.checked ? 'bg-red-50 border-red-300 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => onUpdateAllergies({ ...allergies, [item.id]: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Diabetic Mode & Patient Age Mode */}
        <div className="space-y-6">
          {/* Diabetic Mode Card */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xs ${
            highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-yellow-300">
                  {t.diabeticTitle}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full border border-rose-300">
                {t.diabeticBadge}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-yellow-400/80 leading-relaxed">
              {t.diabeticDesc}
            </p>

            <button
              onClick={() => onToggleDiabeticMode(!isDiabeticMode)}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                isDiabeticMode
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isDiabeticMode ? 'animate-pulse' : ''}`} />
              <span>{t.diabeticToggle}: {isDiabeticMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Age Group Mode Card */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xs ${
            highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-yellow-300">
              {t.pediatricTitle}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onTogglePatientMode('adult')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                  patientMode === 'adult'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t.adultMode}</span>
              </button>

              <button
                onClick={() => onTogglePatientMode('child')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                  patientMode === 'child'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>{t.childMode}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Emergency Contacts List */}
      <div className={`p-6 rounded-3xl border space-y-4 shadow-xs ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Phone className="w-5 h-5 text-emerald-600" />
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-yellow-300">
            {t.contactsTitle}
          </h3>
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleCreateContact} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder={t.contactNamePlaceholder}
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
          />
          <input
            type="tel"
            placeholder={t.contactPhonePlaceholder}
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
          />
          <input
            type="text"
            placeholder={t.contactRelationPlaceholder}
            value={newContactRelation}
            onChange={(e) => setNewContactRelation(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.btnAddContact}</span>
          </button>
        </form>

        {/* Contact list */}
        <div className="space-y-2 pt-2">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <strong className="text-xs font-bold text-slate-900 block">{contact.name}</strong>
                <span className="text-[11px] font-mono text-slate-500">{contact.phone} • {contact.relation}</span>
              </div>
              <button
                onClick={() => onDeleteContact(contact.id)}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {emergencyContacts.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">
              {t.noContacts}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
