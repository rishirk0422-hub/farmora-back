import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

await i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'hi', 'mr', 'te', 'ta'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: new URL('./locales/{{lng}}/{{ns}}.json', import.meta.url).pathname
    },
    detection: {
      order: ['header', 'querystring'],
      lookupQuerystring: 'lng',
      lookupHeader: 'accept-language'
    }
  });

export { i18next, middleware };