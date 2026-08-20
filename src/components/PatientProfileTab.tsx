import React from 'react';
import { UserCheck, ShieldAlert, Heart, Activity, Check, Plus, Trash2, Save, User } from 'lucide-react';
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
  currentLang: Language;
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
  currentLang,
  highContrast
}) => {
  const [newContactName, setNewContactName] = React.useState('');
  const [newContactPhone, setNewContactPhone] = React.useState('');
  const [newContactRelation, setNewContactRelation] = React.useState('');

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
      <div className="bg-[#5A5A40] text-white p-6 rounded-[28px] border border-[#4a4a34] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-[#fdfcf8] border border-white/20">
            <UserCheck className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-300 block">
              Clinical Safety & Personal Preferences
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">
              Patient Medical Profile & Safety Guardrails
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature 7: Allergy Safe First Aid Screen */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e2dfd5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e2dfd5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-[#2c2c2c]">
                Allergy Safe First-Aid Filter
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
              Auto-Filters First Aid
            </span>
          </div>

          <p className="text-xs text-[#626262] leading-relaxed">
            Select materials and medications you are allergic to. AI will automatically substitute or remove allergic items from first aid protocols and medicine suggestions.
          </p>

          <div className="space-y-2.5 pt-1">
            {[
              { id: 'iodine', label: 'Povidone-Iodine / Betadine Antiseptic', checked: allergies.iodine },
              { id: 'latex', label: 'Latex Gloves & Bandages', checked: allergies.latex },
              { id: 'adhesiveBandages', label: 'Adhesive Tape / Sticky Plasters', checked: allergies.adhesiveBandages },
              { id: 'penicillin', label: 'Penicillin / Amoxicillin Antibiotics', checked: allergies.penicillin },
              { id: 'aspirin', label: 'Aspirin / NSAID Pain Relievers', checked: allergies.aspirin }
            ].map((item) => (
              <label
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  item.checked ? 'bg-red-50 border-red-300 text-red-950 font-bold' : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#2c2c2c]'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => onUpdateAllergies({ ...allergies, [item.id]: e.target.checked })}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Feature 8: Diabetic Wound Special Mode */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e2dfd5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e2dfd5] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <h3 className="font-serif font-bold text-base text-[#2c2c2c]">
                Diabetic Wound Protocol Mode
              </h3>
            </div>
            
            <button
              onClick={() => onToggleDiabeticMode(!isDiabeticMode)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                isDiabeticMode
                  ? 'bg-red-600 text-white border-red-700 shadow animate-pulse'
                  : 'bg-[#f0ede4] text-[#5A5A40] border-[#e2dfd5]'
              }`}
            >
              {isDiabeticMode ? 'DIABETIC MODE ON' : 'ENABLE MODE'}
            </button>
          </div>

          <p className="text-xs text-[#626262] leading-relaxed">
            When enabled, AI automatically elevates severity scores for minor ulcers, enforces glycemic control target warnings (HbA1c &lt; 7%), and checks for silent peripheral neuropathy / ischemia risks.
          </p>

          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isDiabeticMode ? 'bg-red-50 border-red-300 text-red-900' : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#8e8b82]'
          }`}>
            <strong className="block uppercase font-bold text-[11px] tracking-wider text-red-800">
              Active Diabetic Safeguards:
            </strong>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stricter triage grading (Minor lesions elevated to Moderate/Severe).</li>
              <li>Monitors for neuropathy, loss of pain sensation, and neuropathic foot ulcers.</li>
              <li>Adds blood sugar targets (Fasting &lt; 110 mg/dL, Postprandial &lt; 140 mg/dL).</li>
            </ul>
          </div>

          {/* Pediatric vs Adult Mode Toggle */}
          <div className="pt-2 border-t border-[#e2dfd5] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] block">
              Patient Age Group Mode:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onTogglePatientMode('adult')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  patientMode === 'adult' ? 'bg-[#5A5A40] text-white border-[#4a4a34]' : 'bg-[#fdfcf8] text-[#2c2c2c] border-[#e2dfd5]'
                }`}
              >
                Adult Mode (18+ Yrs)
              </button>
              <button
                onClick={() => onTogglePatientMode('child')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  patientMode === 'child' ? 'bg-[#5A5A40] text-white border-[#4a4a34]' : 'bg-[#fdfcf8] text-[#2c2c2c] border-[#e2dfd5]'
                }`}
              >
                Pediatric Mode (&lt;18 Yrs)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Manager */}
      <div className="bg-white p-6 rounded-[28px] border border-[#e2dfd5] space-y-4 shadow-sm">
        <h3 className="font-serif font-bold text-base text-[#2c2c2c] flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          <span>Saved Emergency Contacts for Automatic SMS Caretaker Alerts</span>
        </h3>

        <form onSubmit={handleCreateContact} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="p-2.5 rounded-xl border border-[#e2dfd5] bg-[#fdfcf8] font-medium"
          />
          <input
            type="tel"
            placeholder="Phone Number (+91...)"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            className="p-2.5 rounded-xl border border-[#e2dfd5] bg-[#fdfcf8] font-medium"
          />
          <input
            type="text"
            placeholder="Relation (e.g. Spouse/Parent)"
            value={newContactRelation}
            onChange={(e) => setNewContactRelation(e.target.value)}
            className="p-2.5 rounded-xl border border-[#e2dfd5] bg-[#fdfcf8] font-medium"
          />
          <button
            type="submit"
            className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {emergencyContacts.map((c) => (
            <div key={c.id} className="p-3 bg-[#fdfcf8] rounded-xl border border-[#e2dfd5] flex items-center justify-between text-xs">
              <div>
                <strong className="text-[#2c2c2c] font-bold text-sm">{c.name}</strong>
                <span className="text-[#8e8b82] ml-2 font-mono">({c.relation}) • {c.phone}</span>
              </div>
              <button
                onClick={() => onDeleteContact(c.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
