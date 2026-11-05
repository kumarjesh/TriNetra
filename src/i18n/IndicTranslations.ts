// ============================================================
// TriNetra — Indic Language Translations & Localization
// ============================================================
// High-priority pedestrian navigation phrases and natural language
// hazard alerts for Indic languages (Hindi, Tamil, Telugu, Bengali, Marathi).

import type { SupportedLanguage, Zone, ProximityBand, AlertPriority, TrackedObject } from '../types';

export type { SupportedLanguage };

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  bcp47: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
];

/** Dictionary of pedestrian obstacle translations */
export const OBSTACLE_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  hi: {
    person: 'व्यक्ति',
    car: 'गाड़ी',
    truck: 'ट्रक',
    bus: 'बस',
    motorcycle: 'मोटरसाइकिल',
    bicycle: 'साइकिल',
    dog: 'कुत्ता',
    cat: 'बिल्ली',
    chair: 'कुर्सी',
    bench: 'बेंच',
    table: 'मेज',
    'dining table': 'मेज',
    couch: 'सोफा',
    bed: 'बिस्तर',
    'potted plant': 'गमला',
    'fire hydrant': 'फायर हाइड्रेंट',
    'stop sign': 'स्टॉप साइन',
    'traffic light': 'ट्रैफिक लाइट',
    stairs: 'सीढ़ियाँ',
    door: 'दरवाज़ा',
    backpack: 'बैग',
    suitcase: 'सूटकेस',
    umbrella: 'छाता',
    pole: 'खंभा',
    obstacle: 'रुकावट',
    vehicle: 'वाहन',
  },
  en: {
    person: 'Person',
    car: 'Car',
    truck: 'Truck',
    bus: 'Bus',
    motorcycle: 'Motorcycle',
    bicycle: 'Bicycle',
    dog: 'Dog',
    cat: 'Cat',
    chair: 'Chair',
    bench: 'Bench',
    table: 'Table',
    'dining table': 'Table',
    couch: 'Couch',
    bed: 'Bed',
    'potted plant': 'Plant',
    'fire hydrant': 'Fire hydrant',
    'stop sign': 'Stop sign',
    'traffic light': 'Traffic light',
    stairs: 'Stairs',
    door: 'Door',
    backpack: 'Backpack',
    suitcase: 'Suitcase',
    umbrella: 'Umbrella',
    pole: 'Pole',
    obstacle: 'Obstacle',
    vehicle: 'Vehicle',
  },
  ta: {
    person: 'நபர்',
    car: 'கார்',
    truck: 'லாரி',
    bus: 'பஸ்',
    motorcycle: 'மோட்டார் சைக்கிள்',
    bicycle: 'சைக்கிள்',
    dog: 'நாய்',
    cat: 'பூனை',
    chair: 'நாற்காலி',
    bench: 'பெஞ்ச்',
    table: 'மேஜை',
    stairs: 'படிகள்',
    door: 'கதவு',
    obstacle: 'தடை',
    vehicle: 'வாகனம்',
  },
  te: {
    person: 'వ్యక్తి',
    car: 'కారు',
    truck: 'ట్రక్కు',
    bus: 'బస్సు',
    motorcycle: 'మోటార్ సైకిల్',
    bicycle: 'సైకిల్',
    dog: 'కుక్క',
    cat: 'పిల్లి',
    chair: 'కుర్చీ',
    bench: 'బెంచ్',
    table: 'బల్ల',
    stairs: 'మెట్లు',
    door: 'తలుపు',
    obstacle: 'అడ్డంకి',
    vehicle: 'వాహనం',
  },
  bn: {
    person: 'ব্যক্তি',
    car: 'গাড়ি',
    truck: 'ট্রাক',
    bus: 'বাস',
    motorcycle: 'মোটরসাইকেল',
    bicycle: 'সাইকেল',
    dog: 'কুকুর',
    cat: 'বিড়াল',
    chair: 'চেয়ার',
    bench: 'বেঞ্চ',
    table: 'টেবিল',
    stairs: 'সিঁড়ি',
    door: 'দরজা',
    obstacle: 'বাধা',
    vehicle: 'যানবাহন',
  },
  mr: {
    person: 'व्यक्ती',
    car: 'गाडी',
    truck: 'ट्रक',
    bus: 'बस',
    motorcycle: 'मोटारसायकल',
    bicycle: 'सायकल',
    dog: 'कुत्रा',
    cat: 'मांजर',
    chair: 'खुर्ची',
    bench: 'बाक',
    table: 'मेज',
    stairs: 'जिना',
    door: 'दरवाजा',
    obstacle: 'अडथळा',
    vehicle: 'वाहन',
  },
};

