import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface Localization {
  language: string;
  region: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

class InternationalizationService {
  private translations: Map<string, Translation> = new Map();
  private supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false, flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true, flag: '🇵🇰' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', rtl: true, flag: '🇮🇷' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, flag: '🇹🇷' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false, flag: '🇵🇱' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false, flag: '🇸🇪' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false, flag: '🇩🇰' }
  ];

  private regionSettings: Map<string, Localization> = new Map([
    ['US', { language: 'en', region: 'US', timezone: 'America/New_York', currency: 'USD', dateFormat: 'MM/DD/YYYY', numberFormat: 'en-US' }],
    ['CA', { language: 'en', region: 'CA', timezone: 'America/Toronto', currency: 'CAD', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-CA' }],
    ['GB', { language: 'en', region: 'GB', timezone: 'Europe/London', currency: 'GBP', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-GB' }],
    ['AU', { language: 'en', region: 'AU', timezone: 'Australia/Sydney', currency: 'AUD', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-AU' }],
    ['ES', { language: 'es', region: 'ES', timezone: 'Europe/Madrid', currency: 'EUR', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-ES' }],
    ['MX', { language: 'es', region: 'MX', timezone: 'America/Mexico_City', currency: 'MXN', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-MX' }],
    ['FR', { language: 'fr', region: 'FR', timezone: 'Europe/Paris', currency: 'EUR', dateFormat: 'DD/MM/YYYY', numberFormat: 'fr-FR' }],
    ['DE', { language: 'de', region: 'DE', timezone: 'Europe/Berlin', currency: 'EUR', dateFormat: 'DD.MM.YYYY', numberFormat: 'de-DE' }],
    ['IT', { language: 'it', region: 'IT', timezone: 'Europe/Rome', currency: 'EUR', dateFormat: 'DD/MM/YYYY', numberFormat: 'it-IT' }],
    ['PT', { language: 'pt', region: 'PT', timezone: 'Europe/Lisbon', currency: 'EUR', dateFormat: 'DD/MM/YYYY', numberFormat: 'pt-PT' }],
    ['BR', { language: 'pt', region: 'BR', timezone: 'America/Sao_Paulo', currency: 'BRL', dateFormat: 'DD/MM/YYYY', numberFormat: 'pt-BR' }],
    ['RU', { language: 'ru', region: 'RU', timezone: 'Europe/Moscow', currency: 'RUB', dateFormat: 'DD.MM.YYYY', numberFormat: 'ru-RU' }],
    ['CN', { language: 'zh', region: 'CN', timezone: 'Asia/Shanghai', currency: 'CNY', dateFormat: 'YYYY/MM/DD', numberFormat: 'zh-CN' }],
    ['JP', { language: 'ja', region: 'JP', timezone: 'Asia/Tokyo', currency: 'JPY', dateFormat: 'YYYY/MM/DD', numberFormat: 'ja-JP' }],
    ['KR', { language: 'ko', region: 'KR', timezone: 'Asia/Seoul', currency: 'KRW', dateFormat: 'YYYY.MM.DD', numberFormat: 'ko-KR' }],
    ['SA', { language: 'ar', region: 'SA', timezone: 'Asia/Riyadh', currency: 'SAR', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-SA' }],
    ['IN', { language: 'hi', region: 'IN', timezone: 'Asia/Kolkata', currency: 'INR', dateFormat: 'DD/MM/YYYY', numberFormat: 'hi-IN' }],
    ['TR', { language: 'tr', region: 'TR', timezone: 'Europe/Istanbul', currency: 'TRY', dateFormat: 'DD.MM.YYYY', numberFormat: 'tr-TR' }]
  ]);

  constructor() {
    this.loadTranslations();
  }

  private async loadTranslations() {
    for (const lang of this.supportedLanguages) {
      try {
        const translationPath = path.join(__dirname, '../locales', `${lang.code}.json`);
        if (fs.existsSync(translationPath)) {
          const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
          this.translations.set(lang.code, translationData);
        } else {
          // Create default translation file
          await this.createDefaultTranslation(lang.code);
        }
      } catch (error) {
        console.error(`Error loading translation for ${lang.code}:`, error);
      }
    }
  }

  private async createDefaultTranslation(languageCode: string) {
    const defaultTranslations: Translation = {
      common: {
        welcome: 'Welcome',
        hello: 'Hello',
        goodbye: 'Goodbye',
        yes: 'Yes',
        no: 'No',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        search: 'Search',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit'
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        loginError: 'Invalid email or password',
        registrationSuccess: 'Registration successful'
      },
      profile: {
        profile: 'Profile',
        editProfile: 'Edit Profile',
        firstName: 'First Name',
        lastName: 'Last Name',
        bio: 'Bio',
        age: 'Age',
        location: 'Location',
        interests: 'Interests',
        photos: 'Photos',
        settings: 'Settings',
        privacy: 'Privacy',
        notifications: 'Notifications'
      },
      social: {
        posts: 'Posts',
        createPost: 'Create Post',
        like: 'Like',
        comment: 'Comment',
        share: 'Share',
        followers: 'Followers',
        following: 'Following',
        feed: 'Feed',
        trending: 'Trending',
        hashtag: 'Hashtag'
      },
      dating: {
        matches: 'Matches',
        swipe: 'Swipe',
        like: 'Like',
        pass: 'Pass',
        superLike: 'Super Like',
        itsAMatch: "It's a Match!",
        startConversation: 'Start Conversation',
        dateIdeas: 'Date Ideas',
        compatibility: 'Compatibility',
        preferences: 'Preferences'
      },
      messaging: {
        messages: 'Messages',
        sendMessage: 'Send Message',
        typing: 'Typing...',
        online: 'Online',
        offline: 'Offline',
        lastSeen: 'Last seen',
        voiceCall: 'Voice Call',
        videoCall: 'Video Call',
        chatSettings: 'Chat Settings'
      },
      gamification: {
        achievements: 'Achievements',
        rewards: 'Rewards',
        points: 'Points',
        level: 'Level',
        streak: 'Streak',
        badges: 'Badges',
        leaderboard: 'Leaderboard',
        daily_challenge: 'Daily Challenge',
        weekly_goal: 'Weekly Goal',
        experience: 'Experience'
      },
      notifications: {
        newMatch: 'You have a new match!',
        newMessage: 'New message from {name}',
        likedYour: '{name} liked your {type}',
        commented: '{name} commented on your post',
        achievement: 'Achievement unlocked: {achievement}',
        reminder: 'Don\'t forget to check your matches!'
      }
    };

    const localesDir = path.join(__dirname, '../locales');
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    const translationPath = path.join(localesDir, `${languageCode}.json`);
    fs.writeFileSync(translationPath, JSON.stringify(defaultTranslations, null, 2));
    this.translations.set(languageCode, defaultTranslations);
  }

  public translate(key: string, languageCode: string = 'en', params?: { [key: string]: string }): string {
    const translations = this.translations.get(languageCode) || this.translations.get('en');
    if (!translations) return key;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }

    if (typeof value !== 'string') return key;

    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }

    return value;
  }

  public getSupportedLanguages(): Language[] {
    return this.supportedLanguages;
  }

  public getRegionSettings(regionCode: string): Localization | null {
    return this.regionSettings.get(regionCode.toUpperCase()) || null;
  }

  public detectLanguageFromHeader(acceptLanguage: string): string {
    if (!acceptLanguage) return 'en';

    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qValue] = lang.trim().split(';q=');
        return { code: code.split('-')[0], q: qValue ? parseFloat(qValue) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const lang of languages) {
      if (this.supportedLanguages.some(sl => sl.code === lang.code)) {
        return lang.code;
      }
    }

    return 'en';
  }

  public formatDate(date: Date, localization: Localization): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: localization.timezone
    };

    return new Intl.DateTimeFormat(localization.numberFormat, options).format(date);
  }

  public formatCurrency(amount: number, localization: Localization): string {
    return new Intl.NumberFormat(localization.numberFormat, {
      style: 'currency',
      currency: localization.currency
    }).format(amount);
  }

  public formatNumber(number: number, localization: Localization): string {
    return new Intl.NumberFormat(localization.numberFormat).format(number);
  }
}

// Middleware to set user language and localization
export const localizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const i18n = new InternationalizationService();
  
  // Get language from user preferences, header, or default
  let language = 'en';
  
  if (req.user && (req.user as any).preferredLanguage) {
    language = (req.user as any).preferredLanguage;
  } else if (req.headers['accept-language']) {
    language = i18n.detectLanguageFromHeader(req.headers['accept-language'] as string);
  }

  // Get region from user preferences, header, or IP
  let regionCode = 'US';
  if (req.user && (req.user as any).region) {
    regionCode = (req.user as any).region;
  }

  const localization = i18n.getRegionSettings(regionCode);

  // Add translation function to request
  (req as any).t = (key: string, params?: { [key: string]: string }) => {
    return i18n.translate(key, language, params);
  };

  (req as any).localization = localization || i18n.getRegionSettings('US');
  (req as any).language = language;

  next();
};

export const internationalizationService = new InternationalizationService();
