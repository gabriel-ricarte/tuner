import type { Locale } from '@/shared/types/i18n';
import type { CaptureProfileId } from '@/shared/types/audio';

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
  profiles: Record<CaptureProfileId, string>;
  errors: {
    microphoneUnavailable: string;
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
    profiles: {
      sensivel: 'Sensitive',
      balanceado: 'Balanced',
      estrito: 'Strict',
    },
    errors: {
      microphoneUnavailable: 'Microphone input is unavailable.',
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
    profiles: {
      sensivel: 'Sensivel',
      balanceado: 'Balanceado',
      estrito: 'Estrito',
    },
    errors: {
      microphoneUnavailable: 'A entrada do microfone nao esta disponivel.',
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
    profiles: {
      sensivel: 'Sensible',
      balanceado: 'Balanceado',
      estrito: 'Estricto',
    },
    errors: {
      microphoneUnavailable: 'La entrada del microfono no esta disponible.',
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
