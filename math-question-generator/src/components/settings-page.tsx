import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Palette, 
  Database, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { configManager, ConfigData } from '../lib/config-manager';
import { AISettings } from './ai-settings';

interface SettingsPageProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

interface CustomAPIConfig {
  id: string;
  name: string;
  api_base: string;
  api_key: string;
  model: string;
  description: string;
  enabled: boolean;
}

export function SettingsPage({ language, onLanguageChange, theme, onThemeChange }: SettingsPageProps) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  // 自定义API配置状态 - 已移至ai-settings组件
  // const [customAPIs, setCustomAPIs] = useState<CustomAPIConfig[]>([]);
  
  // 本地设置状态
  const [localSettings, setLocalSettings] = useState({
    autoSave: localStorage.getItem('autoSave') === 'true',
    showTips: localStorage.getItem('showTips') !== 'false',
    animationEnabled: localStorage.getItem('animationEnabled') !== 'false',
    questionCount: parseInt(localStorage.getItem('defaultQuestionCount') || '10'),
    exportFormat: localStorage.getItem('defaultExportFormat') || 'pdf'
  });

  const texts = {
    'zh-CN': {
      title: '设置',
      description: '配置应用程序的各项参数和偏好设置',
      general: '通用设置',
      appearance: '外观设置',
      language: '语言设置',
      ai: 'AI设置',
      advanced: '高级设置',
      theme: '主题',
      themeLight: '浅色主题',
      themeDark: '深色主题',
      themeSystem: '跟随系统',
      autoSave: '自动保存',
      autoSaveDesc: '自动保存生成的题目和配置',
      showTips: '显示提示',
      showTipsDesc: '在界面中显示帮助提示',
      animations: '启用动画',
      animationsDesc: '启用界面动画效果',
      defaultQuestionCount: '默认题目数量',
      defaultExportFormat: '默认导出格式',
      aiService: 'AI服务',
      aiTimeout: 'AI超时时间（秒）',
      apiBase: 'API基础地址',
      model: '模型名称',
      apiKeyStatus: 'API密钥状态',
      configured: '已配置',
      notConfigured: '未配置',
      save: '保存设置',
      reset: '重置为默认',
      saved: '设置已保存',
      resetSuccess: '设置已重置',
      loadError: '加载设置失败',
      saveError: '保存设置失败',
      info: '提示',
      aiConfigNote: 'AI相关设置需要在后端配置文件中修改，或通过环境变量设置。',
      restartRequired: '某些设置更改需要重新启动应用程序才能生效。',
      // 新增的翻译
      customAPIs: '自定义API配置',
      addNewAPI: '添加新API',
      apiName: 'API名称',
      apiKey: 'API密钥',
      testConnection: '测试连接',
      deleteAPI: '删除API',
      saveAPI: '保存API',
      cancel: '取消',
      enabled: '已启用',
      disabled: '已禁用',
      showAPIKey: '显示API密钥',
      hideAPIKey: '隐藏API密钥',
      testSuccess: '连接测试成功',
      testFailed: '连接测试失败',
      testing: '正在测试连接...',
      testingEndpoint: '正在测试端点',
      connectionSuccess: '连接成功',
      connectionDetails: '连接详情',
      apiAdded: 'API配置已添加',
      apiDeleted: 'API配置已删除',
      fillAllFields: '请填写所有必要字段'
    },
    'en-US': {
      title: 'Settings',
      description: 'Configure application parameters and preferences',
      general: 'General Settings',
      appearance: 'Appearance Settings',
      language: 'Language Settings',
      ai: 'AI Settings',
      advanced: 'Advanced Settings',
      theme: 'Theme',
      themeLight: 'Light Theme',
      themeDark: 'Dark Theme',
      themeSystem: 'Follow System',
      autoSave: 'Auto Save',
      autoSaveDesc: 'Automatically save generated questions and configurations',
      showTips: 'Show Tips',
      showTipsDesc: 'Display help tips in the interface',
      animations: 'Enable Animations',
      animationsDesc: 'Enable interface animation effects',
      defaultQuestionCount: 'Default Question Count',
      defaultExportFormat: 'Default Export Format',
      aiService: 'AI Service',
      aiTimeout: 'AI Timeout (seconds)',
      apiBase: 'API Base URL',
      model: 'Model Name',
      apiKeyStatus: 'API Key Status',
      configured: 'Configured',
      notConfigured: 'Not Configured',
      save: 'Save Settings',
      reset: 'Reset to Default',
      saved: 'Settings saved',
      resetSuccess: 'Settings reset successfully',
      loadError: 'Failed to load settings',
      saveError: 'Failed to save settings',
      info: 'Info',
      aiConfigNote: 'AI-related settings need to be modified in the backend configuration file or set via environment variables.',
      restartRequired: 'Some setting changes require restarting the application to take effect.',
      // New translations
      customAPIs: 'Custom API Configuration',
      addNewAPI: 'Add New API',
      apiName: 'API Name',
      apiKey: 'API Key',
      testConnection: 'Test Connection',
      deleteAPI: 'Delete API',
      saveAPI: 'Save API',
      cancel: 'Cancel',
      enabled: 'Enabled',
      disabled: 'Disabled',
      showAPIKey: 'Show API Key',
      hideAPIKey: 'Hide API Key',
      testSuccess: 'Connection test successful',
      testFailed: 'Connection test failed',
      testing: 'Testing connection...',
      testingEndpoint: 'Testing endpoint',
      connectionSuccess: 'Connection successful',
      connectionDetails: 'Connection details',
      apiAdded: 'API configuration added',
      apiDeleted: 'API configuration deleted',
      fillAllFields: 'Please fill in all required fields'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  useEffect(() => {
    loadSettings();
    loadCustomAPIs();
  }, []);

  const loadCustomAPIs = async () => {
    try {
      const saved = localStorage.getItem('custom_ai_apis');
      if (saved) {
        // const apis = JSON.parse(saved);
        // setCustomAPIs(apis);
        // 自定义API配置已移至ai-settings组件
      }
    } catch (error) {
      console.error('加载自定义API失败:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // 加载应用配置
      const appConfig = await configManager.loadConfig();
      setConfig(appConfig);

      // 加载AI配置
      try {
        const response = await fetch('http://localhost:8001/api/ai-services');
        if (response.ok) {
          // const aiConfigData = await response.json();
          // AI配置已加载，但不再使用独立状态
        }
      } catch (error) {
        console.warn('Failed to load AI config:', error);
      }

    } catch (error) {
      setMessage({ type: 'error', text: t.loadError });
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // 保存本地设置到localStorage
      localStorage.setItem('autoSave', localSettings.autoSave.toString());
      localStorage.setItem('showTips', localSettings.showTips.toString());
      localStorage.setItem('animationEnabled', localSettings.animationEnabled.toString());
      localStorage.setItem('defaultQuestionCount', localSettings.questionCount.toString());
      localStorage.setItem('defaultExportFormat', localSettings.exportFormat);

      setMessage({ type: 'success', text: t.saved });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: t.saveError });
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setLocalSettings({
      autoSave: true,
      showTips: true,
      animationEnabled: true,
      questionCount: 10,
      exportFormat: 'pdf'
    });
    onThemeChange('system');
    onLanguageChange('zh-CN');
    
    setMessage({ type: 'success', text: t.resetSuccess });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{language === 'zh-CN' ? '加载设置中...' : 'Loading settings...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      {message && (
        <div className="px-6 pt-4">
          <Alert className={`${message.type === 'error' ? 'border-red-200 bg-red-50' : 
            message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
            {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : 
             message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="general" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">{t.general}</TabsTrigger>
              <TabsTrigger value="appearance">{t.appearance}</TabsTrigger>
              <TabsTrigger value="ai">{t.ai}</TabsTrigger>
              <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto px-6 pb-6">
            <TabsContent value="general" className="h-full m-0 pt-4">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t.general}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSave">{t.autoSave}</Label>
                      <p className="text-sm text-muted-foreground">{t.autoSaveDesc}</p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={localSettings.autoSave}
                      onCheckedChange={(checked) => 
                        setLocalSettings(prev => ({ ...prev, autoSave: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showTips">{t.showTips}</Label>
                      <p className="text-sm text-muted-foreground">{t.showTipsDesc}</p>
                    </div>
                    <Switch
                      id="showTips"
                      checked={localSettings.showTips}
                      onCheckedChange={(checked) => 
                        setLocalSettings(prev => ({ ...prev, showTips: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionCount">{t.defaultQuestionCount}</Label>
                      <Input
                        id="questionCount"
                        type="number"
                        min="1"
                        max="100"
                        value={localSettings.questionCount}
                        onChange={(e) => 
                          setLocalSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exportFormat">{t.defaultExportFormat}</Label>
                      <Select
                        value={localSettings.exportFormat}
                        onValueChange={(value) => 
                          setLocalSettings(prev => ({ ...prev, exportFormat: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="docx">DOCX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="h-full m-0 pt-4">
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t.appearance}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language">{t.language}</Label>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">中文（简体）</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label htmlFor="theme">{t.theme}</Label>
                <Select value={theme} onValueChange={onThemeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.themeLight}</SelectItem>
                    <SelectItem value="dark">{t.themeDark}</SelectItem>
                    <SelectItem value="system">{t.themeSystem}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">{t.animations}</Label>
                  <p className="text-sm text-muted-foreground">{t.animationsDesc}</p>
                </div>
                <Switch
                  id="animations"
                  checked={localSettings.animationEnabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, animationEnabled: checked }))
                  }
                />              </div>
            </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 pt-4">
              <AISettings language={language} />
            </TabsContent>

            <TabsContent value="advanced" className="h-full m-0 pt-4">
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t.advanced}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>{t.restartRequired}</AlertDescription>
              </Alert>

              {config && (
                <div className="space-y-4">
                  <div>
                    <Label>应用版本</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg font-mono">
                      {config.app.version}
                    </div>
                  </div>

                  <div>
                    <Label>支持的运算类型</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {config.operation_types?.length || 0} 种
                    </div>
                  </div>

                  <div>
                    <Label>知识点数量</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {config.knowledge_points?.length || 0} 个
                    </div>
                  </div>

                  <div>
                    <Label>难度等级</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {Object.keys(config.difficulty_levels || {}).length} 级
                    </div>
                  </div>
                </div>
              )}
              </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="flex-1"
        >
          {saving ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              {language === 'zh-CN' ? '保存中...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t.save}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetSettings}
          className="flex-1"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {t.reset}
        </Button>
      </div>
    </div>
  );
}



