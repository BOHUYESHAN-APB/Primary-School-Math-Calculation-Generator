import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Scale, 
  ExternalLink, 
  FileText,
  Package,
  Shield,
  CheckCircle,
  Copy
} from 'lucide-react';
import { configManager, ConfigData } from '../lib/config-manager';
import { Alert, AlertDescription } from './ui/alert';

interface LicensesPageProps {
  language: string;
}

interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  url: string;
}

export function LicensesPage({ language }: LicensesPageProps) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLicense, setCopiedLicense] = useState<string | null>(null);

  const texts = {
    'zh-CN': {
      title: '开源许可证',
      description: '查看本应用程序和所使用的开源软件的许可证信息',
      appLicense: '应用许可证',
      dependencies: '依赖项许可证',
      frontend: '前端依赖',
      backend: '后端依赖',
      licenseText: '许可证全文',
      viewLicense: '查看许可证',
      downloadLicense: '下载许可证',
      copyLicense: '复制许可证',
      copied: '已复制',
      noLicenseData: '无法加载许可证数据',
      loadError: '加载许可证信息失败',
      compliance: '合规信息',
      complianceNote: '本应用程序严格遵守所有开源软件许可证的要求。如果您在使用过程中发现任何合规问题，请及时联系我们。',
      mitLicense: 'MIT许可证',
      apacheLicense: 'Apache许可证',
      bsdLicense: 'BSD许可证',
      iscLicense: 'ISC许可证',
      unknownLicense: '未知许可证',
      package: '软件包',
      version: '版本',
      license: '许可证',
      url: '项目地址',
      totalPackages: '总计软件包数量'
    },
    'en-US': {
      title: 'Open Source Licenses',
      description: 'View license information for this application and the open source software it uses',
      appLicense: 'Application License',
      dependencies: 'Dependencies Licenses',
      frontend: 'Frontend Dependencies',
      backend: 'Backend Dependencies',
      licenseText: 'Full License Text',
      viewLicense: 'View License',
      downloadLicense: 'Download License',
      copyLicense: 'Copy License',
      copied: 'Copied',
      noLicenseData: 'Unable to load license data',
      loadError: 'Failed to load license information',
      compliance: 'Compliance Information',
      complianceNote: 'This application strictly complies with all open source software license requirements. If you find any compliance issues during use, please contact us promptly.',
      mitLicense: 'MIT License',
      apacheLicense: 'Apache License',
      bsdLicense: 'BSD License',
      iscLicense: 'ISC License',
      unknownLicense: 'Unknown License',
      package: 'Package',
      version: 'Version',
      license: 'License',
      url: 'Project URL',
      totalPackages: 'Total Packages'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  useEffect(() => {
    loadLicenseInfo();
  }, []);

  const loadLicenseInfo = async () => {
    try {
      setLoading(true);
      const appConfig = await configManager.loadConfig();
      setConfig(appConfig);
    } catch (error) {
      console.error('Failed to load license info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, licenseType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLicense(licenseType);
      setTimeout(() => setCopiedLicense(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getLicenseBadgeColor = (license: string): "default" | "destructive" | "outline" | "secondary" => {
    const licenseType = license.toLowerCase();
    if (licenseType.includes('mit')) return 'default';
    if (licenseType.includes('apache')) return 'destructive';
    if (licenseType.includes('bsd')) return 'secondary';
    if (licenseType.includes('isc')) return 'outline';
    return 'secondary';
  };

  const getLicenseName = (license: string): string => {
    const licenseType = license.toLowerCase();
    if (licenseType.includes('mit')) return t.mitLicense;
    if (licenseType.includes('apache')) return t.apacheLicense;
    if (licenseType.includes('bsd')) return t.bsdLicense;
    if (licenseType.includes('isc')) return t.iscLicense;
    return license || t.unknownLicense;
  };

  // 默认的MIT许可证文本
  const defaultMITLicenseText = `MIT License

Copyright (c) 2024 Astra Synergy Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

  // 默认依赖项数据（如果配置文件中没有的话）
  const defaultFrontendDeps: LicenseInfo[] = [
    { name: 'React', version: '18.x', license: 'MIT', url: 'https://reactjs.org/' },
    { name: 'TypeScript', version: '5.x', license: 'Apache-2.0', url: 'https://www.typescriptlang.org/' },
    { name: 'Vite', version: '5.x', license: 'MIT', url: 'https://vitejs.dev/' },
    { name: 'Tailwind CSS', version: '3.x', license: 'MIT', url: 'https://tailwindcss.com/' },
    { name: '@radix-ui/react-*', version: 'latest', license: 'MIT', url: 'https://www.radix-ui.com/' },
    { name: 'lucide-react', version: 'latest', license: 'ISC', url: 'https://lucide.dev/' },
    { name: 'react-hook-form', version: '7.x', license: 'MIT', url: 'https://react-hook-form.com/' }
  ];

  const defaultBackendDeps: LicenseInfo[] = [
    { name: 'FastAPI', version: '0.68+', license: 'MIT', url: 'https://fastapi.tiangolo.com/' },
    { name: 'Uvicorn', version: '0.15+', license: 'BSD-3-Clause', url: 'https://www.uvicorn.org/' },
    { name: 'Pydantic', version: '1.8+', license: 'MIT', url: 'https://pydantic-docs.helpmanual.io/' },
    { name: 'SymPy', version: '1.9+', license: 'BSD-3-Clause', url: 'https://www.sympy.org/' },
    { name: 'PyYAML', version: '6.0+', license: 'MIT', url: 'https://pyyaml.org/' },
    { name: 'httpx', version: 'latest', license: 'BSD-3-Clause', url: 'https://www.python-httpx.org/' }
  ];

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Scale className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{language === 'zh-CN' ? '加载许可证信息中...' : 'Loading license information...'}</p>
        </div>
      </div>
    );
  }

  const appLicenseInfo = config?.licenses?.app_license || {
    name: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
    text: defaultMITLicenseText
  };

  const frontendDeps = config?.licenses?.dependencies?.frontend || defaultFrontendDeps;
  const backendDeps = config?.licenses?.dependencies?.backend || defaultBackendDeps;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      {/* 合规信息 */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>{t.compliance}</strong>: {t.complianceNote}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* 应用许可证 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.appLicense}
            </CardTitle>
            <CardDescription>
              {language === 'zh-CN' ? '本应用程序的主要许可证' : 'Main license for this application'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={getLicenseBadgeColor(appLicenseInfo.name)} className="text-sm">
                    {getLicenseName(appLicenseInfo.name)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(appLicenseInfo.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.viewLicense}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(appLicenseInfo.text, 'app')}
                >
                  {copiedLicense === 'app' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t.copyLicense}
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">{t.licenseText}</h4>
                <ScrollArea className="h-64 w-full border rounded-lg">
                  <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                    {appLicenseInfo.text}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 依赖项许可证 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.dependencies}
            </CardTitle>
            <CardDescription>
              {language === 'zh-CN' ? '本应用程序所使用的开源软件包许可证' : 'Licenses for open source packages used by this application'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="frontend" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="frontend" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {t.frontend}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {frontendDeps.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="backend" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {t.backend}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {backendDeps.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="frontend" className="mt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{t.frontend}</h4>
                    <Badge variant="outline">
                      {t.totalPackages}: {frontendDeps.length}
                    </Badge>
                  </div>
                  
                  <ScrollArea className="h-96 w-full">
                    <div className="space-y-3">
                      {frontendDeps.map((dep, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-medium">{dep.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {dep.version}
                                </Badge>
                                <Badge variant={getLicenseBadgeColor(dep.license)} className="text-xs">
                                  {getLicenseName(dep.license)}
                                </Badge>
                              </div>
                              {dep.url && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto"
                                  onClick={() => window.open(dep.url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {dep.url}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="backend" className="mt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{t.backend}</h4>
                    <Badge variant="outline">
                      {t.totalPackages}: {backendDeps.length}
                    </Badge>
                  </div>
                  
                  <ScrollArea className="h-96 w-full">
                    <div className="space-y-3">
                      {backendDeps.map((dep, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-medium">{dep.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {dep.version}
                                </Badge>
                                <Badge variant={getLicenseBadgeColor(dep.license)} className="text-xs">
                                  {getLicenseName(dep.license)}
                                </Badge>
                              </div>
                              {dep.url && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto"
                                  onClick={() => window.open(dep.url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {dep.url}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-muted-foreground">{t.appLicense}</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{frontendDeps.length}</div>
                <div className="text-sm text-muted-foreground">{t.frontend}</div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{backendDeps.length}</div>
                <div className="text-sm text-muted-foreground">{t.backend}</div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {frontendDeps.length + backendDeps.length}
                </div>
                <div className="text-sm text-muted-foreground">{t.totalPackages}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}