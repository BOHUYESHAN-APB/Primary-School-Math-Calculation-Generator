// Capacitor配置文件
// 注意：需要安装@capacitor/cli依赖才能正常使用

// 临时类型定义，避免编译错误
interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
  };
  plugins?: {
    [key: string]: any;
  };
  android?: {
    buildOptions?: {
      [key: string]: any;
    };
  };
}

const config: CapacitorConfig = {
  appId: 'com.astrasynergy.mathgenerator',
  appName: '小学数学题目生成器',
  webDir: 'math-question-generator/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'ionic'
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB', // Android App Bundle
      signingType: 'apksigner'
    }
  }
};

export default config;