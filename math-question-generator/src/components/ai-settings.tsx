import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Bot, 
  Save, 
  Plus,
  Trash2,
  TestTube,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  Zap
} from 'lucide-react';
import { 
  aiProviderManager, 
  PRESET_PROVIDERS, 
  CustomProvider, 
  ProviderStatus 
} from '../lib/ai-provider-manager';

interface AISettingsProps {
  language: string;
}

export function AISettings({ language }: AISettingsProps) {
  // 状态管理
  const [presetStatus, setPresetStatus] = useState<Record<string, ProviderStatus>>({});
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string>('');
  const [tokensStats, setTokensStats] = useState<{ total: number; byProvider: Record<string, number> }>({ total: 0, byProvider: {} });
  const [loading, setLoading] = useState(true);
  const [testingStatus, setTestingStatus] = useState<Record<string, boolean>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  // 新增自定义服务商表单
  const [showNewProviderForm, setShowNewProviderForm] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<CustomProvider>>({
    name: '',
    apiBase: '',
    apiKey: '',
    model: '',
    description: ''
  });

  const texts = {
    'zh-CN': {
      title: 'AI服务配置',
      description: '配置AI服务提供商和管理API密钥',
      presetProviders: '预设服务商',
      customProviders: '自定义服务商',
      defaultProvider: '默认服务商',
      tokensUsage: 'Tokens使用统计',
      totalTokens: '总计',
      apiKey: 'API密钥',
      enabled: '已启用',
      disabled: '已禁用',
      connected: '已连接',
      disconnected: '未连接',
      testConnection: '测试连接',
      testing: '测试中...',
      addCustom: '添加自定义服务商',
      providerName: '服务商名称',
      apiBase: 'API基础地址',
      model: '模型名称',
      descriptionOptional: '描述（可选）',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      showKey: '显示密钥',
      hideKey: '隐藏密钥',
      testSuccess: '连接测试成功',
      testFailed: '连接测试失败',
      saveSuccess: '配置保存成功',
      saveFailed: '配置保存失败',
      fillRequired: '请填写必填字段',
      confirmDelete: '确认删除此服务商配置？',
      website: '官网',
      requirements: '需要API密钥',
      noRequirements: '无需API密钥',
      selectDefault: '选择默认服务商',
      noProviders: '暂无可用的AI服务商，请先配置并启用至少一个服务商。'
    },
    'en-US': {
      title: 'AI Service Configuration',
      description: 'Configure AI service providers and manage API keys',
      presetProviders: 'Preset Providers',
      customProviders: 'Custom Providers',
      defaultProvider: 'Default Provider',
      tokensUsage: 'Tokens Usage Statistics',
      totalTokens: 'Total',
      apiKey: 'API Key',
      enabled: 'Enabled',
      disabled: 'Disabled',
      connected: 'Connected',
      disconnected: 'Disconnected',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      addCustom: 'Add Custom Provider',
      providerName: 'Provider Name',
      apiBase: 'API Base URL',
      model: 'Model Name',
      descriptionOptional: 'Description (Optional)',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      showKey: 'Show Key',
      hideKey: 'Hide Key',
      testSuccess: 'Connection test successful',
      testFailed: 'Connection test failed',
      saveSuccess: 'Configuration saved successfully',
      saveFailed: 'Failed to save configuration',
      fillRequired: 'Please fill in required fields',
      confirmDelete: 'Are you sure to delete this provider configuration?',
      website: 'Website',
      requirements: 'Requires API Key',
      noRequirements: 'No API Key Required',
      selectDefault: 'Select Default Provider',
      noProviders: 'No AI providers available. Please configure and enable at least one provider.'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, custom, defaultProv, stats] = await Promise.all([
        aiProviderManager.getPresetProvidersStatus(),
        aiProviderManager.getCustomProviders(),
        aiProviderManager.getDefaultProvider(),
        aiProviderManager.getTokensStats()
      ]);
      
      setPresetStatus(status);
      setCustomProviders(custom);
      setDefaultProvider(defaultProv);
      setTokensStats(stats);
    } catch (error) {
      console.error('加载AI配置失败:', error);
      setMessage({ type: 'error', text: '加载配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetApiKeyChange = async (providerId: string, apiKey: string) => {
    const newStatus = {
      ...presetStatus,
      [providerId]: {
        ...presetStatus[providerId],
        apiKey,
        connected: false
      }
    };
    setPresetStatus(newStatus);
    
    // 如果填写了API密钥，自动测试连接
    if (apiKey.trim()) {
      await testPresetConnection(providerId, apiKey);
    }
  };

  const handlePresetToggle = async (providerId: string, enabled: boolean) => {
    const newStatus = {
      ...presetStatus,
      [providerId]: {
        ...presetStatus[providerId],
        enabled
      }
    };
    setPresetStatus(newStatus);
    await aiProviderManager.savePresetProvidersStatus(newStatus);
  };

  const testPresetConnection = async (providerId: string, apiKey?: string) => {
    const provider = PRESET_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;

    const key = apiKey || presetStatus[providerId]?.apiKey;
    if (!key) return;

    setTestingStatus(prev => ({ ...prev, [providerId]: true }));

    try {
      const result = await aiProviderManager.testConnection(
        provider.apiBase,
        key
      );

      const newStatus = {
        ...presetStatus,
        [providerId]: {
          ...presetStatus[providerId],
          connected: result.success,
          enabled: result.success, // 连接成功时自动启用
          lastTested: new Date().toISOString(),
          error: result.error
        }
      };
      setPresetStatus(newStatus);
      await aiProviderManager.savePresetProvidersStatus(newStatus);

      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.success ? t.testSuccess : `${t.testFailed}: ${result.error}` 
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setMessage({ type: 'error', text: `${t.testFailed}: ${errMsg}` });
    } finally {
      setTestingStatus(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const addCustomProvider = async () => {
    if (!newProvider.name || !newProvider.apiBase || !newProvider.model) {
      setMessage({ type: 'error', text: t.fillRequired });
      return;
    }

    const customProvider: CustomProvider = {
      id: `custom_${Date.now()}`,
      name: newProvider.name!,
      apiBase: newProvider.apiBase!,
      apiKey: newProvider.apiKey || '',
      model: newProvider.model!,
      description: newProvider.description || '',
      enabled: false,
      tokensUsed: 0
    };

    // 如果有API密钥，测试连接
    if (customProvider.apiKey) {
      setTestingStatus(prev => ({ ...prev, [customProvider.id]: true }));
      const result = await aiProviderManager.testConnection(
        customProvider.apiBase,
        customProvider.apiKey
      );
      customProvider.enabled = result.success;
      setTestingStatus(prev => ({ ...prev, [customProvider.id]: false }));
    }

    const updatedCustom = [...customProviders, customProvider];
    setCustomProviders(updatedCustom);
    await aiProviderManager.saveCustomProviders(updatedCustom);

    setNewProvider({ name: '', apiBase: '', apiKey: '', model: '', description: '' });
    setShowNewProviderForm(false);
    setMessage({ type: 'success', text: t.saveSuccess });
  };

  const deleteCustomProvider = async (providerId: string) => {
    if (!confirm(t.confirmDelete)) return;

    const updatedCustom = customProviders.filter(p => p.id !== providerId);
    setCustomProviders(updatedCustom);
    await aiProviderManager.saveCustomProviders(updatedCustom);
    setMessage({ type: 'success', text: '服务商配置已删除' });
  };

  const updateDefaultProvider = async (providerId: string) => {
    setDefaultProvider(providerId);
    aiProviderManager.setDefaultProvider(providerId);
    setMessage({ type: 'success', text: '默认服务商已更新' });
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  // 获取所有可用的服务商选项
  const getAvailableProviders = () => {
    const providers: Array<{ id: string; name: string; enabled: boolean }> = [];
    
    // 添加启用的预设服务商
    PRESET_PROVIDERS.forEach(provider => {
      if (presetStatus[provider.id]?.enabled) {
        providers.push({
          id: provider.id,
          name: provider.displayName,
          enabled: true
        });
      }
    });

    // 添加启用的自定义服务商
    customProviders.forEach(provider => {
      if (provider.enabled) {
        providers.push({
          id: provider.id,
          name: provider.name,
          enabled: true
        });
      }
    });

    return providers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">加载AI配置...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {t.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{t.description}</p>
      </div>

      {/* 消息提示 */}
      {message && (
        <Alert className={`border-l-4 ${
          message.type === 'success' ? 'border-green-500 bg-green-50' :
          message.type === 'error' ? 'border-red-500 bg-red-50' :
          'border-blue-500 bg-blue-50'
        }`}>
          <AlertDescription className={
            message.type === 'success' ? 'text-green-700' :
            message.type === 'error' ? 'text-red-700' :
            'text-blue-700'
          }>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Tokens使用统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t.tokensUsage}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tokensStats.total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{t.totalTokens}</div>
            </div>
            {Object.entries(tokensStats.byProvider).slice(0, 3).map(([id, count]) => {
              const provider = PRESET_PROVIDERS.find(p => p.id === id) || customProviders.find(p => p.id === id);
              return (
                <div key={id} className="text-center">
                  <div className="text-lg font-semibold">{count.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{provider?.name || id}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 预设服务商 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.presetProviders}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PRESET_PROVIDERS.map(provider => {
            const status = presetStatus[provider.id] || { enabled: false, connected: false };
            const isTesting = testingStatus[provider.id];
            const showKey = showApiKeys[provider.id];
            
            return (
              <div key={provider.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{provider.displayName}</h4>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {provider.requiresApiKey ? t.requirements : t.noRequirements}
                        </Badge>
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" 
                           className="text-xs text-blue-500 hover:underline">
                          {t.website}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.connected && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {!status.connected && status.apiKey && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Switch
                      checked={status.enabled}
                      onCheckedChange={(enabled) => handlePresetToggle(provider.id, enabled)}
                    />
                  </div>
                </div>

                {provider.requiresApiKey && (
                  <div className="space-y-2">
                    <Label htmlFor={`key-${provider.id}`}>{t.apiKey}</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id={`key-${provider.id}`}
                          type={showKey ? 'text' : 'password'}
                          placeholder={provider.apiKeyPlaceholder}
                          value={status.apiKey || ''}
                          onChange={(e) => handlePresetApiKeyChange(provider.id, e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testPresetConnection(provider.id)}
                        disabled={!status.apiKey || isTesting}
                      >
                        {isTesting ? (
                          <>
                            <TestTube className="h-4 w-4 mr-1 animate-spin" />
                            {t.testing}
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-1" />
                            {t.testConnection}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 自定义服务商 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            {t.customProviders}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewProviderForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addCustom}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customProviders.map(provider => (
            <div key={provider.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-gray-500">{provider.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {provider.apiBase} • {provider.model}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={provider.enabled ? "default" : "secondary"}>
                    {provider.enabled ? t.enabled : t.disabled}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCustomProvider(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {showNewProviderForm && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">{t.addCustom}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.providerName} *</Label>
                  <Input
                    value={newProvider.name || ''}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如: 我的AI服务"
                  />
                </div>
                <div>
                  <Label>{t.apiBase} *</Label>
                  <Input
                    value={newProvider.apiBase || ''}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, apiBase: e.target.value }))}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <Label>{t.model} *</Label>
                  <Input
                    value={newProvider.model || ''}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="gpt-3.5-turbo"
                  />
                </div>
                <div>
                  <Label>{t.apiKey}</Label>
                  <Input
                    type="password"
                    value={newProvider.apiKey || ''}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-..."
                  />
                </div>
              </div>
              <div>
                <Label>{t.descriptionOptional}</Label>
                <Input
                  value={newProvider.description || ''}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="自定义AI服务描述"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomProvider}>
                  <Save className="h-4 w-4 mr-1" />
                  {t.save}
                </Button>
                <Button variant="outline" onClick={() => setShowNewProviderForm(false)}>
                  {t.cancel}
                </Button>
              </div>
            </div>
          )}

          {customProviders.length === 0 && !showNewProviderForm && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>暂无自定义服务商</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 默认服务商选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t.defaultProvider}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getAvailableProviders().length > 0 ? (
            <Select value={defaultProvider} onValueChange={updateDefaultProvider}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectDefault} />
              </SelectTrigger>
              <SelectContent>
                {getAvailableProviders().map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t.noProviders}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}