const fs = require('fs');
const path = require('path');

const LANGUAGES = ['hi', 'mr', 'te', 'ta'];

async function translateText(text, targetLang) {
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
        api_key: ''
      })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    console.warn(`Failed: ${text} → ${targetLang}`);
    return text;
  }
}

async function translateObject(obj, lang) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value, lang);
      console.log(`[${lang}] ${key} → ${result[key]}`);
    } else {
      result[key] = await translateObject(value, lang);
    }
  }
  return result;
}

async function main() {
  const en = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../locales/en/translation.json'), 'utf-8')
  );

  // Paths where translated files will be saved
  const backendLocales = path.join(__dirname, '../locales');
  const frontendLocales = path.join(__dirname, '../../frontend/public/locales');

  // Always copy English first
  fs.mkdirSync(path.join(frontendLocales, 'en'), { recursive: true });
  fs.writeFileSync(
    path.join(frontendLocales, 'en/translation.json'),
    JSON.stringify(en, null, 2)
  );

  for (const lang of LANGUAGES) {
    console.log(`\nTranslating to ${lang}...`);
    const translated = await translateObject(en, lang);

    // Save backend
    const bDir = path.join(backendLocales, lang);
    fs.mkdirSync(bDir, { recursive: true });
    fs.writeFileSync(path.join(bDir, 'translation.json'), JSON.stringify(translated, null, 2));

    // Save frontend
    const fDir = path.join(frontendLocales, lang);
    fs.mkdirSync(fDir, { recursive: true });
    fs.writeFileSync(path.join(fDir, 'translation.json'), JSON.stringify(translated, null, 2));

    console.log(`Done: ${lang}`);
  }

  console.log('\nAll translations done!');
}

main();