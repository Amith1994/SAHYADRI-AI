import React from 'react';

interface Props {
  selectedCrop: string | null;
  language: 'en' | 'kn';
  onUpdateContext: (context: FarmContextData) => void;
}

export interface FarmContextData {
  district: string;
  block: string;
  region: string;
  season: string;
  variety: string;
  soil: string;
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

const VARIETIES: Record<string, { value: string; label: string }[]> = {
  groundnut: [
    { value: 'TMV-2', label: 'TMV-2 (Bunch, Popular in Karnataka)' },
    { value: 'GPBD-4', label: 'GPBD-4 (High Yield, Resistant)' },
    { value: 'Girnar-2', label: 'Girnar-2 (Bunch Type)' },
    { value: 'Kadiri-6', label: 'Kadiri-6 (Semi-Spreading)' },
    { value: 'JL-24', label: 'JL-24 (Phule Pragati, 100 Days)' },
    { value: 'TAG-24', label: 'TAG-24 (Summer Irrigated)' },
  ],
  rice: [
    { value: 'Jyothi', label: 'Jyothi (115 Days, Most Popular)' },
    { value: 'BPT-5204', label: 'BPT-5204 (Sona Masuri, High Quality)' },
    { value: 'Sindhu', label: 'Sindhu (Blast Tolerant)' },
    { value: 'IR-64', label: 'IR-64 (Semidwarf)' },
    { value: 'KRH-2', label: 'KRH-2 (Karnataka Hybrid Rice)' },
    { value: 'Intan', label: 'Intan (Rainfed / Upland)' },
  ],
  maize: [
    { value: 'NK-6240', label: 'NK-6240 (High Yield Hybrid)' },
    { value: 'CP-818', label: 'CP-818 (Kharif / Rabi Hybrid)' },
    { value: 'DKC-9108', label: 'DKC-9108 (High Density Hybrid)' },
    { value: 'Pioneer 30V92', label: 'Pioneer 30V92 (Stress Tolerant)' },
    { value: 'Nithyashree', label: 'Nithyashree (Open Pollinated OPV)' },
    { value: 'Kaveri KMH-3712', label: 'Kaveri KMH-3712 (Commercial)' },
  ],
  arecanut: [
    { value: 'Mangala', label: 'Mangala (CPCRI Semi-Tall, Early)' },
    { value: 'Sumangala', label: 'Sumangala (High Yielding CPCRI)' },
    { value: 'Sreemangala', label: 'Sreemangala (CPCRI Selection)' },
    { value: 'Mohitnagar', label: 'Mohitnagar (Humid Tropics/Malnad)' },
    { value: 'Shivamogga Local', label: 'Shivamogga Local (Traditional Malnad)' },
    { value: 'Sirsi Local', label: 'Sirsi Local (Uttara Kannada Selection)' },
  ],
};

export const FarmContextSelector: React.FC<Props> = ({
  selectedCrop,
  language,
  onUpdateContext,
}) => {
  const [district, setDistrict] = React.useState('Shivamogga');
  const [block, setBlock] = React.useState('Shivamogga');
  const [season, setSeason] = React.useState('Kharif (Monsoon)');
  const [variety, setVariety] = React.useState('TMV-2');
  const [soil, setSoil] = React.useState('Sandy Loam');
  const [savedToast, setSavedToast] = React.useState(false);

  const activeCrop = selectedCrop || 'groundnut';
  const cropVarieties = VARIETIES[activeCrop] || VARIETIES.groundnut;
  const blocks = DISTRICTS_AND_BLOCKS[district] || [district];

  React.useEffect(() => {
    if (cropVarieties.length > 0) {
      setVariety(cropVarieties[0].value);
    }
  }, [activeCrop]);

  React.useEffect(() => {
    if (blocks.length > 0) {
      setBlock(blocks[0]);
    }
  }, [district]);

  const handleUpdate = () => {
    const data: FarmContextData = {
      district,
      block,
      region: district,
      season,
      variety,
      soil,
    };
    onUpdateContext(data);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="p-3 mx-3 my-2 rounded-xl bg-[#FFFFFF] border border-[#DDD4C4] text-xs space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#636B2F]" />
          {language === 'kn' ? 'ಕೃಷಿ ಹಾಗೂ ಹವಾಮಾನ ವಿವರ' : 'Farm Context & Weather'}
        </span>
        <button
          type="button"
          onClick={handleUpdate}
          className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F5F0E6] hover:bg-[#EBE4D5] text-[#0A0A0A] border border-[#DDD4C4] font-bold transition-colors cursor-pointer shadow-sm"
        >
          {savedToast
            ? language === 'kn' ? '✓ ಉಳಿಸಲಾಗಿದೆ' : '✓ Saved'
            : language === 'kn' ? 'ನವೀಕರಿಸಿ ↺' : 'Update ↺'}
        </button>
      </div>

      <div className="space-y-2">
        {/* District (All 31 Districts) */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold text-[#374151] uppercase">
            📍 {language === 'kn' ? 'ಜಿಲ್ಲೆ (೩೧ ಜಿಲ್ಲೆಗಳು)' : 'District (31 Districts)'}
          </label>
          <select
            value={district}
            onChange={(e) => {
              const newDist = e.target.value;
              setDistrict(newDist);
              const newBlocks = DISTRICTS_AND_BLOCKS[newDist] || [newDist];
              setBlock(newBlocks[0]);
              onUpdateContext({
                district: newDist,
                block: newBlocks[0],
                region: newDist,
                season,
                variety,
                soil,
              });
            }}
            className="w-full bg-[#FFFFFF] border border-[#DDD4C4] rounded-lg px-2.5 py-1.5 text-xs text-[#0A0A0A] font-bold focus:outline-none focus:border-[#636B2F]"
          >
            {Object.keys(DISTRICTS_AND_BLOCKS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Block / Taluk */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold text-[#374151] uppercase">
            🏛️ {language === 'kn' ? 'ತಾಲೂಕು / ಬ್ಲಾಕ್' : 'Block / Taluk'}
          </label>
          <select
            value={block}
            onChange={(e) => {
              setBlock(e.target.value);
              onUpdateContext({
                district,
                block: e.target.value,
                region: district,
                season,
                variety,
                soil,
              });
            }}
            className="w-full bg-[#FFFFFF] border border-[#DDD4C4] rounded-lg px-2.5 py-1.5 text-xs text-[#0A0A0A] font-bold focus:outline-none focus:border-[#636B2F]"
          >
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold text-[#374151] uppercase">
            ☀️ {language === 'kn' ? 'ಋತು / ಹಂಗಾಮು' : 'Season'}
          </label>
          <select
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              onUpdateContext({ district, block, region: district, season: e.target.value, variety, soil });
            }}
            className="w-full bg-[#FFFFFF] border border-[#DDD4C4] rounded-lg px-2.5 py-1.5 text-xs text-[#0A0A0A] font-bold focus:outline-none focus:border-[#636B2F]"
          >
            <option value="Kharif (Monsoon)">
              {language === 'kn' ? 'ಖಾರೀಫ್ (ಮುಂಗಾರು ಜೂನ್–ಅಕ್ಟೋಬರ್)' : 'Kharif (Monsoon June-Oct)'}
            </option>
            <option value="Rabi (Post-monsoon)">
              {language === 'kn' ? 'ರಬಿ (ಹಿಂಗಾರು ಅಕ್ಟೋಬರ್–ಫೆಬ್ರವರಿ)' : 'Rabi (Post-monsoon Oct-Feb)'}
            </option>
            <option value="Summer (Irrigated)">
              {language === 'kn' ? 'ಬೇಸಿಗೆ (ನೀರಾವರಿ ಫೆಬ್ರವರಿ–ಮೇ)' : 'Summer (Irrigated Feb-May)'}
            </option>
          </select>
        </div>

        {/* Variety */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold text-[#374151] uppercase">
            🌱 {language === 'kn' ? 'ತಳಿ' : 'Variety'}
          </label>
          <select
            value={variety}
            onChange={(e) => {
              setVariety(e.target.value);
              onUpdateContext({ district, block, region: district, season, variety: e.target.value, soil });
            }}
            className="w-full bg-[#FFFFFF] border border-[#DDD4C4] rounded-lg px-2.5 py-1.5 text-xs text-[#0A0A0A] font-bold focus:outline-none focus:border-[#636B2F]"
          >
            {cropVarieties.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Soil */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold text-[#374151] uppercase">
            🪨 {language === 'kn' ? 'ಮಣ್ಣಿನ ವಿಧ' : 'Soil Type'}
          </label>
          <select
            value={soil}
            onChange={(e) => {
              setSoil(e.target.value);
              onUpdateContext({ district, block, region: district, season, variety, soil: e.target.value });
            }}
            className="w-full bg-[#FFFFFF] border border-[#DDD4C4] rounded-lg px-2.5 py-1.5 text-xs text-[#0A0A0A] font-bold focus:outline-none focus:border-[#636B2F]"
          >
            <option value="Sandy Loam">
              {language === 'kn' ? 'ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು' : 'Sandy Loam (Well Drained)'}
            </option>
            <option value="Red Sandy Loam">
              {language === 'kn' ? 'ಕೆಂಪು ಮರಳು ಗೋಡು ಮಣ್ಣು' : 'Red Sandy Loam'}
            </option>
            <option value="Black Cotton Soil">
              {language === 'kn' ? 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (ಜೇಡಿ ಮಣ್ಣು)' : 'Black Cotton Soil (Heavy Clay)'}
            </option>
            <option value="Laterite Soil (Malnad / Coastal)">
              {language === 'kn' ? 'ಲ್ಯಾಟರೈಟ್ / ಕೆಂಪು ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು' : 'Laterite Soil (Malnad / Coastal)'}
            </option>
            <option value="Alluvial Loam">
              {language === 'kn' ? 'ಮೆಕ್ಕಲು ಮಣ್ಣು' : 'Alluvial Loam'}
            </option>
          </select>
        </div>

        {/* Live Weather Preview Strip */}
        <div className="p-2.5 rounded-xl bg-[#EEF5FC] border border-[#88BDF2] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-[#1E3A5F] font-extrabold">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#384959] animate-pulse" />
              {language === 'kn' ? '🌦️ ಹವಾಮಾನ ಮುನ್ನೋಟ' : '🌦️ IMD Agromet Live'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#384959] text-[#FFFFFF] text-[9px] font-mono font-bold">
              {language === 'kn' ? 'ಲೈವ್ ೨೦೨೬' : 'LIVE 2026'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[9.5px]">
            <span className="bg-[#FFFFFF] border border-[#88BDF2] text-[#1E3A5F] px-1.5 py-0.5 rounded-md font-bold shadow-xs">
              🌡️ 32.5°C
            </span>
            <span className="bg-[#FFFFFF] border border-[#88BDF2] text-[#1E3A5F] px-1.5 py-0.5 rounded-md font-bold shadow-xs">
              🌧️ 2.4 mm
            </span>
            <span className="bg-[#FFFFFF] border border-[#88BDF2] text-[#1E3A5F] px-1.5 py-0.5 rounded-md font-bold shadow-xs">
              💨 12 km/h W
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
