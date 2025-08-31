import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  Info, 
  Heart, 
  Github, 
  Globe,
  User, 
  Star,
  ExternalLink,
  Mail,
  Download,
  CheckCircle
} from 'lucide-react';
import { configManager, ConfigData } from '../lib/config-manager';

interface AboutPageProps {
  language: string;
}

export function AboutPage({ language }: AboutPageProps) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  const texts = {
    'zh-CN': {
      title: '关于',
      description: '了解应用程序的详细信息、开发团队和许可证',
      appInfo: '应用信息',
      version: '版本',
      author: '作者',
      license: '许可证',
      repository: '代码仓库',
      description_label: '描述',
      supportedLanguages: '支持语言',
      features: '主要功能',
      feature1: '智能生成小学数学计算题目',
      feature2: '多种运算类型支持（加减乘除、分数、百分数等）',
      feature3: '灵活的难度等级设置',
      feature4: 'AI智能解答和步骤指导',
      feature5: '多种导出格式（PDF、HTML、DOCX）',
      feature6: '响应式设计，支持移动设备',
      feature7: '国际化支持（中文、英文）',
      feature8: '年级预设配置，适合不同学习阶段',
      developerInfo: '开发团队信息',
      teamName: 'Astra Synergy团队',
      teamDescription: '致力于开发高质量教育技术解决方案的团队',
      contact: '联系方式',
      website: '官方网站',
      email: '邮箱',
      github: 'GitHub',
      acknowledgments: '致谢',
      thanksTo: '感谢以下开源项目和技术的支持：',
      frontend: '前端技术栈',
      backend: '后端技术栈',
      tools: '开发工具',
      openSourceNote: '本项目基于开源精神开发，欢迎贡献代码和建议。',
      viewOnGithub: '在GitHub上查看',
      downloadLatest: '下载最新版本',
      reportIssue: '报告问题',
      contribute: '参与贡献',
      systemInfo: '系统信息',
      buildTime: '构建时间',
      nodeVersion: 'Node.js版本',
      reactVersion: 'React版本'
    },
    'en-US': {
      title: 'About',
      description: 'Learn about application details, development team, and licenses',
      appInfo: 'Application Information',
      version: 'Version',
      author: 'Author',
      license: 'License',
      repository: 'Repository',
      description_label: 'Description',
      supportedLanguages: 'Supported Languages',
      features: 'Key Features',
      feature1: 'Intelligent generation of primary school math problems',
      feature2: 'Multiple operation types (addition, subtraction, multiplication, division, fractions, percentages, etc.)',
      feature3: 'Flexible difficulty level settings',
      feature4: 'AI smart solutions and step-by-step guidance',
      feature5: 'Multiple export formats (PDF, HTML, DOCX)',
      feature6: 'Responsive design with mobile device support',
      feature7: 'Internationalization support (Chinese, English)',
      feature8: 'Grade preset configurations for different learning stages',
      developerInfo: 'Development Team Information',
      teamName: 'Astra Synergy Team',
      teamDescription: 'A team dedicated to developing high-quality educational technology solutions',
      contact: 'Contact',
      website: 'Official Website',
      email: 'Email',
      github: 'GitHub',
      acknowledgments: 'Acknowledgments',
      thanksTo: 'Thanks to the following open source projects and technologies:',
      frontend: 'Frontend Stack',
      backend: 'Backend Stack',
      tools: 'Development Tools',
      openSourceNote: 'This project is developed with open source spirit. Contributions and suggestions are welcome.',
      viewOnGithub: 'View on GitHub',
      downloadLatest: 'Download Latest',
      reportIssue: 'Report Issue',
      contribute: 'Contribute',
      systemInfo: 'System Information',
      buildTime: 'Build Time',
      nodeVersion: 'Node.js Version',
      reactVersion: 'React Version'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    try {
      setLoading(true);
      const appConfig = await configManager.loadConfig();
      setConfig(appConfig);
    } catch (error) {
      console.error('Failed to load app info:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    t.feature1,
    t.feature2, 
    t.feature3,
    t.feature4,
    t.feature5,
    t.feature6,
    t.feature7,
    t.feature8
  ];

  const frontendTech = [
    'React 18',
    'TypeScript', 
    'Vite',
    'Tailwind CSS',
    'Radix UI',
    'Lucide Icons',
    'React Hook Form'
  ];

  const backendTech = [
    'Python',
    'FastAPI',
    'Uvicorn',
    'Pydantic',
    'SymPy',
    'PyYAML',
    'httpx'
  ];

  const devTools = [
    'VS Code',
    'Git',
    'npm',
    'ESLint',
    'Prettier'
  ];

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Info className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{language === 'zh-CN' ? '加载应用信息中...' : 'Loading application info...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Info className="h-6 w-6" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      <div className="grid gap-6">
        {/* 应用信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t.appInfo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'en-US' ? config.app.name_en : config.app.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'en-US' ? config.app.description_en : config.app.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t.version}</Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {config.app.version}
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{t.author}: {config.app.author}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{t.license}: {config.app.license}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{t.supportedLanguages}: </span>
                      {config.app.supported_languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang === 'zh-CN' ? '中文' : 'English'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">{t.features}</h4>
                  <ScrollArea className="h-48">
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === 'zh-CN' ? '应用信息加载失败' : 'Failed to load application info'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 开发团队信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t.developerInfo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{t.teamName}</h3>
                <p className="text-muted-foreground mb-4">{t.teamDescription}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">{t.contact}</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      {t.website}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                    
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {t.email}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                    
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Github className="h-4 w-4 mr-2" />
                      {t.github}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Github className="h-4 w-4 mr-2" />
                    {t.viewOnGithub}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    {t.downloadLatest}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.reportIssue}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.contribute}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {t.openSourceNote}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技术栈致谢 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              {t.acknowledgments}
            </CardTitle>
            <CardDescription>{t.thanksTo}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">{t.frontend}</h4>
                <div className="space-y-2">
                  {frontendTech.map((tech, index) => (
                    <Badge key={index} variant="outline" className="block w-fit text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">{t.backend}</h4>
                <div className="space-y-2">
                  {backendTech.map((tech, index) => (
                    <Badge key={index} variant="outline" className="block w-fit text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-purple-600">{t.tools}</h4>
                <div className="space-y-2">
                  {devTools.map((tool, index) => (
                    <Badge key={index} variant="outline" className="block w-fit text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t.systemInfo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">{t.buildTime}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date().toLocaleString()}
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">{t.nodeVersion}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {(import.meta as any).env?.VITE_NODE_VERSION || 'v18+'}
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">{t.reactVersion}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  18.x
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Environment</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {(import.meta as any).env?.MODE || 'development'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}