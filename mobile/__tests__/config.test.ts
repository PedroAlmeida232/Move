/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';

import type { ExpoConfig } from 'expo/config';

const raiz = path.join(__dirname, '..');
const lerJson = (arquivo: string) =>
  JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));

function carregarConfig(env: Record<string, string> = {}): ExpoConfig {
  const anterior = { ...process.env };
  Object.assign(process.env, env);
  try {
    let config!: ExpoConfig;
    // Recarrega o módulo para ler as variáveis de ambiente deste teste.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      config = require('../app.config').default;
    });
    return config;
  } finally {
    process.env = anterior;
  }
}

type Plugin = string | [string, Record<string, unknown>];
const plugin = (config: ExpoConfig, nome: string) =>
  (config.plugins as Plugin[]).find((p) =>
    Array.isArray(p) ? p[0] === nome : p === nome,
  );

// Cabeçalho PNG: largura e altura (bytes 16–23) e tipo de cor (byte 25).
function png(arquivo: string) {
  const dados = fs.readFileSync(path.join(raiz, arquivo));
  return {
    largura: dados.readUInt32BE(16),
    altura: dados.readUInt32BE(20),
    temAlfa: dados[25] === 4 || dados[25] === 6,
  };
}

describe('app.config', () => {
  it('identifica o app como br.app.movetreino no iOS e no Android', () => {
    const config = carregarConfig();
    expect(config.name).toBe('Move');
    expect(config.ios?.bundleIdentifier).toBe('br.app.movetreino');
    expect(config.android?.package).toBe('br.app.movetreino');
  });

  it('declara que não usa criptografia própria e fala português', () => {
    const { ios } = carregarConfig();
    expect(ios?.infoPlist?.ITSAppUsesNonExemptEncryption).toBe(false);
    expect(ios?.infoPlist?.CFBundleDevelopmentRegion).toBe('pt-BR');
  });

  it('inclui os plugins nativos do Firebase com frameworks dinâmicos no iOS', () => {
    const config = carregarConfig();
    expect(plugin(config, '@react-native-firebase/app')).toBeDefined();
    expect(plugin(config, '@react-native-firebase/auth')).toBeDefined();
    expect(plugin(config, 'expo-build-properties')).toEqual([
      'expo-build-properties',
      { ios: { useFrameworks: 'dynamic' } },
    ]);
  });

  it('lê os arquivos do Firebase das variáveis do EAS e, sem elas, da pasta local', () => {
    const local = carregarConfig();
    expect(local.ios?.googleServicesFile).toBe('./GoogleService-Info.plist');
    expect(local.android?.googleServicesFile).toBe('./google-services.json');

    const eas = carregarConfig({
      GOOGLE_SERVICES_PLIST: '/eas/GoogleService-Info.plist',
      GOOGLE_SERVICES_JSON: '/eas/google-services.json',
    });
    expect(eas.ios?.googleServicesFile).toBe('/eas/GoogleService-Info.plist');
    expect(eas.android?.googleServicesFile).toBe('/eas/google-services.json');
  });

  it('usa ícone 1024×1024 sem transparência (exigência da App Store)', () => {
    const { icon } = carregarConfig();
    expect(icon).toBeDefined();
    expect(png(icon!)).toEqual({ largura: 1024, altura: 1024, temAlfa: false });
  });

  it('tem splash com fundo claro e escuro e todas as imagens existem', () => {
    const config = carregarConfig();
    const splash = plugin(config, 'expo-splash-screen') as [
      string,
      {
        image: string;
        backgroundColor: string;
        dark: { backgroundColor: string };
      },
    ];
    expect(splash[1].backgroundColor).toBe('#FFFFFF');
    expect(splash[1].dark.backgroundColor).toBe('#000000');

    const adaptive = config.android?.adaptiveIcon;
    for (const imagem of [
      splash[1].image,
      adaptive?.foregroundImage,
      adaptive?.monochromeImage,
      config.web?.favicon,
    ]) {
      expect(fs.existsSync(path.join(raiz, imagem!))).toBe(true);
    }
  });
});

describe('eas.json', () => {
  it('tem os perfis development, preview e production', () => {
    const eas = lerJson('eas.json');
    expect(eas.build.development).toMatchObject({
      developmentClient: true,
      distribution: 'internal',
    });
    expect(eas.build.preview).toMatchObject({ distribution: 'internal' });
    expect(eas.build.production).toMatchObject({ autoIncrement: true });
    expect(eas.cli.appVersionSource).toBe('remote');
  });
});

describe('package.json', () => {
  const pacote = lerJson('package.json');
  const dependencias = Object.keys({
    ...pacote.dependencies,
    ...pacote.devDependencies,
  });

  it('tem o expo-dev-client para o perfil development', () => {
    expect(dependencias).toContain('expo-dev-client');
  });

  it('não tem analytics, anúncios nem rastreamento', () => {
    const proibido =
      /analytics|crashlytics|perf|ads|admob|tracking|amplitude|segment|mixpanel|sentry|facebook|appsflyer|branch/i;
    expect(dependencias.filter((d) => proibido.test(d))).toEqual([]);
  });
});
