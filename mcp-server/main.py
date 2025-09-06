from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import threading
import time
import uuid
from typing import Dict, Any, Optional, List
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr
import json
import os
import httpx
from datetime import datetime
from config_loader import config_loader, get_app_info, get_app_version, get_app_name

# 从YAML配置加载应用信息
app_info = get_app_info()
app_version = get_app_version()

app = FastAPI(
    title=app_info.get("name_en", "MCP Server"), 
    description=app_info.get("description_en", "数学计算验证服务器"),
    version=app_version
)

# 从配置加载CORS设置
mcp_config = config_loader.get_mcp_config()
cors_origins = mcp_config.get("cors_origins", ["http://localhost:5173"])

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储任务状态和结果
tasks: Dict[str, Dict[str, Any]] = {}
ai_tasks: Dict[str, Dict[str, Any]] = {}  # AI分析任务

# 从YAML配置加载AI设置
ai_config = config_loader.get_ai_config()
default_service = ai_config.get("default_service", "deepseek")
ai_services = ai_config.get("services", {})

# AI 解答配置（优先使用环境变量）
AI_CONFIG = {
    "api_base": os.getenv("AI_API_BASE", ai_services.get(default_service, {}).get("api_base", "https://api.deepseek.com")),
    "api_key": os.getenv("AI_API_KEY", ""),
    "model": os.getenv("AI_MODEL", ai_services.get(default_service, {}).get("model", "deepseek-chat")),
    "timeout": ai_config.get("timeout", 30)
}

# 定义数据模型
class CodeExecutionRequest(BaseModel):
    code: str
    timeout: Optional[int] = 10

class TaskResult(BaseModel):
    task_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None

# AI解答相关数据模型
class MathQuestion(BaseModel):
    expression: str
    answer: Optional[float] = None
    operation: Optional[str] = None
    knowledge_point: Optional[str] = None
    difficulty: Optional[int] = None

class AIAnalysisRequest(BaseModel):
    question: MathQuestion
    language: Optional[str] = "zh-CN"
    detail_level: Optional[str] = "standard"  # "simple", "standard", "detailed"

class AIAnalysisResult(BaseModel):
    task_id: str
    status: str
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class SolutionStep(BaseModel):
    step_number: int
    description: str
    calculation: Optional[str] = None
    result: Optional[str] = None
    explanation: Optional[str] = None

class AIAnalysis(BaseModel):
    problem_understanding: str  # 题目理解
    solution_approach: str      # 解题思路
    solution_steps: List[SolutionStep]  # 解题步骤
    key_concepts: List[str]     # 关键概念
    common_mistakes: List[str]  # 常见错误
    tips: List[str]            # 解题技巧
    difficulty_analysis: str    # 难度分析
    alternative_methods: List[str]  # 其他解法

# 存储用户自定义AI配置
custom_ai_configs: Dict[str, Dict[str, Any]] = {}

# 获取有效的AI配置（优先使用自定义配置）
def get_effective_ai_config() -> Dict[str, Any]:
    """获取有效的AI配置，优先使用用户自定义的配置"""
    # 查找启用的自定义API配置
    for config_id, config in custom_ai_configs.items():
        if config.get("enabled", False) and config.get("api_key"):
            return {
                "api_base": config["api_base"],
                "api_key": config["api_key"],
                "model": config["model"],
                "timeout": config.get("timeout", 30)
            }
    
    # 如果没有自定义配置，使用默认配置
    return AI_CONFIG

