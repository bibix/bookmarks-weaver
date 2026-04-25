import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appTitle: 'Bookmarks Weaver',
      appDescription:
        'Create nested bookmark folders and links from reusable handlebars templates and variable tables.',
      fileNameSectionTitle: '1. Output file name',
      fileNameSectionDescription: 'Define the downloaded bookmarks filename template.',
      fileNameLabel: 'Bookmarks file name',
      fileNameHelp: 'Default: bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html',
      templateSectionTitle: '2. Template section',
      templateSectionDescription: 'Use BlockNote with list-based template syntax for folders, bookmarks, and comments.',
      variablesSectionTitle: '3. Variables',
      variablesSectionDescription: 'Each variable maps to a table. Add rows/columns and values to drive generated output.',
      previewSectionTitle: '4. Generated output preview',
      previewSectionDescription: 'Inspect resolved folders/bookmarks and download the final bookmarks HTML file.',
      urlParserTitle: 'URL input and parsing',
      urlParserDescription: 'Helper section for visual URL decomposition into colored labels.',
      statusReady: 'Ready',
      statusDownloaded: 'Bookmarks file generated and downloaded.',
      skipToMain: 'Skip to Main Content',
    },
  },
  pl: {
    translation: {
      appTitle: 'Bookmarks Weaver',
      appDescription:
        'Twórz zagnieżdżone foldery i linki zakładek na podstawie szablonów handlebars oraz tabel zmiennych.',
      fileNameSectionTitle: '1. Nazwa pliku wyjściowego',
      fileNameSectionDescription: 'Zdefiniuj nazwę pobieranego pliku zakładek.',
      fileNameLabel: 'Nazwa pliku zakładek',
      fileNameHelp: 'Domyślnie: bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html',
      templateSectionTitle: '2. Sekcja szablonu',
      templateSectionDescription: 'Użyj BlockNote i składni list do folderów, zakładek i komentarzy.',
      variablesSectionTitle: '3. Zmienne',
      variablesSectionDescription: 'Każda zmienna mapuje do tabeli. Dodawaj wiersze/kolumny i wartości.',
      previewSectionTitle: '4. Podgląd wyniku',
      previewSectionDescription: 'Sprawdź wynik i pobierz końcowy plik HTML z zakładkami.',
      urlParserTitle: 'Wprowadzanie i parsowanie URL',
      urlParserDescription: 'Sekcja pomocnicza do wizualnego rozbicia URL na etykiety.',
      statusReady: 'Gotowe',
      statusDownloaded: 'Plik zakładek został wygenerowany i pobrany.',
      skipToMain: 'Przejdź do głównej treści',
    },
  },
  de: {
    translation: {
      appTitle: 'Bookmarks Weaver',
      appDescription:
        'Erstellen Sie verschachtelte Lesezeichen-Ordner und Links mit wiederverwendbaren Handlebars-Templates.',
      fileNameSectionTitle: '1. Ausgabedateiname',
      fileNameSectionDescription: 'Definieren Sie die Dateinamenvorlage für den Download.',
      fileNameLabel: 'Dateiname für Lesezeichen',
      fileNameHelp: 'Standard: bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html',
      templateSectionTitle: '2. Vorlagenbereich',
      templateSectionDescription: 'Nutzen Sie BlockNote und Listensyntax für Ordner, Lesezeichen und Kommentare.',
      variablesSectionTitle: '3. Variablen',
      variablesSectionDescription: 'Jede Variable entspricht einer Tabelle mit Zeilen und Spalten.',
      previewSectionTitle: '4. Vorschau des Ergebnisses',
      previewSectionDescription: 'Überprüfen Sie das Ergebnis und laden Sie die HTML-Datei herunter.',
      urlParserTitle: 'URL-Eingabe und Parsing',
      urlParserDescription: 'Hilfsbereich zur visuellen Zerlegung der URL.',
      statusReady: 'Bereit',
      statusDownloaded: 'Lesezeichen-Datei wurde erstellt und heruntergeladen.',
      skipToMain: 'Zum Hauptinhalt springen',
    },
  },
  es: {
    translation: {
      appTitle: 'Bookmarks Weaver',
      appDescription:
        'Crea carpetas y enlaces de marcadores anidados usando plantillas Handlebars y tablas de variables.',
      fileNameSectionTitle: '1. Nombre del archivo de salida',
      fileNameSectionDescription: 'Define la plantilla del nombre del archivo descargado.',
      fileNameLabel: 'Nombre del archivo de marcadores',
      fileNameHelp: 'Predeterminado: bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html',
      templateSectionTitle: '2. Sección de plantilla',
      templateSectionDescription: 'Usa BlockNote y sintaxis de listas para carpetas, marcadores y comentarios.',
      variablesSectionTitle: '3. Variables',
      variablesSectionDescription: 'Cada variable es una tabla con filas y columnas.',
      previewSectionTitle: '4. Vista previa del resultado',
      previewSectionDescription: 'Revisa el resultado y descarga el archivo HTML final.',
      urlParserTitle: 'Entrada y análisis de URL',
      urlParserDescription: 'Sección auxiliar para descomponer visualmente una URL.',
      statusReady: 'Listo',
      statusDownloaded: 'El archivo de marcadores fue generado y descargado.',
      skipToMain: 'Saltar al contenido principal',
    },
  },
  it: {
    translation: {
      appTitle: 'Bookmarks Weaver',
      appDescription:
        'Crea cartelle e link di segnalibri annidati con template Handlebars e tabelle di variabili.',
      fileNameSectionTitle: '1. Nome file di output',
      fileNameSectionDescription: 'Definisci il nome del file dei segnalibri da scaricare.',
      fileNameLabel: 'Nome file segnalibri',
      fileNameHelp: 'Predefinito: bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html',
      templateSectionTitle: '2. Sezione template',
      templateSectionDescription: 'Usa BlockNote e sintassi a elenco per cartelle, segnalibri e commenti.',
      variablesSectionTitle: '3. Variabili',
      variablesSectionDescription: 'Ogni variabile è una tabella con righe e colonne.',
      previewSectionTitle: '4. Anteprima del risultato',
      previewSectionDescription: 'Controlla il risultato e scarica il file HTML finale.',
      urlParserTitle: 'Input e parsing URL',
      urlParserDescription: 'Sezione di supporto per scomporre visivamente gli URL.',
      statusReady: 'Pronto',
      statusDownloaded: 'File segnalibri generato e scaricato.',
      skipToMain: 'Vai al contenuto principale',
    },
  },
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
