/**
 * Configuration centrale pour i18n (internationalisation)
 *
 * Ce fichier configure Vue I18n pour supporter le multilinguisme
 * dans l'application Brumisater.
 *
 * Langues supportees: FR (par defaut), EN
 *
 * @see https://i18n.nuxtjs.org/
 * @see https://vue-i18n.intlify.dev/
 */

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',

  // Configuration des formats de dates
  datetimeFormats: {
    fr: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    },
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    }
  },

  // Configuration des formats de nombres
  numberFormats: {
    fr: {
      currency: {
        style: 'currency',
        currency: 'EUR'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    },
    en: {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    }
  }
}))
