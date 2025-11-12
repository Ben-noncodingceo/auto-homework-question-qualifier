#!/bin/bash
# Example script to demonstrate the tool

echo "Auto Homework Question Qualifier - Example Run"
echo "=============================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements if needed
if [ ! -f "venv/installed" ]; then
    echo "Installing requirements..."
    pip install -r requirements.txt
    touch venv/installed
fi

echo ""
echo "To run the tool, use:"
echo "  python main.py <your_file.pdf>"
echo ""
echo "For example (if you have a PDF file):"
echo "  python main.py homework.pdf"
echo ""
echo "Options:"
echo "  --no-preview      Skip PDF preview generation"
echo "  --no-analysis     Skip AI difficulty analysis"
echo "  -o OUTPUT_DIR     Specify output directory"
echo ""
echo "Make sure to configure your API key in .env file!"
echo "See .env.example for reference."
