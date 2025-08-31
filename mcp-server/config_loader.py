import yaml
import os
from typing import Dict, Any, Optional
from pathlib import Path

class ConfigLoader:
    """YAML配置文件加载器"""
    
    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self._config_cache: Dict[str, Any] = {}
    
    def load_config(self, config_name: str = "app") -> Dict[str, Any]:
        """加载指定的配置文件"""
        if config_name in self._config_cache:
            return self._config_cache[config_name]
        
        config_path = self.config_dir / f"{config_name}.yaml"
        
        if not config_path.exists():
            # 尝试从项目根目录加载
            root_config_path = Path(__file__).parent.parent / "config" / f"{config_name}.yaml"
            if root_config_path.exists():
                config_path = root_config_path
            else:
                raise FileNotFoundError(f"配置文件未找到: {config_path}")
        
        try:
            with open(config_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
                self._config_cache[config_name] = config
                return config
        except yaml.YAMLError as e:
            raise ValueError(f"配置文件格式错误: {e}")
        except Exception as e:
            raise RuntimeError(f"加载配置文件失败: {e}")
    
    def get_app_config(self) -> Dict[str, Any]:
        """获取应用配置"""
        return self.load_config("app")
    
    def get_app_info(self) -> Dict[str, Any]:
        """获取应用基本信息"""
        config = self.get_app_config()
        return config.get("app", {})
    
    def get_math_config(self) -> Dict[str, Any]:
        """获取数学题目生成配置"""
        config = self.get_app_config()
        return config.get("math_generation", {})
    
    def get_ai_config(self) -> Dict[str, Any]:
        """获取AI配置"""
        config = self.get_app_config()
        return config.get("ai", {})
    
    def get_mcp_config(self) -> Dict[str, Any]:
        """获取MCP服务器配置"""
        config = self.get_app_config()
        return config.get("mcp_server", {})
    
    def get_export_config(self) -> Dict[str, Any]:
        """获取导出配置"""
        config = self.get_app_config()
        return config.get("export", {})
    
    def get_licenses_info(self) -> Dict[str, Any]:
        """获取许可证信息"""
        config = self.get_app_config()
        return config.get("licenses", {})
    
    def get_operation_types(self) -> list:
        """获取支持的运算类型"""
        math_config = self.get_math_config()
        return math_config.get("operation_types", [])
    
    def get_knowledge_points(self) -> list:
        """获取知识点配置"""
        math_config = self.get_math_config()
        return math_config.get("knowledge_points", [])
    
    def get_difficulty_levels(self) -> Dict[int, Dict[str, Any]]:
        """获取难度等级配置"""
        math_config = self.get_math_config()
        return math_config.get("difficulty_levels", {})
    
    def get_ai_services(self) -> Dict[str, Dict[str, Any]]:
        """获取AI服务配置"""
        ai_config = self.get_ai_config()
        return ai_config.get("services", {})
    
    def update_config(self, config_name: str, updates: Dict[str, Any]) -> None:
        """更新配置（仅内存中）"""
        if config_name in self._config_cache:
            self._config_cache[config_name].update(updates)
    
    def clear_cache(self) -> None:
        """清空配置缓存"""
        self._config_cache.clear()

# 全局配置加载器实例
config_loader = ConfigLoader()

# 便捷函数
def get_app_info() -> Dict[str, Any]:
    """获取应用信息的便捷函数"""
    return config_loader.get_app_info()

def get_app_version() -> str:
    """获取应用版本号"""
    app_info = get_app_info()
    return app_info.get("version", "1.0.0-alpha")

def get_app_name(language: str = "zh-CN") -> str:
    """获取应用名称"""
    app_info = get_app_info()
    if language == "en-US":
        return app_info.get("name_en", "Primary School Math Question Generator")
    return app_info.get("name", "小学数学题目生成器")

def get_supported_languages() -> list:
    """获取支持的语言列表"""
    app_info = get_app_info()
    return app_info.get("supported_languages", ["zh-CN", "en-US"])

def get_licenses_info() -> Dict[str, Any]:
    """获取许可证信息"""
    return config_loader.get_licenses_info()

# 环境变量覆盖配置
def apply_env_overrides() -> None:
    """应用环境变量覆盖配置"""
    # AI API配置
    ai_api_key = os.getenv("AI_API_KEY")
    ai_api_base = os.getenv("AI_API_BASE")
    ai_model = os.getenv("AI_MODEL")
    
    if ai_api_key or ai_api_base or ai_model:
        ai_config = config_loader.get_ai_config()
        default_service = ai_config.get("default_service", "deepseek")
        services = ai_config.get("services", {})
        
        if default_service in services:
            if ai_api_key:
                services[default_service]["api_key"] = ai_api_key
            if ai_api_base:
                services[default_service]["api_base"] = ai_api_base
            if ai_model:
                services[default_service]["model"] = ai_model
    
    # MCP服务器配置
    mcp_host = os.getenv("MCP_HOST")
    mcp_port = os.getenv("MCP_PORT")
    
    if mcp_host or mcp_port:
        mcp_config = config_loader.get_mcp_config()
        if mcp_host:
            mcp_config["host"] = mcp_host
        if mcp_port:
            mcp_config["port"] = int(mcp_port)

# 初始化时应用环境变量覆盖
apply_env_overrides()