import React, { useState, useEffect } from 'react';
import { CaseRecord, Language, BodyRegion } from '../types';
import { InteractiveBodyMap, extractCaseRegion, REGIONS_META } from './InteractiveBodyMap';
import { speakText, stopSpeech } from '../utils/speech';
import {
  Radio,
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  MapPin,
  User,
  FileText,
  Activity,
  HeartPulse,
  Sparkles,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';

interface CaseHistoryProps {
  cases: CaseRecord[];
  currentLang: Language;
  onDeleteCase: (id: string) => void;
  onClearAll: () => void;
  highContrast: boolean;
}

export const CaseHistory: React.FC<CaseHistoryProps> = ({
  cases,
  currentLang,
  onDeleteCase,
  onClearAll,
  highContrast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | 'all'>('all');
  const [playingCaseId, setPlayingCaseId] = useState<string | null>(null);

  // Stop speech when language switches or unmounts
  useEffect(() => {
    if (playingCaseId) {
      stopSpeech();
      setPlayingCaseId(null);
    }
    return () => {
      stopSpeech();
    };
  }, [currentLang]);

  const handleToggleCaseSpeech = (record: CaseRecord) => {
    if (playingCaseId === record.id) {
      stopSpeech();
      setPlayingCaseId(null);
    } else {
      stopSpeech();
      const summaryText = record.result.triageSummary[currentLang] || record.result.triageSummary.en;
      setPlayingCaseId(record.id);
      speakText(
        summaryText,
        currentLang,
        () => setPlayingCaseId(record.id),
        () => setPlayingCaseId(null)
      ).finally(() => {
        setPlayingCaseId((prev) => (prev === record.id ? null : prev));
      });
    }
  };

  const filteredCases = cases.filter((item) => {
    const matchesSearch =
      (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.woundType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || item.result.severity.toLowerCase() === severityFilter.toLowerCase();

    const caseRegion = extractCaseRegion(item);
    const matchesRegion =
      selectedRegion === 'all' || caseRegion === selectedRegion;

    return matchesSearch && matchesSeverity && matchesRegion;
  });

  // Export TXT / HTML Medical Summary
  const exportSummary = (record: CaseRecord) => {
    const region = extractCaseRegion(record);
    const regionName = REGIONS_META.find(r => r.id === region)?.name.en || region;

    const textContent = `=====================================================
WOUNDCARE-VLM CLINICAL TRIAGE REPORT
=====================================================
Case Record ID : ${record.id}
Date & Time    : ${new Date(record.timestamp).toLocaleString()}
Patient Name   : ${record.patientName || 'N/A'}
Body Region    : ${regionName}
Location / PHC : ${record.location || 'Rural Field Clinic'}

DIAGNOSIS & TRIAGE
-----------------------------------------------------
Wound Type     : ${record.result.woundType}
Severity Grade : ${record.result.severity}
Infection Risk : ${record.result.infectionRisk}
Dimensions     : ${record.result.measurement?.formattedText || record.result.affectedAreaEstimate}
Confidence     : ${record.result.confidenceScore}%
Model Engine   : ${record.result.modelEngineUsed}

CLINICAL SUMMARY
-----------------------------------------------------
${record.result.triageSummary.en}

FIRST AID STEPS
-----------------------------------------------------
${record.result.firstAidSteps.map((s) => `${s.stepNumber}. ${s.text.en}`).join('\n')}

CRITICAL WARNINGS
-----------------------------------------------------
${record.result.criticalWarnings.map((w) => `* ${w.en}`).join('\n')}

RECOMMENDED URGENCY
-----------------------------------------------------
${record.result.doctorVisitUrgency.en}
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WoundCare_Report_${record.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeRegionMeta = REGIONS_META.find(r => r.id === selectedRegion);

  return (
    <div className={`p-6 rounded-[28px] border space-y-6 ${
      highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-[#e2dfd5] text-[#2c2c2c] shadow-sm'
    }`}>
      
      {/* Top Bar with Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2dfd5] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#5A5A40]" />
            <h2 className="text-xl font-serif font-bold text-[#5A5A40]">
              {currentLang === 'hi' ? 'रोगी केस इतिहास और शारीरिक मानचित्र' : currentLang === 'ta' ? 'நோயாளி பதிவுகள் மற்றும் உடல் வரைபடம்' : 'Patient Case Logs & Anatomical Body Records'}
            </h2>
          </div>
          <p className="text-xs text-[#8e8b82] mt-0.5">
            Offline persistent clinical records mapped to specific anatomical body regions for rural triage.
          </p>
        </div>

        {cases.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all patient case logs?')) {
                onClearAll();
              }
            }}
            className="text-xs text-[#c62828] hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log History</span>
          </button>
        )}
      </div>

      {/* FEATURE: Interactive Body Map with Region Filtering */}
      <InteractiveBodyMap
        cases={cases}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        highContrast={highContrast}
        currentLang={currentLang}
      />

      {/* Search & Severity Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-[#8e8b82] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, wound type, village location, or anatomical notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fdfcfb] border border-[#e2dfd5] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8e8b82] shrink-0" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-[#fdfcfb] border border-[#e2dfd5] rounded-full px-3 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5A5A40] cursor-pointer font-medium"
          >
            <option value="all">All Severities</option>
            <option value="minor">Minor Only</option>
            <option value="moderate">Moderate Only</option>
            <option value="severe">Severe Only</option>
          </select>
        </div>
      </div>

      {/* Filter Status Badge */}
      {selectedRegion !== 'all' && (
        <div className="flex items-center justify-between bg-[#f5f7f2] px-4 py-2.5 rounded-2xl border border-[#d8e0d0] text-xs">
          <span className="text-[#5A5A40] font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#5A5A40]" />
            Filtered by Body Region: <strong className="font-bold">{activeRegionMeta?.name[currentLang] || selectedRegion}</strong> ({filteredCases.length} records)
          </span>
          <button
            onClick={() => setSelectedRegion('all')}
            className="text-[11px] text-[#5A5A40] underline font-bold hover:text-black cursor-pointer"
          >
            Show All Regions
          </button>
        </div>
      )}

      {/* Cases List Grid */}
      {filteredCases.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-[#e2dfd5] bg-[#fdfcfb] text-[#8e8b82] space-y-2">
          <FileText className="w-10 h-10 text-[#c7c4b9] mx-auto" />
          <p className="text-base font-serif font-bold text-[#5A5A40]">No Patient Logs Found in Selected Region</p>
          <p className="text-xs text-[#8e8b82] max-w-md mx-auto">
            {cases.length === 0
              ? 'Perform a wound scan and click "Save Case Record" to log cases into the anatomical registry.'
              : selectedRegion !== 'all'
              ? `No wounds currently recorded on the ${activeRegionMeta?.name[currentLang] || selectedRegion}. Tap another body area on the mannequin or clear the region filter.`
              : 'No cases match your search term or severity criteria.'}
          </p>
          {selectedRegion !== 'all' && (
            <button
              onClick={() => setSelectedRegion('all')}
              className="mt-2 px-4 py-2 rounded-full bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4a4a34] cursor-pointer shadow-xs"
            >
              Reset Body Map Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((record) => {
            const region = extractCaseRegion(record);
            const regionMeta = REGIONS_META.find(r => r.id === region);

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl border bg-[#fdfcfb] border-[#e2dfd5] flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#5A5A40] transition"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={record.imageUrl}
                    alt={record.result.woundType}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover bg-[#f0ede4] shrink-0 border border-[#e2dfd5]"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          record.result.severity === 'Severe'
                            ? 'bg-[#c62828] text-white'
                            : record.result.severity === 'Moderate'
                            ? 'bg-[#f57f17] text-white'
                            : 'bg-[#2e7d32] text-white'
                        }`}>
                          {record.result.severity}
                        </span>

                        {/* Anatomical Region Pill Badge */}
                        <button
                          type="button"
                          onClick={() => setSelectedRegion(region)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2dfd5] text-[#5A5A40] hover:bg-[#d8d5cb] transition cursor-pointer flex items-center gap-1"
                          title="Filter to this body region"
                        >
                          <User className="w-2.5 h-2.5" />
                          <span>{regionMeta?.name[currentLang] || region}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-[#8e8b82] flex items-center gap-1 font-medium shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#2c2c2c] truncate">
                      {record.result.woundType} Wound
                    </h3>

                    <div className="space-y-0.5 text-xs text-[#8e8b82] mt-1">
                      {record.patientName && (
                        <div className="flex items-center gap-1 text-[#2c2c2c]">
                          <User className="w-3 h-3 text-[#5A5A40]" />
                          <span className="font-semibold">{record.patientName}</span>
                        </div>
                      )}
                      {record.location && (
                        <div className="flex items-center gap-1 text-[#8e8b82]">
                          <MapPin className="w-3 h-3 text-[#c62828]" />
                          <span>{record.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Triage Summary excerpt with TTS Read-Aloud Toggle */}
                <div className="bg-[#f0ede4] p-3 rounded-xl border border-[#e2dfd5] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#5A5A40]">
                    <span>Triage Summary ({currentLang === 'hi' ? 'हिन्दी' : currentLang === 'ta' ? 'தமிழ்' : 'English'})</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCaseSpeech(record)}
                      title={`Read summary aloud in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : 'English'}`}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        playingCaseId === record.id
                          ? 'bg-[#c62828] text-white animate-pulse'
                          : 'bg-white text-[#5A5A40] border border-[#d8d5cb] hover:bg-[#e2dfd5]'
                      }`}
                    >
                      {playingCaseId === record.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen (TTS)</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#2c2c2c] leading-relaxed">
                    {record.result.triageSummary[currentLang] || record.result.triageSummary.en}
                  </p>
                </div>

                {/* Record Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e2dfd5] text-xs">
                  <button
                    onClick={() => exportSummary(record)}
                    className="bg-[#f0ede4] hover:bg-[#e2dfd5] text-[#5A5A40] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer font-bold uppercase tracking-wider text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Export TXT Report</span>
                  </button>

                  <button
                    onClick={() => onDeleteCase(record.id)}
                    className="text-[#c62828] hover:opacity-80 p-1 cursor-pointer transition"
                    title="Delete case log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
