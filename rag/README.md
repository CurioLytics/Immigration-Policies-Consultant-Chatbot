# PDF RAG System (Vietnamese Support)

Answers questions about PDF documents using LangChain, Qdrant, Gemini, Jina, PyMuPDF, pdf2image, and Pytesseract.

## Prerequisites

*   Python 3.11
*   Docker & Docker Compose
*   Tesseract OCR (with Vietnamese language: `vie`)
*   Poppler

*Ensure Tesseract and Poppler binaries are in your system's PATH.*

## Setup

1.  **Clone:**
    ```bash
    git clone <repository-url>
    cd rag-tool
    ```
2.  **Environment & Dependencies:**
    ```bash
    # Create & activate virtualenv (e.g., venv)
    python -m venv .venv
    source .venv/bin/activate # Windows: .venv\Scripts\activate

    # Install dependencies
    pip install uv
    uv sync --system # Installs from uv.lock
    ```
3.  **Environment Variables:**
    Create a `.env` file in `rag-tool/` with your API keys:
    ```dotenv
    # --- .env --- 
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
    JINA_API_KEY="YOUR_JINA_API_KEY"
    # Optional: Add TESSERACT_CMD / POPPLER_PATH if not in PATH
    # TESSERACT_CMD="/path/to/tesseract"
    # POPPLER_PATH="/path/to/poppler/bin"
    ```
    *   Get keys from Google AI Studio & Jina AI.

4.  **Start Database:**
    ```bash
    docker-compose up -d
    ```

## Usage

1.  **Ensure Prerequisites:** Activated env, running Docker container.
2.  **Modify PDF (Optional):** Change the PDF path in `pdf_rag.ipynb` (`build_index_from_local(...)`). Default uses `sgk_dia_ly.pdf` or `2024-wttc-introduction-to-ai.pdf`.
3.  **Run Notebook:**
    ```bash
    jupyter lab # or jupyter notebook
    ```
    Open `pdf_rag.ipynb` and run the cells. It will process the PDF, store it in Qdrant, and allow you to ask questions.

## Stopping

1.  **Stop Database:** `docker-compose down`
2.  **Deactivate Env:** `deactivate`