# AI分析数学题目
async def analyze_math_question_with_ai(question: MathQuestion, language: str = "zh-CN", detail_level: str = "standard") -> Dict[str, Any]:
    """使用AI分析数学题目并生成解答步骤"""
    
    # 获取有效的AI配置
    effective_config = get_effective_ai_config()
    
    if not effective_config["api_key"]:
        return {"error": "AI API Key 未配置，请在配置文件或环境变量中设置AI_API_KEY"}
    
    # 构造提示词
    prompt = create_analysis_prompt(question, language, detail_level)
    
    try:
        print(f"正在使用模型 {effective_config['model']} 分析题目: {question.expression}")
        async with httpx.AsyncClient(timeout=effective_config["timeout"]) as client:
            response = await client.post(
                f"{effective_config['api_base']}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {effective_config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": effective_config["model"],
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一个专业的小学数学老师，擅长解释数学题目和指导学生逐步解题。请用清晰、通俗易懂的语言提供详细的解题步骤和解释。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )
            
            if response.status_code != 200:
                error_text = await response.aread()
                print(f"AI API请求失败: {response.status_code} - {error_text}")
                return {"error": f"AI API 请求失败: {response.status_code} - {error_text.decode('utf-8')}"}
            
            result = response.json()
            ai_response = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # 解析AI响应并结构化
            analysis = parse_ai_response(ai_response, question)
            print(f"AI分析完成，生成了 {len(analysis.solution_steps)} 个解题步骤")
            return {"analysis": analysis}
            
    except httpx.TimeoutException:
        error_msg = f"AI API请求超时 ({effective_config['timeout']}秒)，请稍后重试"
        print(error_msg)
        return {"error": error_msg}
    except httpx.NetworkError as e:
        error_msg = f"网络连接错误: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
    except Exception as e:
        error_msg = f"AI分析失败: {str(e)}"
        print(error_msg)
        return {"error": error_msg}

def create_analysis_prompt(question: MathQuestion, language: str, detail_level: str) -> str:
    """构造AI分析提示词"""
    
    if language == "zh-CN":
        prompt = f"""
请分析以下数学题目并提供详细的解答步骤：

题目：{question.expression}
"""
        if question.answer is not None:
            prompt += f"答案：{question.answer}\n"
        if question.operation:
            prompt += f"运算类型：{question.operation}\n"
        if question.knowledge_point:
            prompt += f"知识点：{question.knowledge_point}\n"
        
        prompt += f"""
请按照以下格式提供分析：

1. 题目理解：简述这道题要求解决什么问题
2. 解题思路：说明解题的基本方法和思路
3. 解题步骤：逐步详细说明每一步的计算过程
4. 关键概念：涉及的数学概念
5. 常见错误：学生容易犯的错误
6. 解题技巧：有助于解题的技巧和方法
7. 难度分析：该题的难度等级和原因
8. 其他解法：如果有的话，提供其他解题方法

请确保解释通俗易懂，适合小学生理解。
"""
    else:
        # 英文提示词
        prompt = f"""
Please analyze the following math problem and provide detailed solution steps:

Problem: {question.expression}
"""
        if question.answer is not None:
            prompt += f"Answer: {question.answer}\n"
        if question.operation:
            prompt += f"Operation Type: {question.operation}\n"
        if question.knowledge_point:
            prompt += f"Knowledge Point: {question.knowledge_point}\n"
        
        prompt += """
Please provide analysis in the following format:

1. Problem Understanding: Briefly describe what this problem asks to solve
2. Solution Approach: Explain the basic method and approach for solving
3. Solution Steps: Step-by-step detailed explanation of each calculation
4. Key Concepts: Mathematical concepts involved
5. Common Mistakes: Errors students often make
6. Solving Tips: Helpful techniques and methods for solving
7. Difficulty Analysis: Difficulty level and reasons
8. Alternative Methods: Other solving methods if available

Please ensure explanations are clear and suitable for elementary school students.
"""
    
    return prompt

