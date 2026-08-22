import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Copy,
  Check,
  RefreshCw,
  X,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { FarmContextData, IMDWeatherAdvisory } from '../types';
import { fetchWeather } from '../services/api';

interface Props {
  farmContext: FarmContextData;
  selectedCrop: string | null;
  language: 'en' | 'kn';
  onUpdateContext?: (ctx: FarmContextData) => void;
  initialAdvisory?: IMDWeatherAdvisory | null;
  onClose?: () => void;
}

const DISTRICTS_AND_BLOCKS: Record<string, string[]> = {
  Shivamogga: ['Shivamogga', 'Bhadravathi', 'Hosanagara', 'Sagara', 'Shikaripura', 'Soraba', 'Thirthahalli'],
  Bagalkote: ['Bagalkote', 'Badami', 'Bilagi', 'Guledgudda', 'Hungund', 'Ilkal', 'Jamkhandi', 'Mudhol', 'Rabkavi Banhatti'],
  Ballari: ['Ballari', 'Kampli', 'Kurugodu', 'Sanduru', 'Siruguppa'],
  Belagavi: ['Belagavi', 'Athani', 'Bailhongal', 'Chikkodi', 'Gokak', 'Hukkeri', 'Kagawad', 'Khanapur', 'Kittur', 'Mudalgi', 'Nipani', 'Raibag', 'Ramdurg', 'Saundatti'],
  'Bengaluru Rural': ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala'],
  'Bengaluru Urban': ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal', 'Yelahanka'],
  Bidar: ['Bidar', 'Aurad', 'Bhalki', 'Basavakalyan', 'Chitguppa', 'Humnabad', 'Hulsoor', 'Kamalnagar'],
  Chamarajanagar: ['Chamarajanagar', 'Gundlupete', 'Kollegala', 'Hanur', 'Yelandur'],
  Chikkaballapura: ['Chikkaballapura', 'Bagepalli', 'Chintamani', 'Gauribidanur', 'Gudibanda', 'Sidlaghatta'],
  Chikkamagaluru: ['Chikkamagaluru', 'Kadur', 'Koppa', 'Mudigere', 'Narasimharajapura', 'Sringeri', 'Tarikere', 'Ajjampura'],
  Chitradurga: ['Chitradurga', 'Challakere', 'Hiriyur', 'Holalkere', 'Hosadurga', 'Molakalmuru'],
  'Dakshina Kannada': ['Mangaluru', 'Bantwal', 'Belthangady', 'Puttur', 'Sullia', 'Kadaba', 'Moodabidri'],
  Davanagere: ['Davanagere', 'Channagiri', 'Harihara', 'Honnali', 'Jagalur', 'Nyamathi'],
  Dharwad: ['Dharwad', 'Alnavar', 'Annigeri', 'Hubballi Rural', 'Hubballi Urban', 'Kalghatgi', 'Kundgol', 'Navalgund'],
  Gadag: ['Gadag', 'Gajendragad', 'Lakshmeshwar', 'Mundargi', 'Nargund', 'Ron', 'Shirahatti'],
  Hassan: ['Hassan', 'Alur', 'Arkalgud', 'Arsikere', 'Belur', 'Channarayapatna', 'Holenarasipura', 'Sakleshpur'],
  Haveri: ['Haveri', 'Byadgi', 'Hangal', 'Hirekerur', 'Ranebennur', 'Rattihalli', 'Savanur', 'Shiggaon'],
  Kalaburagi: ['Kalaburagi', 'Afzalpur', 'Aland', 'Chincholi', 'Chittapur', 'Jevargi', 'Kamalapur', 'Sedam', 'Shahabad', 'Yedrami'],
  Kodagu: ['Madikeri', 'Somwarpet', 'Virajpet', 'Kushalnagar', 'Ponnampet'],
  Kolar: ['Kolar', 'Bangarapet', 'KGF', 'Malur', 'Mulbagal', 'Srinivaspur'],
  Koppal: ['Koppal', 'Gangavathi', 'Kushtagi', 'Yelburga', 'Kanakagiri', 'Karatagi', 'Kukanoor'],
  Mandya: ['Mandya', 'Krishnarajpet', 'Maddur', 'Malavalli', 'Nagamangala', 'Pandavapura', 'Srirangapatna'],
  Mysuru: ['Mysuru', 'Hunsur', 'KR Nagar', 'Nanjangud', 'Piriyapatna', 'Saragur', 'T. Narasipura', 'HD Kote'],
  Raichur: ['Raichur', 'Devadurga', 'Lingsugur', 'Manvi', 'Maski', 'Sindhanur', 'Sirwar'],
  Ramanagara: ['Ramanagara', 'Channapatna', 'Harohalli', 'Kanakapura', 'Magadi'],
  Tumakuru: ['Tumakuru', 'Chikkanayakanahalli', 'Gubbi', 'Koratagere', 'Kunigal', 'Madhugiri', 'Pavagada', 'Sira', 'Tiptur', 'Turuvekere'],
  Udupi: ['Udupi', 'Brahmavara', 'Byndoor', 'Karkala', 'Kaup', 'Kundapura', 'Hebri'],
  'Uttara Kannada': ['Karwar', 'Ankola', 'Bhatkal', 'Haliyal', 'Honnavar', 'Joida', 'Kumta', 'Mundgod', 'Siddapur', 'Sirsi', 'Yellapur'],
  Vijayanagara: ['Hosapete', 'Harapanahalli', 'Hagaribommanahalli', 'Hoovina Hadagali', 'Kotturu', 'Kudligi'],
  Vijayapura: ['Vijayapura', 'Almatti', 'Babaleshwar', 'Basavana Bagewadi', 'Chadchan', 'Devara Hipparagi', 'Indi', 'Kolhar', 'Muddebihal', 'Nidagundi', 'Sindagi', 'Talikote', 'Tikota'],
  Yadgir: ['Yadgir', 'Gurmitkal', 'Hunsagi', 'Shahapur', 'Shorapur', 'Vadagera'],
};

