#!/usr/bin/env python3
"""
Quick start script to check dependencies and guide user setup
"""
import sys
import subprocess
import os


def check_python_version():
    """Check if Python version is 3.7+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print(f"❌ Python 版本过低: {version.major}.{version.minor}")
        print("需要 Python 3.7 或更高版本")
        return False
    print(f"✓ Python 版本: {version.major}.{version.minor}.{version.micro}")
    return True


def check_pip():
    """Check if pip is installed"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"],
                       capture_output=True, check=True)
        print("✓ pip 已安装")
        return True
    except subprocess.CalledProcessError:
        print("❌ pip 未安装")
        return False


def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'PyPDF2',
        'pdfplumber',
        'python-docx',
        'pylatexenc',
        'openai',
        'requests',
        'Pillow',
        'python-dotenv'
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_').lower())
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} (缺失)")
            missing.append(package)

    return missing


def install_dependencies():
    """Install missing dependencies"""
    print("\n正在安装依赖包...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
                       check=True)
        print("\n✓ 依赖包安装成功！")
        return True
    except subprocess.CalledProcessError:
        print("\n❌ 依赖包安装失败")
        print("请手动运行: pip install -r requirements.txt")
        return False


def check_env_file():
    """Check if .env file is configured"""
    if not os.path.exists('.env'):
        print("\n⚠️  警告: .env 文件不存在")
        print("正在从 .env.example 创建...")
        try:
            with open('.env.example', 'r') as src:
                with open('.env', 'w') as dst:
                    dst.write(src.read())
            print("✓ .env 文件已创建")
        except Exception as e:
            print(f"❌ 创建失败: {e}")
            return False

    # Check if API key is configured
    try:
        with open('.env', 'r') as f:
            content = f.read()
            if 'your_' in content or 'API_KEY=' not in content:
                print("\n⚠️  警告: API 密钥未配置")
                print("请编辑 .env 文件，添加你的 API 密钥")
                return False
    except Exception as e:
        print(f"❌ 读取 .env 失败: {e}")
        return False

    print("✓ .env 文件已配置")
    return True


def main():
    """Main function"""
    print("=" * 60)
    print("Auto Homework Question Qualifier - 快速启动检查")
    print("=" * 60)
    print()

    # Check Python version
    print("1. 检查 Python 版本...")
    if not check_python_version():
        sys.exit(1)
    print()

    # Check pip
    print("2. 检查 pip...")
    if not check_pip():
        sys.exit(1)
    print()

    # Check dependencies
    print("3. 检查依赖包...")
    missing = check_dependencies()

    if missing:
        print(f"\n缺少 {len(missing)} 个依赖包")
        response = input("\n是否自动安装? (y/n): ").lower().strip()

        if response == 'y':
            if not install_dependencies():
                sys.exit(1)
        else:
            print("\n请手动安装依赖:")
            print("  pip install -r requirements.txt")
            sys.exit(1)
    else:
        print("\n✓ 所有依赖包已安装")
    print()

    # Check .env file
    print("4. 检查配置文件...")
    env_ok = check_env_file()
    print()

    # Create output directory
    if not os.path.exists('output'):
        os.makedirs('output')
        print("✓ 创建输出目录: output/")
        print()

    # Summary
    print("=" * 60)
    print("检查完成！")
    print("=" * 60)
    print()

    if env_ok:
        print("✓ 系统已就绪，可以开始使用")
        print()
        print("运行示例:")
        print("  python main.py homework.pdf")
        print("  python main.py questions.docx")
    else:
        print("⚠️  请先配置 API 密钥")
        print()
        print("步骤:")
        print("1. 编辑 .env 文件")
        print("2. 添加你的 DeepSeek 或 OpenAI API 密钥")
        print("3. 保存文件")
        print()
        print("然后运行:")
        print("  python main.py homework.pdf")

    print()
    print("查看完整文档: cat README.md")
    print("查看帮助: python main.py --help")
    print()


if __name__ == '__main__':
    main()
