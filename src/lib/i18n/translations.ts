import type { Locale } from '@/shared/types/i18n';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { PitchDetectorId } from '@/shared/types/pitch';

type TranslationDictionary = {
  languageShort: string;
  modes: {
    auto: string;
    manual: string;
  };
  actions: {
    start: string;
    stop: string;
  };
  labels: {
    appName: string;
    cents: string;
    language: string;
    captureProfile: string;
    pitchDetector: string;
    stringType: string;
    install: string;
    tuningMode: string;
    targetString: string;
    tuningOffset: string;
  };
  status: {
    listening: string;
    detecting: string;
    noSignal: string;
    permission: string;
    idle: string;
    error: string;
    inTune: string;
    low: string;
    high: string;
    held: string;
  };
  install: {
    title: string;
    bodyPrompt: string;
    bodyIos: string;
    iosStepOpen: string;
    iosStepShare: string;
    iosStepAdd: string;
    confirm: string;
    close: string;
  };
  debug: {
    title: string;
    detector: string;
    profile: string;
    strings: string;
    mode: string;
    manualString: string;
    reference: string;
    stage: string;
    reason: string;
    sampleRate: string;
    signal: string;
    peak: string;
    clipping: string;
    minimum: string;
    retention: string;
    counters: string;
    smoothing: string;
    note: string;
    broad: string;
    refined: string;
    selected: string;
    refinement: string;
    comparison: string;
    events: string;
    fallback: string;
  };
  profiles: Record<CaptureProfileId, string>;
  pitchDetectors: Record<PitchDetectorId, string>;
  stringTypes: {
    steel: string;
    nylon: string;
  };
  errors: {
    microphoneUnavailable: string;
    insecureContext: string;
    browserUnsupported: string;
    permissionDenied: string;
    microphoneNotFound: string;
    microphoneBusy: string;
    microphoneUnsupportedSettings: string;
    microphoneAccessFailed: string;
  };
};

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    languageShort: 'EN',
    modes: {
      auto: 'Auto',
      manual: 'Manual',
    },
    actions: {
      start: 'Start',
      stop: 'Stop',
    },
    labels: {
      appName: 'Tuner',
      cents: 'cents',
      language: 'Language',
      captureProfile: 'Capture',
      pitchDetector: 'Algorithm',
      stringType: 'Strings',
      install: 'Install',
      tuningMode: 'Tuning mode',
      targetString: 'Target string',
      tuningOffset: 'Tuning offset',
    },
    status: {
      listening: 'Listening',
      detecting: 'Finding pitch',
      noSignal: 'Pluck a string',
      permission: 'Allow microphone',
      idle: 'Ready',
      error: 'Mic error',
      inTune: 'In tune',
      low: 'Tune up',
      high: 'Tune down',
      held: 'Holding',
    },
    install: {
      title: 'Install tuner',
      bodyPrompt: 'Install this tuner for faster access and a full-screen app experience.',
      bodyIos: 'On iPhone, install from Safari in a few quick steps.',
      iosStepOpen: 'Open this page in Safari.',
      iosStepShare: 'Tap Share.',
      iosStepAdd: 'Tap Add to Home Screen.',
      confirm: 'Install',
      close: 'Close',
    },
    debug: {
      title: 'Debug',
      detector: 'Detector',
      profile: 'Profile',
      strings: 'Strings',
      mode: 'Mode',
      manualString: 'Manual',
      reference: 'Hint',
      stage: 'Stage',
      reason: 'Reason',
      sampleRate: 'Hz',
      signal: 'RMS',
      peak: 'Peak',
      clipping: 'Clip',
      minimum: 'Min',
      retention: 'Hold',
      counters: 'Frames',
      smoothing: 'Smooth',
      note: 'Note',
      broad: 'Broad',
      refined: 'Refined',
      selected: 'Used',
      refinement: 'Window',
      comparison: 'Compare',
      events: 'Events',
      fallback: 'Fallback',
    },
    profiles: {
      sensivel: 'Sensitive',
      balanceado: 'Balanced',
      estrito: 'Strict',
    },
    pitchDetectors: {
      'autocorrelate-stable': 'Stable',
      'autocorrelate-classic': 'Classic',
    },
    stringTypes: {
      steel: 'Steel',
      nylon: 'Nylon',
    },
    errors: {
      microphoneUnavailable: 'Microphone input is unavailable.',
      insecureContext: 'Microphone access requires HTTPS or localhost.',
      browserUnsupported: 'This browser does not support microphone capture.',
      permissionDenied: 'Microphone permission was denied. Allow access in the browser and try again.',
      microphoneNotFound: 'No microphone was found on this device.',
      microphoneBusy: 'The microphone is unavailable or already in use by another app.',
      microphoneUnsupportedSettings:
        'The requested microphone settings are not supported on this device.',
      microphoneAccessFailed: 'Unable to access the microphone.',
    },
  },
  pt: {
    languageShort: 'PT',
    modes: {
      auto: 'Automatico',
      manual: 'Manual',
    },
    actions: {
      start: 'Iniciar',
      stop: 'Parar',
    },
    labels: {
      appName: 'Afinador',
      cents: 'cent',
      language: 'Idioma',
      captureProfile: 'Captacao',
      pitchDetector: 'Algoritmo',
      stringType: 'Cordas',
      install: 'Instalar',
      tuningMode: 'Modo de afinacao',
      targetString: 'Corda alvo',
      tuningOffset: 'Desvio de afinacao',
    },
    status: {
      listening: 'Ouvindo',
      detecting: 'Buscando nota',
      noSignal: 'Toque uma corda',
      permission: 'Permita o microfone',
      idle: 'Pronto',
      error: 'Erro no microfone',
      inTune: 'Afinado',
      low: 'Aperte',
      high: 'Afrouxe',
      held: 'Segurando',
    },
    install: {
      title: 'Instalar afinador',
      bodyPrompt: 'Instale o afinador para abrir mais rapido e usar como app de tela cheia.',
      bodyIos: 'No iPhone, instale pelo Safari em poucos passos.',
      iosStepOpen: 'Abra esta pagina no Safari.',
      iosStepShare: 'Toque em Compartilhar.',
      iosStepAdd: 'Toque em Adicionar a Tela de Inicio.',
      confirm: 'Instalar',
      close: 'Fechar',
    },
    debug: {
      title: 'Debug',
      detector: 'Detector',
      profile: 'Perfil',
      strings: 'Cordas',
      mode: 'Modo',
      manualString: 'Manual',
      reference: 'Hint',
      stage: 'Etapa',
      reason: 'Motivo',
      sampleRate: 'Hz',
      signal: 'RMS',
      peak: 'Pico',
      clipping: 'Clip',
      minimum: 'Min',
      retention: 'Hold',
      counters: 'Frames',
      smoothing: 'Suave',
      note: 'Nota',
      broad: 'Amplo',
      refined: 'Refino',
      selected: 'Usado',
      refinement: 'Janela',
      comparison: 'Comparar',
      events: 'Eventos',
      fallback: 'Fallback',
    },
    profiles: {
      sensivel: 'Sensivel',
      balanceado: 'Balanceado',
      estrito: 'Estrito',
    },
    pitchDetectors: {
      'autocorrelate-stable': 'Estavel',
      'autocorrelate-classic': 'Classico',
    },
    stringTypes: {
      steel: 'Aco',
      nylon: 'Nylon',
    },
    errors: {
      microphoneUnavailable: 'A entrada do microfone nao esta disponivel.',
      insecureContext: 'O microfone exige HTTPS ou localhost.',
      browserUnsupported: 'Este navegador nao oferece suporte ao microfone.',
      permissionDenied:
        'Permissao do microfone negada. Libere o acesso no navegador e tente novamente.',
      microphoneNotFound: 'Nenhum microfone foi encontrado neste dispositivo.',
      microphoneBusy: 'O microfone esta indisponivel ou sendo usado por outro app.',
      microphoneUnsupportedSettings:
        'As configuracoes solicitadas do microfone nao sao suportadas neste dispositivo.',
      microphoneAccessFailed: 'Nao foi possivel acessar o microfone.',
    },
  },
  es: {
    languageShort: 'ES',
    modes: {
      auto: 'Automatico',
      manual: 'Manual',
    },
    actions: {
      start: 'Iniciar',
      stop: 'Detener',
    },
    labels: {
      appName: 'Afinador',
      cents: 'cent',
      language: 'Idioma',
      captureProfile: 'Captacion',
      pitchDetector: 'Algoritmo',
      stringType: 'Cuerdas',
      install: 'Instalar',
      tuningMode: 'Modo de afinacion',
      targetString: 'Cuerda objetivo',
      tuningOffset: 'Desviacion de afinacion',
    },
    status: {
      listening: 'Escuchando',
      detecting: 'Buscando nota',
      noSignal: 'Toca una cuerda',
      permission: 'Permite el microfono',
      idle: 'Listo',
      error: 'Error del microfono',
      inTune: 'Afinado',
      low: 'Sube',
      high: 'Baja',
      held: 'Manteniendo',
    },
    install: {
      title: 'Instalar afinador',
      bodyPrompt: 'Instala el afinador para abrirlo mas rapido y usarlo como app de pantalla completa.',
      bodyIos: 'En iPhone, instalalo desde Safari en pocos pasos.',
      iosStepOpen: 'Abre esta pagina en Safari.',
      iosStepShare: 'Toca Compartir.',
      iosStepAdd: 'Toca Agregar a pantalla de inicio.',
      confirm: 'Instalar',
      close: 'Cerrar',
    },
    debug: {
      title: 'Debug',
      detector: 'Detector',
      profile: 'Perfil',
      strings: 'Cuerdas',
      mode: 'Modo',
      manualString: 'Manual',
      reference: 'Hint',
      stage: 'Etapa',
      reason: 'Motivo',
      sampleRate: 'Hz',
      signal: 'RMS',
      peak: 'Pico',
      clipping: 'Clip',
      minimum: 'Min',
      retention: 'Hold',
      counters: 'Frames',
      smoothing: 'Suave',
      note: 'Nota',
      broad: 'Amplio',
      refined: 'Refino',
      selected: 'Usado',
      refinement: 'Ventana',
      comparison: 'Comparar',
      events: 'Eventos',
      fallback: 'Fallback',
    },
    profiles: {
      sensivel: 'Sensible',
      balanceado: 'Balanceado',
      estrito: 'Estricto',
    },
    pitchDetectors: {
      'autocorrelate-stable': 'Estable',
      'autocorrelate-classic': 'Clasico',
    },
    stringTypes: {
      steel: 'Acero',
      nylon: 'Nylon',
    },
    errors: {
      microphoneUnavailable: 'La entrada del microfono no esta disponible.',
      insecureContext: 'El microfono requiere HTTPS o localhost.',
      browserUnsupported: 'Este navegador no admite captura de microfono.',
      permissionDenied:
        'El permiso del microfono fue denegado. Habilitalo en el navegador e intenta de nuevo.',
      microphoneNotFound: 'No se encontro ningun microfono en este dispositivo.',
      microphoneBusy: 'El microfono no esta disponible o esta en uso por otra app.',
      microphoneUnsupportedSettings:
        'La configuracion solicitada del microfono no es compatible con este dispositivo.',
      microphoneAccessFailed: 'No fue posible acceder al microfono.',
    },
  },
};