/**
 * Highlights agricultural values, metrics, dosages, temperatures, and timings with sharp badge colors
 */
function highlightWeatherMetrics(text: string): string {
  if (!text) return '';

  let formatted = text;

  // 1. Bold Markdown (**...**) -> Sharp green badge
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold text-[#166534] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0] inline-block my-0.5">$1</strong>'
  );

  // 2. Temperatures (e.g. 30.8°C–31.4°C or 22.8°C)
  formatted = formatted.replace(
    /(\d+(?:\.\d+)?\s*°C(?:\s*[–-]\s*\d+(?:\.\d+)?\s*°C)?)/g,
    '<span class="font-extrabold text-[#C2410C] bg-[#FFF7ED] px-1.5 py-0.5 rounded border border-[#FED7AA] inline-block my-0.5">$1</span>'
  );

  // 3. Rainfall amounts (e.g. 2.8 mm or 34.6 mm)
  formatted = formatted.replace(
    /(\d+(?:\.\d+)?\s*mm(?:\s*മಳೆ|\s*rain|\s*rainfall)?)/gi,
    '<span class="font-extrabold text-[#1E3A5F] bg-[#EEF5FC] px-1.5 py-0.5 rounded border border-[#BDDDFC] inline-block my-0.5">$1</span>'
  );

  // 4. Relative humidity (e.g. 76%–86% or 81%)
  formatted = formatted.replace(
    /(\d+(?:\.\d+)?%(?:\s*[–-]\s*\d+(?:\.\d+)?%)?)/g,
    '<span class="font-extrabold text-[#0369A1] bg-[#F0F9FF] px-1.5 py-0.5 rounded border border-[#BAE6FD] inline-block my-0.5">$1</span>'
  );

  // 5. Wind speeds (e.g. 8 to 26 km/h or <8-10 km/h)
  formatted = formatted.replace(
    /(<?\s*\d+\s*(?:to|–|-)\s*\d+\s*km\/h|<?\s*\d+\s*km\/h)/gi,
    '<span class="font-extrabold text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#CBD5E1] inline-block my-0.5">$1</span>'
  );

  // 6. Time windows (e.g. 6:30–9:00 AM or 4:30–6:30 PM)
  formatted = formatted.replace(
    /(\d{1,2}:\d{2}\s*(?:AM|PM)\s*[–-]\s*\d{1,2}:\d{2}\s*(?:AM|PM)|\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\s*(?:AM|PM))/gi,
    '<span class="font-extrabold text-[#9A3412] bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FDE68A] inline-block my-0.5">$1</span>'
  );

  return formatted;
}

