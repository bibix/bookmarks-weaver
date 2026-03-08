import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      title: "Bookmarks Weaver",
      sections: {
        fileName: "Output file name",
        fileNameDescription: "Specify the template for the exported HTML file name.",
        template: "Template section",
        templateDescription: "Build your bookmark hierarchy. Use / to insert Folders, Bookmarks or Comments.",
        variables: "Variables section",
        variablesDescription: "Manage data for your templates. Variables are automatically detected from your structure.",
        preview: "Generated results",
        previewDescription: "Preview how your bookmarks will look after variables are resolved."
      },
      placeholders: {
        fileName: "bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html",
        folderName: "Folder name (Handlebars supported)",
        comment: "Your comment here...",
        bookmarkTitle: "Bookmark title",
        bookmarkUrl: "Bookmark URL",
        bookmarkDescription: "Bookmark description",
        bookmarkTags: "Tags (comma separated)",
        bookmarkKeywords: "Keywords (comma separated)"
      },
      buttons: {
        download: "Download Bookmarks",
        addTable: "Add Variable Table",
        changeLanguage: "Change Language",
        toggleTheme: "Toggle Theme"
      }
    }
  },
  pl: {
    translation: {
      title: "Tkacz Zakładek",
      sections: {
        fileName: "Nazwa pliku wyjściowego",
        template: "Sekcja szablonu",
        variables: "Sekcja zmiennych",
        preview: "Podgląd wygenerowanego wyniku"
      },
      // ... more translations will be added as needed
    }
  },
  de: { translation: { title: "Lesezeichen Weber" } },
  es: { translation: { title: "Tejedor de Marcadores" } },
  it: { translation: { title: "Tessitore di Segnalibri" } }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