def parse_ai_response(ai_response: str, question: MathQuestion) -> AIAnalysis:
    """解析AI响应并结构化"""
    
    # 简单的文本解析，实际中可以使用更复杂的NLP技术
    lines = ai_response.split('\n')
    
    analysis_data = {
        "problem_understanding": "",
        "solution_approach": "",
        "solution_steps": [],
        "key_concepts": [],
        "common_mistakes": [],
        "tips": [],
        "difficulty_analysis": "",
        "alternative_methods": []
    }
    
    current_section = None
    step_counter = 1
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 检测章节标题
        if any(keyword in line.lower() for keyword in ['题目理解', 'problem understanding']):
            current_section = 'problem_understanding'
            continue
        elif any(keyword in line.lower() for keyword in ['解题思路', 'solution approach']):
            current_section = 'solution_approach'
            continue
        elif any(keyword in line.lower() for keyword in ['解题步骤', 'solution steps']):
            current_section = 'solution_steps'
            continue
        elif any(keyword in line.lower() for keyword in ['关键概念', 'key concepts']):
            current_section = 'key_concepts'
            continue
        elif any(keyword in line.lower() for keyword in ['常见错误', 'common mistakes']):
            current_section = 'common_mistakes'
            continue
        elif any(keyword in line.lower() for keyword in ['解题技巧', 'solving tips']):
            current_section = 'tips'
            continue
        elif any(keyword in line.lower() for keyword in ['难度分析', 'difficulty analysis']):
            current_section = 'difficulty_analysis'
            continue
        elif any(keyword in line.lower() for keyword in ['其他解法', 'alternative methods']):
            current_section = 'alternative_methods'
            continue
        
        # 根据当前章节处理内容
        if current_section == 'problem_understanding':
            analysis_data['problem_understanding'] += line + " "
        elif current_section == 'solution_approach':
            analysis_data['solution_approach'] += line + " "
        elif current_section == 'solution_steps':
            if line.startswith(('步骤', 'step', str(step_counter))):
                analysis_data['solution_steps'].append(SolutionStep(
                    step_number=step_counter,
                    description=line,
                    calculation="",
                    result="",
                    explanation=""
                ))
                step_counter += 1
            elif analysis_data['solution_steps']:
                # 添加到最后一步的解释
                last_step = analysis_data['solution_steps'][-1]
                last_step.explanation += line + " "
        elif current_section in ['key_concepts', 'common_mistakes', 'tips', 'alternative_methods']:
            if line.startswith(('-', '*', '•')) or line[0].isdigit():
                analysis_data[current_section].append(line.lstrip('-*•').strip())
            elif analysis_data[current_section]:
                analysis_data[current_section][-1] += " " + line
        elif current_section == 'difficulty_analysis':
            analysis_data['difficulty_analysis'] += line + " "
    
    # 清理空白
    for key in ['problem_understanding', 'solution_approach', 'difficulty_analysis']:
        analysis_data[key] = analysis_data[key].strip()
    
    return AIAnalysis(**analysis_data)

# 异步执行AI分析任务
async def run_ai_analysis_task(task_id: str, question: MathQuestion, language: str, detail_level: str):
    ai_tasks[task_id]["status"] = "running"
    ai_tasks[task_id]["started_at"] = datetime.now().isoformat()
    
    try:
        result = await analyze_math_question_with_ai(question, language, detail_level)
        ai_tasks[task_id].update(result)
        ai_tasks[task_id]["status"] = "completed" if "analysis" in result else "failed"
        ai_tasks[task_id]["completed_at"] = datetime.now().isoformat()
    except Exception as e:
        ai_tasks[task_id]["error"] = str(e)
        ai_tasks[task_id]["status"] = "failed"
        ai_tasks[task_id]["completed_at"] = datetime.now().isoformat()

# 安全检查函数
def is_code_safe(code: str) -> bool:
    """检查代码是否安全"""
    # 禁止的模块和函数
    forbidden_patterns = [
        'import os', 'import sys', 'import subprocess', 'import socket',
        'os.', 'sys.', 'subprocess.', 'socket.',
        '__', 'exec', 'eval', 'compile', 'open', 'file',
        'import shutil', 'import pickle', 'import json'
    ]
    
    for pattern in forbidden_patterns:
        if pattern in code:
            return False
    return True

# 执行代码的函数
def execute_code_safely(code: str, timeout: int = 10) -> Dict[str, Any]:
    if not is_code_safe(code):
        return {"error": "代码包含禁止的操作"}
    
    try:
        # 清理代码，移除可能的等号和空格
        clean_code = code.replace('=', '').strip()
        
        # 尝试使用sympy解析和计算表达式
        try:
            # 使用sympy解析表达式
            expr = parse_expr(clean_code, evaluate=False)
            # 计算表达式
            result = expr.evalf()
            return {"result": str(result)}
        except Exception as sympy_error:
            # 如果sympy解析失败，尝试使用eval计算
            try:
                result = eval(clean_code, {"__builtins__": {}}, {"sp": sp})
                return {"result": str(result)}
            except Exception as eval_error:
                # 如果eval也失败，返回原始表达式计算
                try:
                    # 处理分数运算
                    if '/' in clean_code and 'Fraction' not in clean_code:
                        # 简单的分数处理
                        parts = clean_code.replace(' ', '').replace('+', ' + ').replace('-', ' - ').replace('*', ' * ').replace('/', ' / ').split()
                        # 这里可以添加更复杂的分数处理逻辑
                        pass
                    result = eval(clean_code)
                    return {"result": str(result)}
                except Exception as final_error:
                    return {"error": f"执行错误: {str(final_error)}"}
    except Exception as e:
        return {"error": f"执行错误: {str(e)}"}