/** Directional zone labels */
export const DIRECTION_LABELS: Record<SupportedLanguage, Record<Zone, string>> = {
  hi: {
    left: 'बाईं ओर',
    center: 'सामने',
    right: 'दाईं ओर',
  },
  en: {
    left: 'on your left',
    center: 'ahead',
    right: 'on your right',
  },
  ta: {
    left: 'இடதுபுறம்',
    center: 'நேரே',
    right: 'வலதுபுறம்',
  },
  te: {
    left: 'ఎడమవైపు',
    center: 'ముందు',
    right: 'కుడివైపు',
  },
  bn: {
    left: 'বাঁদিকে',
    center: 'সামনে',
    right: 'ডানদিকে',
  },
  mr: {
    left: 'डाव्या बाजूला',
    center: 'समोर',
    right: 'उजव्या बाजूला',
  },
};

/** Proximity degree labels */
export const PROXIMITY_LABELS_INDIC: Record<SupportedLanguage, Record<ProximityBand, string>> = {
  hi: {
    CRITICAL: 'बहुत पास',
    WARNING: 'पास',
    BACKGROUND: 'आगे',
  },
  en: {
    CRITICAL: 'very close',
    WARNING: 'close',
    BACKGROUND: 'ahead',
  },
  ta: {
    CRITICAL: 'மிக அருகில்',
    WARNING: 'அருகில்',
    BACKGROUND: 'முன்னே',
  },
  te: {
    CRITICAL: 'చాలా దగ్గరగా',
    WARNING: 'దగ్గరగా',
    BACKGROUND: 'ముందు',
  },
  bn: {
    CRITICAL: 'খুব কাছে',
    WARNING: 'কাছে',
    BACKGROUND: 'সামনে',
  },
  mr: {
    CRITICAL: 'खूप जवळ',
    WARNING: 'जवळ',
    BACKGROUND: 'पुढे',
  },
};