export const WeatherInfoBox: React.FC<Props> = ({
  farmContext,
  selectedCrop,
  language,
  onUpdateContext,
  initialAdvisory,
  onClose,
}) => {
  const [advisory, setAdvisory] = useState<IMDWeatherAdvisory | null>(initialAdvisory || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialAdvisory);
  const [copiedCropSMS, setCopiedCropSMS] = useState<boolean>(false);
  const [copiedGenSMS, setCopiedGenSMS] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'table' | 'advisory' | 'sms'>('advisory');

  const district = farmContext.district || 'Chitradurga';
  const block = farmContext.block || 'Challakere';
  const blocks = DISTRICTS_AND_BLOCKS[district] || [district];

  const loadWeather = async (dist: string, blk: string) => {
    setIsLoading(true);
    try {
      const data = await fetchWeather(dist, blk, selectedCrop || 'Groundnut', language);
      setAdvisory(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(district, block);
  }, [district, block, selectedCrop, language]);

  const handleDistrictChange = (newDist: string) => {
    const newBlocks = DISTRICTS_AND_BLOCKS[newDist] || [newDist];
    const newBlock = newBlocks[0];
    if (onUpdateContext) {
      onUpdateContext({
        ...farmContext,
        district: newDist,
        block: newBlock,
        region: newDist,
      });
    }
    loadWeather(newDist, newBlock);
  };

  const handleBlockChange = (newBlock: string) => {
    if (onUpdateContext) {
      onUpdateContext({
        ...farmContext,
        block: newBlock,
      });
    }
    loadWeather(district, newBlock);
  };

  const handleCopySMS = (text: string, type: 'crop' | 'general') => {
    navigator.clipboard.writeText(text);
    if (type === 'crop') {
      setCopiedCropSMS(true);
      setTimeout(() => setCopiedCropSMS(false), 2000);
    } else {
      setCopiedGenSMS(true);
      setTimeout(() => setCopiedGenSMS(false), 2000);
    }
  };

  // Helper metrics computation for Summary Key Metrics Cards
  const records = advisory?.records || [];
  const totalRain = records.reduce((sum, r) => sum + r.rainfallMm, 0).toFixed(1);
  const maxTempMax = records.length ? Math.max(...records.map((r) => r.tempMaxC)) : 31.4;
  const minTempMin = records.length ? Math.min(...records.map((r) => r.tempMinC)) : 22.8;
  const avgRhMorn = records.length ? Math.round(records.reduce((sum, r) => sum + r.rhMorningPct, 0) / records.length) : 81;
  const avgRhEve = records.length ? Math.round(records.reduce((sum, r) => sum + r.rhAfternoonPct, 0) / records.length) : 47;
  const maxWind = records.length ? Math.max(...records.map((r) => r.windSpeedKmh)) : 26;
  const windDir = records[0]?.windDirection || 'W';
  const avgCloud = records.length ? Math.round(records.reduce((sum, r) => sum + r.cloudCoverOcta, 0) / records.length) : 6;

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] border-l border-[#DDD4C4] text-[#000000] overflow-hidden font-report">
      {/* ─── Top Header (Sharp & Professional) ────────────────────── */}
      <div className="p-3.5 border-b border-[#DDD4C4] bg-[#F7F3E9] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] text-[#1E3A5F] border border-[#CBD5E1] flex items-center justify-center font-bold text-base shadow-sm">
            🌦️
          </div>
          <div>
            <h2 className="font-black text-xs sm:text-[13px] text-[#000000] flex items-center gap-1.5 tracking-tight">
              <span>{language === 'kn' ? 'ಐಎಂಡಿ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ' : 'IMD Agromet Weather'}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1E3A5F] text-[#FFFFFF] font-extrabold tracking-wider uppercase">
                LIVE 5-DAY
              </span>
            </h2>
            <p className="text-[11px] text-[#334155] font-bold flex items-center gap-1 mt-0.5">
              <span>📍 {advisory ? `${advisory.district.toUpperCase()} (${advisory.block.toUpperCase()})` : 'Karnataka Meteorological Centre'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => loadWeather(district, block)}
            className="p-1.5 rounded-lg text-[#334155] hover:text-black hover:bg-[#FFFFFF] transition-colors cursor-pointer border border-transparent hover:border-[#DDD4C4]"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1E3A5F]' : ''}`} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#334155] hover:text-black hover:bg-[#FFFFFF] transition-colors cursor-pointer border border-transparent hover:border-[#DDD4C4]"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Quick District & Block Pickers ─────────────────────────── */}
      <div className="p-3 bg-[#FAF6EE] border-b border-[#DDD4C4] grid grid-cols-2 gap-2 text-xs shrink-0">
        <div>
          <label className="text-[10px] font-black text-[#1E293B] uppercase tracking-wide block mb-1">
            📍 {language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District'}
          </label>
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#000000] font-black focus:outline-none focus:border-[#1E3A5F] shadow-xs"
          >
            {Object.keys(DISTRICTS_AND_BLOCKS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-[#1E293B] uppercase tracking-wide block mb-1">
            🏛️ {language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk / Block'}
          </label>
          <select
            value={block}
            onChange={(e) => handleBlockChange(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#000000] font-black focus:outline-none focus:border-[#1E3A5F] shadow-xs"
          >
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Tabs Filter (Advisories, Table, SMS) ───────────────────── */}
      <div className="flex border-b border-[#DDD4C4] bg-[#F2EDE2] px-3 pt-2 gap-1.5 shrink-0 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('advisory')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 text-[11px] cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-[#FFFFFF] text-[#166534] border-t-2 border-t-[#166534] border-x border-[#DDD4C4] font-black shadow-sm'
              : 'text-[#475569] hover:text-black'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
          <span>{language === 'kn' ? 'ಕೃಷಿ ಸಲಹೆಗಳು & ಸಾರಾಂಶ' : 'Advisories & Summary'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 text-[11px] cursor-pointer ${
            activeTab === 'table'
              ? 'bg-[#FFFFFF] text-[#1E3A5F] border-t-2 border-t-[#1E3A5F] border-x border-[#DDD4C4] font-black shadow-sm'
              : 'text-[#475569] hover:text-black'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
          <span>{language === 'kn' ? '೫-ದಿನಗಳ ಕೋಷ್ಟಕ' : '5-Day Table'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sms')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 text-[11px] cursor-pointer ${
            activeTab === 'sms'
              ? 'bg-[#FFFFFF] text-[#9A3412] border-t-2 border-t-[#9A3412] border-x border-[#DDD4C4] font-black shadow-sm'
              : 'text-[#475569] hover:text-black'
          }`}
        >
          <Copy className="w-3.5 h-3.5 text-[#9A3412]" />
          <span>{language === 'kn' ? 'ಎಸ್ಎಂಎಸ್ ಸಂದೇಶ' : 'SMS Alerts'}</span>
        </button>
      </div>

      {/* ─── Main Content Scroll Area ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar bg-[#FDFBF7]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#334155] space-y-2.5">
            <RefreshCw className="w-7 h-7 animate-spin text-[#1E3A5F]" />
            <span className="text-xs font-black text-[#000000]">
              {language === 'kn' ? 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading IMD Agromet Advisory...'}
            </span>
          </div>
        ) : advisory ? (
          <>
            {/* ══════════════════════════════════════════════════════════
                TAB 1: Advisories & Summary View (Pointwise, Sharp, Highlighted)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'advisory' && (
              <div className="space-y-3.5 text-xs">
                {/* ─── ೧. Weather Forecast Summary (Pointwise Metric Cards + Concise Text) ─── */}
                <div className="p-3.5 rounded-xl bg-[#F0F6FD] border-2 border-[#88BDF2] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#BED8F7] pb-1.5">
                    <h3 className="font-black text-[12.5px] text-[#000000] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-black">
                        ೧
                      </span>
                      <span>{language === 'kn' ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಸಾರಾಂಶ (ಐಎಂಡಿ ಬೆಂಗಳೂರು)' : 'Weather Forecast Summary (IMD Bengaluru)'}</span>
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#1E3A5F] border border-[#BED8F7]">
                      {advisory.records[0]?.date} – {advisory.records[advisory.records.length - 1]?.date}
                    </span>
                  </div>

                  {/* 4 Pointwise Key Metrics Chips */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#BED8F7] flex items-start gap-2 shadow-xs">
                      <CloudRain className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9.5px] font-bold text-[#475569] block uppercase">
                          {language === 'kn' ? 'ಒಟ್ಟು ಮಳೆ' : 'Rainfall Outlook'}
                        </span>
                        <span className="font-extrabold text-[#000000]">
                          {parseFloat(totalRain) > 0 ? (
                            <span className="text-[#1E3A5F] font-black">{totalRain} mm (Light Rain)</span>
                          ) : (
                            <span className="text-[#166534] font-black">Dry & Sunny</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#BED8F7] flex items-start gap-2 shadow-xs">
                      <Thermometer className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9.5px] font-bold text-[#475569] block uppercase">
                          {language === 'kn' ? 'ತಾಪಮಾನ' : 'Day / Night Temp'}
                        </span>
                        <span className="font-extrabold text-[#000000]">
                          <span className="text-[#C2410C] font-black">{maxTempMax}°C</span> / <span className="text-[#0369A1] font-black">{minTempMin}°C</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#BED8F7] flex items-start gap-2 shadow-xs">
                      <Droplets className="w-4 h-4 text-[#0369A1] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9.5px] font-bold text-[#475569] block uppercase">
                          {language === 'kn' ? 'ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ' : 'Morning / Eve RH'}
                        </span>
                        <span className="font-extrabold text-[#000000]">
                          <span className="text-[#0369A1] font-black">{avgRhMorn}%</span> / <span className="text-[#475569] font-black">{avgRhEve}%</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#BED8F7] flex items-start gap-2 shadow-xs">
                      <Wind className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9.5px] font-bold text-[#475569] block uppercase">
                          {language === 'kn' ? 'ಗಾಳಿ & ಮೋಡ' : 'Wind & Cloud'}
                        </span>
                        <span className="font-extrabold text-[#000000]">
                          <span className="text-[#475569] font-black">8–{maxWind} km/h</span> ({windDir}) • {avgCloud}/8
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Concise summary text with full justification */}
                  <div
                    className="text-[11.5px] text-[#000000] font-normal leading-[1.48] text-justify-report pt-1"
                    dangerouslySetInnerHTML={{
                      __html: highlightWeatherMetrics(advisory.summary150to200Words),
                    }}
                  />
                </div>

                {/* ─── ೨. Likely Impacts & Associated Agromet Advisories (Pointwise Cards) ─── */}
                <div className="p-3.5 rounded-xl bg-[#F4F9F0] border-2 border-[#A3C78B] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#C2DDB0] pb-1.5">
                    <h3 className="font-black text-[12.5px] text-[#000000] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-black">
                        ೨
                      </span>
                      <span>{language === 'kn' ? 'ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆಗಳು' : 'Likely Impacts & Associated Agromet Advisories'}</span>
                    </h3>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#166534] border border-[#C2DDB0]">
                      5 POINT ADVISORY
                    </span>
                  </div>

                  <div className="space-y-2">
                    {advisory.impactsAdvisories5Points.map((point, idx) => {
                      // Distinct icon for each advisory card
                      const icons = ['🌾', '🍅', '🐄', '🧪', '🛡️'];
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#C2DDB0] flex items-start gap-2 shadow-xs hover:border-[#166534] transition-colors"
                        >
                          <span className="text-sm shrink-0 mt-0.5">{icons[idx % icons.length]}</span>
                          <div
                            className="text-[11.5px] text-[#000000] font-normal leading-[1.48] text-justify-report flex-1"
                            dangerouslySetInnerHTML={{
                              __html: highlightWeatherMetrics(point),
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── ೪. Likely Impacts of Weather Warnings (General) (Pointwise Amber Card) ─── */}
                <div className="p-3.5 rounded-xl bg-[#FFFBF2] border-2 border-[#FCD34D] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#FDE68A] pb-1.5">
                    <h3 className="font-black text-[12.5px] text-[#000000] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center text-[10px] font-black">
                        ೪
                      </span>
                      <span>{language === 'kn' ? 'ಸಾಮಾನ್ಯ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಪರಿಣಾಮಗಳು' : 'Likely Impacts of Weather Warnings (General)'}</span>
                    </h3>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#B45309] border border-[#FDE68A]">
                      GENERAL ALERTS
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {advisory.generalImpacts3Points.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#FFFFFF] border border-[#FDE68A] flex items-start gap-2 shadow-xs"
                      >
                        <span className="text-xs font-black text-[#D97706] mt-0.5">•</span>
                        <div
                          className="text-[11.5px] text-[#000000] font-normal leading-[1.48] text-justify-report flex-1"
                          dangerouslySetInnerHTML={{
                            __html: highlightWeatherMetrics(point),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 2: 5-Day Table View (Clean, High-Contrast Matrix)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'table' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[11.5px] text-[#000000] font-black px-1">
                  <span>{language === 'kn' ? '📅 ೫-ದಿನಗಳ ಮುನ್ಸೂಚನೆ ಕೋಷ್ಟಕ' : '📅 5-Day Forecast Matrix Table'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F6FD] text-[#1E3A5F] border border-[#BED8F7]">
                    {language === 'kn' ? 'ಐಎಂಡಿ ಬೆಂಗಳೂರು' : 'IMD Bengaluru'}
                  </span>
                </div>

                {/* Day-by-day weather cards */}
                <div className="space-y-2">
                  {advisory.records.map((r, i) => (
                    <div
                      key={r.date + i}
                      className="p-2.5 rounded-xl bg-[#FFFFFF] border-2 border-[#CBD5E1] hover:border-[#1E3A5F] transition-colors space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#000000] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                          {r.date}
                        </span>
                        {r.warning ? (
                          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] font-black">
                            ⚠️ {r.warning.split('–')[0].trim()}
                          </span>
                        ) : (
                          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#166534] border border-[#A7F3D0] font-bold">
                            {r.rainfallMm > 0
                              ? language === 'kn' ? '🌧️ ಲಘು ಮಳೆ' : '🌧️ Light Rain'
                              : language === 'kn' ? '☀️ ಒಣ ಹವೆ' : '☀️ Dry & Clear'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                        <div className="bg-[#FFF7ED] border border-[#FED7AA] p-1.5 rounded-lg flex flex-col items-center shadow-xs">
                          <span className="text-[9px] text-[#C2410C] flex items-center gap-0.5 font-bold uppercase">
                            <Thermometer className="w-2.5 h-2.5 text-[#C2410C]" /> {language === 'kn' ? 'ತಾಪಮಾನ' : 'Temp'}
                          </span>
                          <span className="font-black text-[#000000] mt-0.5">
                            {r.tempMaxC}° / {r.tempMinC}°
                          </span>
                        </div>

                        <div className="bg-[#EEF5FC] border border-[#BDDDFC] p-1.5 rounded-lg flex flex-col items-center shadow-xs">
                          <span className="text-[9px] text-[#1E3A5F] flex items-center gap-0.5 font-bold uppercase">
                            <CloudRain className="w-2.5 h-2.5 text-[#1E3A5F]" /> {language === 'kn' ? 'ಮಳೆ' : 'Rain'}
                          </span>
                          <span className="font-black text-[#1E3A5F] mt-0.5">{r.rainfallMm} mm</span>
                        </div>

                        <div className="bg-[#F0F9FF] border border-[#BAE6FD] p-1.5 rounded-lg flex flex-col items-center shadow-xs">
                          <span className="text-[9px] text-[#0369A1] flex items-center gap-0.5 font-bold uppercase">
                            <Droplets className="w-2.5 h-2.5 text-[#0369A1]" /> {language === 'kn' ? 'ಆರ್ದ್ರತೆ' : 'RH M/E'}
                          </span>
                          <span className="font-black text-[#0369A1] mt-0.5">
                            {r.rhMorningPct}% / {r.rhAfternoonPct}%
                          </span>
                        </div>

                        <div className="bg-[#F1F5F9] border border-[#CBD5E1] p-1.5 rounded-lg flex flex-col items-center shadow-xs">
                          <span className="text-[9px] text-[#475569] flex items-center gap-0.5 font-bold uppercase">
                            <Wind className="w-2.5 h-2.5 text-[#475569]" /> {language === 'kn' ? 'ಗಾಳಿ' : 'Wind'}
                          </span>
                          <span className="font-black text-[#000000] mt-0.5">
                            {r.windSpeedKmh}k {r.windDirection}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Responsive Matrix Table */}
                <div className="p-3 rounded-xl bg-[#FFFFFF] border-2 border-[#CBD5E1] text-[11px] leading-relaxed max-w-full overflow-hidden shadow-xs">
                  <span className="font-black text-xs text-[#000000] block mb-2">
                    📋 {language === 'kn' ? '೫ ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಪಟ್ಟಿ' : '5-Day Forecast Matrix Table'}
                  </span>
                  <div className="overflow-x-auto max-w-full rounded-lg border border-[#CBD5E1] custom-scrollbar">
                    <table className="min-w-full divide-y divide-[#CBD5E1] text-[10.5px]">
                      <thead className="bg-[#F1F5F9] text-[#000000] font-black">
                        <tr>
                          <th className="px-2.5 py-1.5 text-left whitespace-nowrap">{language === 'kn' ? 'ದಿನಾಂಕ' : 'Date'}</th>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">{language === 'kn' ? 'ತಾಪಮಾನ' : 'Temp (Max/Min)'}</th>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">{language === 'kn' ? 'ಮಳೆ' : 'Rain'}</th>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">{language === 'kn' ? 'ಆರ್ದ್ರತೆ' : 'RH (M/E)'}</th>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">{language === 'kn' ? 'ಗಾಳಿ' : 'Wind'}</th>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">{language === 'kn' ? 'ಮೋಡ' : 'Cloud'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] text-[#000000]">
                        {advisory.records.map((r, i) => (
                          <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-2.5 py-1.5 font-black whitespace-nowrap">{r.date}</td>
                            <td className="px-2 py-1.5 text-center whitespace-nowrap font-black text-[#000000]">
                              {r.tempMaxC}° / {r.tempMinC}°
                            </td>
                            <td className="px-2 py-1.5 text-center font-black text-[#1E3A5F] whitespace-nowrap">
                              {r.rainfallMm} mm
                            </td>
                            <td className="px-2 py-1.5 text-center whitespace-nowrap font-bold text-[#0369A1]">
                              {r.rhMorningPct}% / {r.rhAfternoonPct}%
                            </td>
                            <td className="px-2 py-1.5 text-center whitespace-nowrap font-bold text-[#475569]">
                              {r.windSpeedKmh}k {r.windDirection}
                            </td>
                            <td className="px-2 py-1.5 text-center whitespace-nowrap font-bold text-[#475569]">
                              {r.cloudCoverOcta}/8
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 3: SMS Alerts View (Crisp Copyable Cards)
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'sms' && (
              <div className="space-y-3.5 text-xs">
                {/* 3. Crop & Farm SMS Alert */}
                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border-2 border-[#86EFAC] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#000000] flex items-center gap-1.5">
                      📱 {language === 'kn' ? '೩. ಕೃಷಿ ಎಸ್ಎಂಎಸ್ ಎಚ್ಚರಿಕೆ' : '3. Impact-Based SMS Alert (Crop & Farm)'}
                    </span>
                    <span className="text-[10px] text-[#166534] font-mono font-bold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#86EFAC]">
                      {advisory.smsAdvisory160Chars.length}/160 {language === 'kn' ? 'ಅಕ್ಷರಗಳು' : 'chars'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#86EFAC] font-mono text-[11.5px] text-[#000000] font-black leading-relaxed break-words shadow-xs">
                    {advisory.smsAdvisory160Chars}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySMS(advisory.smsAdvisory160Chars, 'crop')}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-[#FFFFFF] font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedCropSMS ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>
                      {copiedCropSMS
                        ? language === 'kn' ? 'ನಕಲಿಸಲಾಗಿದೆ!' : 'Copied to Clipboard!'
                        : language === 'kn' ? 'ಬೆಳೆ ಎಸ್ಎಂಎಸ್ ನಕಲಿಸಿ (160 ಅಕ್ಷರ)' : 'Copy Crop SMS (160 Chars)'}
                    </span>
                  </button>
                </div>

                {/* 5. General Farm SMS Alert */}
                <div className="p-3.5 rounded-xl bg-[#F0F6FD] border-2 border-[#88BDF2] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#000000] flex items-center gap-1.5">
                      📱 {language === 'kn' ? '೫. ಸಾಮಾನ್ಯ ಎಸ್ಎಂಎಸ್ ಸಂದೇಶ' : '5. Impact-Based SMS Alert (General)'}
                    </span>
                    <span className="text-[10px] text-[#1E3A5F] font-mono font-bold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#88BDF2]">
                      {advisory.generalSms160Chars.length}/160 {language === 'kn' ? 'ಅಕ್ಷರಗಳು' : 'chars'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#88BDF2] font-mono text-[11.5px] text-[#000000] font-black leading-relaxed break-words shadow-xs">
                    {advisory.generalSms160Chars}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySMS(advisory.generalSms160Chars, 'general')}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#1E3A5F] hover:bg-[#152840] text-[#FFFFFF] font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedGenSMS ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>
                      {copiedGenSMS
                        ? language === 'kn' ? 'ನಕಲಿಸಲಾಗಿದೆ!' : 'Copied to Clipboard!'
                        : language === 'kn' ? 'ಸಾಮಾನ್ಯ ಎಸ್ಎಂಎಸ್ ನಕಲಿಸಿ' : 'Copy General SMS'}
                    </span>
                  </button>
                </div>

                {/* IMD Source Citation Notice */}
                <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#CBD5E1] text-[10.5px] text-[#000000] leading-normal font-medium shadow-xs">
                  📌 <strong className="font-black text-[#1E3A5F]">{language === 'kn' ? 'ಅಧಿಕೃತ ಮೂಲ:' : 'Authority:'}</strong>{' '}
                  {language === 'kn'
                    ? 'ಕೃಷಿ ಹವಾಮಾನ ಕ್ಷೇತ್ರ ಘಟಕ (AMFU), ಪ್ರಾದೇಶಿಕ ಹವಾಮಾನ ಕೇಂದ್ರ ಬೆಂಗಳೂರು ಮತ್ತು ಐಎಂಡಿ ನವದೆಹಲಿ. ಕರ್ನಾಟಕ ಕೃಷಿ-ಹವಾಮಾನ ವಲಯಗಳಿಗಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.'
                    : 'Agrometeorological Field Unit (AMFU), Meteorological Centre Bengaluru & IMD New Delhi. Updated for Karnataka Agro-climatic zones.'}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-xs text-[#000000] font-bold">
            {language === 'kn'
              ? `${district} ಜಿಲ್ಲೆಗೆ ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.`
              : `No weather records available for ${district}.`}
          </div>
        )}
      </div>
    </div>
  );
};