# 异步执行任务
def run_task(task_id: str, code: str, timeout: int):
    tasks[task_id]["status"] = "running"
    
    # 在新线程中执行代码
    result = execute_code_safely(code, timeout)
    
    tasks[task_id].update(result)
    tasks[task_id]["status"] = "completed" if "result" in result else "failed"

@app.post("/execute", response_model=TaskResult)
async def submit_code(request: CodeExecutionRequest):
    task_id = str(uuid.uuid4())
    
    # 初始化任务
    tasks[task_id] = {
        "status": "submitted",
        "result": None,
        "error": None
    }
    
    # 在后台线程中执行任务
    thread = threading.Thread(target=run_task, args=(task_id, request.code, request.timeout))
    thread.start()
    
    return TaskResult(task_id=task_id, status="submitted")

@app.get("/result/{task_id}", response_model=TaskResult)
async def get_result(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = tasks[task_id]
    return TaskResult(
        task_id=task_id,
        status=task["status"],
        result=task.get("result"),
        error=task.get("error")
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# AI解答相关端点
@app.post("/ai/analyze", response_model=AIAnalysisResult)
async def submit_ai_analysis(request: AIAnalysisRequest):
    """提交AI分析任务"""
    task_id = str(uuid.uuid4())
    
    # 初始化AI分析任务
    ai_tasks[task_id] = {
        "status": "submitted",
        "analysis": None,
        "error": None,
        "submitted_at": datetime.now().isoformat()
    }
    
    # 在后台异步执行AI分析
    asyncio.create_task(run_ai_analysis_task(
        task_id, 
        request.question, 
        request.language or "zh-CN", 
        request.detail_level or "standard"
    ))
    
    return AIAnalysisResult(task_id=task_id, status="submitted")

@app.get("/ai/result/{task_id}", response_model=AIAnalysisResult)
async def get_ai_analysis_result(task_id: str):
    """获取AI分析结果"""
    if task_id not in ai_tasks:
        raise HTTPException(status_code=404, detail="AI分析任务不存在")
    
    task = ai_tasks[task_id]
    return AIAnalysisResult(
        task_id=task_id,
        status=task["status"],
        analysis=task.get("analysis"),
        error=task.get("error")
    )

@app.get("/ai/config")
async def get_ai_config():
    """获取AI配置信息（不返回API Key）"""
    effective_config = get_effective_ai_config()
    return {
        "api_base": effective_config["api_base"],
        "model": effective_config["model"],
        "has_api_key": bool(effective_config["api_key"]),
        "timeout": effective_config["timeout"]
    }

@app.post("/ai/config")
async def update_ai_config(config: dict):
    """更新AI配置"""
    if "api_key" in config:
        AI_CONFIG["api_key"] = config["api_key"]
    if "api_base" in config:
        AI_CONFIG["api_base"] = config["api_base"]
    if "model" in config:
        AI_CONFIG["model"] = config["model"]
    if "timeout" in config:
        AI_CONFIG["timeout"] = config["timeout"]
    
    return {"message": "AI配置已更新"}

# 自定义AI配置管理
class CustomAIConfig(BaseModel):
    id: str
    name: str
    api_base: str
    api_key: str
    model: str
    description: Optional[str] = ""
    enabled: bool = True
    timeout: Optional[int] = 30

@app.post("/ai/custom-config")
async def save_custom_ai_config(config: CustomAIConfig):
    """保存用户自定义AI配置"""
    custom_ai_configs[config.id] = config.dict()
    return {"message": "自定义AI配置已保存", "id": config.id}

@app.get("/ai/custom-configs")
async def get_custom_ai_configs():
    """获取所有自定义AI配置（不返回API密钥）"""
    safe_configs = {}
    for config_id, config in custom_ai_configs.items():
        safe_configs[config_id] = {
            **config,
            "api_key": "***" if config.get("api_key") else "",  # 隐藏API密钥
            "has_api_key": bool(config.get("api_key"))
        }
    return {"configs": safe_configs}

@app.delete("/ai/custom-config/{config_id}")
async def delete_custom_ai_config(config_id: str):
    """删除自定义AI配置"""
    if config_id in custom_ai_configs:
        del custom_ai_configs[config_id]
        return {"message": "自定义AI配置已删除"}
    else:
        raise HTTPException(status_code=404, detail="配置不存在")

@app.get("/ai/tasks")
async def list_ai_tasks(limit: int = 50):
    """获取AI任务列表"""
    task_list = []
    for task_id, task_data in list(ai_tasks.items())[-limit:]:
        task_list.append({
            "task_id": task_id,
            "status": task_data["status"],
            "submitted_at": task_data.get("submitted_at"),
            "completed_at": task_data.get("completed_at"),
            "has_error": "error" in task_data and task_data["error"] is not None
        })
    
    return {"tasks": task_list}

# 清理过期任务的定时任务
# 配置API端点
@app.get("/api/config")
async def get_config():
    """获取完整的应用配置"""
    try:
        config = config_loader.get_app_config()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取配置失败: {str(e)}")

@app.get("/api/app-info")
async def get_app_info_api():
    """获取应用基本信息"""
    try:
        return get_app_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取应用信息失败: {str(e)}")

@app.get("/api/version")
async def get_version():
    """获取应用版本"""
    try:
        return {"version": get_app_version()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取版本信息失败: {str(e)}")

@app.get("/api/operation-types")
async def get_operation_types():
    """获取支持的运算类型"""
    try:
        return {"operation_types": config_loader.get_operation_types()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取运算类型失败: {str(e)}")

@app.get("/api/knowledge-points")
async def get_knowledge_points():
    """获取知识点配置"""
    try:
        return {"knowledge_points": config_loader.get_knowledge_points()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取知识点失败: {str(e)}")

@app.get("/api/difficulty-levels")
async def get_difficulty_levels():
    """获取难度等级配置"""
    try:
        return {"difficulty_levels": config_loader.get_difficulty_levels()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取难度等级失败: {str(e)}")

@app.get("/api/licenses")
async def get_licenses():
    """获取许可证信息"""
    try:
        return config_loader.get_licenses_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取许可证信息失败: {str(e)}")

@app.get("/api/ai-services")
async def get_ai_services():
    """获取AI服务配置（不返回敏感信息）"""
    try:
        ai_config = config_loader.get_ai_config()
        services = ai_config.get("services", {})
        # 移除API密钥等敏感信息
        safe_services = {}
        for service_name, service_config in services.items():
            safe_services[service_name] = {
                "api_base": service_config.get("api_base", ""),
                "model": service_config.get("model", ""),
                "has_api_key": bool(service_config.get("api_key", "")),
                "description": service_config.get("description", "")
            }
        return {
            "default_service": ai_config.get("default_service", "deepseek"),
            "timeout": ai_config.get("timeout", 30),
            "services": safe_services
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取AI服务配置失败: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    print("MCP服务器启动，支持AI解答功能和YAML配置")
    print(f"应用名称: {get_app_name()}")
    print(f"应用版本: {get_app_version()}")
    print(f"AI模型: {AI_CONFIG['model']}")
    print(f"API地址: {AI_CONFIG['api_base']}")
    print(f"API Key状态: {'✓ 已配置' if AI_CONFIG['api_key'] else '✗ 未配置'}")
    
    # 加载配置并检查
    try:
        config = config_loader.get_app_config()
        print(f"配置文件加载成功，包含 {len(config.get('math_generation', {}).get('operation_types', []))} 种运算类型")
    except Exception as e:
        print(f"配置文件加载失败: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)