/** General Navigation Phrases */
export const PHRASES: Record<SupportedLanguage, Record<string, string>> = {
  hi: {
    stop: 'रुकिए!',
    caution: 'सावधान!',
    clear: 'रास्ता साफ़ है।',
    scanning_active: 'स्कैनिंग चालू है।',
    scanning_paused: 'स्कैनिंग रुक गई है।',
    flashlight_on: 'फ्लैशलाइट चालू की गई।',
    flashlight_off: 'फ्लैशलाइट बंद की गई।',
    language_switched: 'भाषा बदलकर हिन्दी कर दी गई है।',
    approaching: 'आ रहा है',
  },
  en: {
    stop: 'Stop!',
    caution: 'Caution!',
    clear: 'No immediate hazards detected.',
    scanning_active: 'Scanning active.',
    scanning_paused: 'Scanning paused.',
    flashlight_on: 'Flashlight enabled.',
    flashlight_off: 'Flashlight turned off.',
    language_switched: 'Language changed to English.',
    approaching: 'approaching',
  },
  ta: {
    stop: 'நில்லுங்கள்!',
    caution: 'கவனம்!',
    clear: 'பாதை தெளிவாக உள்ளது.',
    scanning_active: 'ஸ்கேனிங் இயக்கத்தில் உள்ளது.',
    scanning_paused: 'ஸ்கேனிங் இடைநிறுத்தப்பட்டது.',
    flashlight_on: 'ஃபிளாஷ்லைட் ஆன்.',
    flashlight_off: 'ஃபிளாஷ்லைட் ஆஃப்.',
    language_switched: 'மொழி தமிழாக மாற்றப்பட்டது.',
    approaching: 'வருகிறது',
  },
  te: {
    stop: 'ఆగండి!',
    caution: 'జాగ్రత్త!',
    clear: 'దారి స్పష్టంగా ఉంది.',
    scanning_active: 'స్కానింగ్ ప్రారంభమైంది.',
    scanning_paused: 'స్కానింగ్ నిలిపివేయబడింది.',
    flashlight_on: 'ఫ్లాష్‌లైట్ ఆన్.',
    flashlight_off: 'ఫ్లాష్‌లైట్ ఆఫ్.',
    language_switched: 'భాష తెలుగుగా మార్చబడింది.',
    approaching: 'వస్తోంది',
  },
  bn: {
    stop: 'থামুন!',
    caution: 'সাবধান!',
    clear: 'পথ পরিষ্কার আছে।',
    scanning_active: 'স্ক্যানিং সক্রিয়।',
    scanning_paused: 'স্ক্যানিং থামানো হয়েছে।',
    flashlight_on: 'ফ্ল্যাশলাইট চালু।',
    flashlight_off: 'ফ্ল্যাশলাইট বন্ধ।',
    language_switched: 'ভাষা বাংলায় পরিবর্তন করা হয়েছে।',
    approaching: 'আসছে',
  },
  mr: {
    stop: 'थांबा!',
    caution: 'सावधान!',
    clear: 'रस्ता मोकळा आहे.',
    scanning_active: 'स्कॅनिंग सुरू आहे.',
    scanning_paused: 'स्कॅनिंग थांबवले आहे.',
    flashlight_on: 'फ्लॅशलाइट सुरू केली.',
    flashlight_off: 'फ्लॅशलाइट बंद केली.',
    language_switched: 'भाषा मराठीत बदलली आहे.',
    approaching: 'येत आहे',
  },
};

/**
 * Build concise, naturally phrased pedestrian collision alert in target language
 */
export function buildLocalizedAlert(
  obj: TrackedObject,
  priority: AlertPriority,
  lang: SupportedLanguage = 'hi'
): string {
  const dict = OBSTACLE_NAMES[lang] || OBSTACLE_NAMES.en;
  const dirDict = DIRECTION_LABELS[lang] || DIRECTION_LABELS.en;
  const proxDict = PROXIMITY_LABELS_INDIC[lang] || PROXIMITY_LABELS_INDIC.en;
  const phraseDict = PHRASES[lang] || PHRASES.en;

  const obstacle = dict[obj.class] || dict['obstacle'] || obj.class;
  const direction = dirDict[obj.zone] || dirDict.center;
  const proximity = proxDict[obj.proximityBand] || proxDict.WARNING;

  if (lang === 'hi') {
    // Natural Hindi sentence structuring for urgent walking safety
    if (priority === 'CRITICAL_INTERRUPT' || obj.isLooming) {
      return `${phraseDict.stop} ${direction} ${obstacle} ${proximity} है।`;
    }
    if (priority === 'HIGH') {
      return `${phraseDict.caution} ${direction} ${obstacle} ${proximity} है।`;
    }
    // Standard warnings (≤4 words)
    return `${direction} ${obstacle}।`;
  }

  if (lang === 'en') {
    if (priority === 'CRITICAL_INTERRUPT' || obj.isLooming) {
      return `Stop. ${obstacle} ${proximity} ${direction}.`;
    }
    if (priority === 'HIGH') {
      return `Caution. ${obstacle} ${proximity}, ${direction}.`;
    }
    return `${obstacle} ${direction}.`;
  }

  // Generic Indic fallback
  if (priority === 'CRITICAL_INTERRUPT') {
    return `${phraseDict.stop} ${direction} ${obstacle} ${proximity}.`;
  }
  return `${direction} ${obstacle}.`;
}
