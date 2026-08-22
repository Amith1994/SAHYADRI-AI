import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { translateToKannada } from '../services/translator';

async function main() {
  const englishText = `### Diagnosis & Direct Answer
The silking stage is the most critical period for your NK-6240 maize crop. At this stage, the plant is highly sensitive to moisture stress; even 2-3 days of water deficit can lead to poor pollination and fertilization, potentially reducing your yield by 20-30%. Since your crop is currently in the silking phase, your primary objective is to ensure adequate soil moisture and protect the crop from pests like the Fall Armyworm to ensure successful grain set.

### What to do & Recommended Field Operations
1. **Moisture Management**: Ensure the soil remains moist. Given the current weather forecast for Shivamogga, if there is a gap in rainfall exceeding 3-4 days, provide supplemental irrigation. Maize at the silking stage requires consistent moisture to facilitate silk emergence and pollen tube growth.
2. **Fall Armyworm (FAW) Scouting & Control**: Inspect the central whorls and silks of the plants for FAW larvae. If you observe damage, perform a targeted foliar spray of Chlorantraniliprole 18.5% SC at a dosage of 0.4 mL/L of water.
3. **Disease Monitoring**: Keep a close watch for Turcicum leaf blight. If you notice long elliptical lesions, apply a foliar spray of Mancozeb 75% WP @ 2.5 g/L.

### 🌦️ Weather-Based Agro-Advisory
1. **Field Operation & Spraying Window**: Carry out chemical sprays during calm mornings (6:30–9:00 AM) when wind speed is <8 km/h.
2. **Micro-Climate & Disease Risk Alert**: High morning humidity (97%) favors fungal infection. Inspect crops regularly.

### ⚠️ Important Message for Farmer
Do not allow water stress during silking and grain filling stage as it directly causes barren cobs and drastic yield loss.`;

  console.log('Testing Translation to Kannada...');
  const res = await translateToKannada(englishText);
  console.log('--- TRANSLATED KANNADA RESULT ---');
  console.log(res);

  const kannadaChars = (res.match(/[\u0C80-\u0CFF]/g) || []).length;
  if (kannadaChars > 100) {
    console.log(`✅ PASSED: ${kannadaChars} Kannada characters generated!`);
  } else {
    console.error('❌ FAILED: Translation did not produce sufficient Kannada script.');
    process.exit(1);
  }
}

main().catch(console.error);
