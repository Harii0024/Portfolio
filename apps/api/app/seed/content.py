from __future__ import annotations

SEED_PROFILE: dict = {
    "name": "Hariharan Pushparaj",
    "title": "Generative AI Engineer | LLMs | AI Agents | RAG | MCP",
    "location": "Chennai, India",
    "heroTagline": (
        "Enterprise-grade LLM applications, multi-agent systems, and document intelligence "
        "pipelines — OpenAI, Gemini, Azure OpenAI, AWS Bedrock, LangChain, LangGraph, "
        "LlamaIndex, and MCP."
    ),
    "summary": (
        "Generative AI Engineer with 2+ years of experience building enterprise-grade LLM "
        "applications, multi-agent systems, and document intelligence pipelines using OpenAI, "
        "Gemini, Azure OpenAI, AWS Bedrock, LangChain, LangGraph, LlamaIndex, and Model Context "
        "Protocol (MCP).\n\n"
        "Skilled in Retrieval-Augmented Generation (RAG), vector search, knowledge graphs, "
        "prompt engineering, OCR, and speech-to-text, with experience integrating enterprise "
        "data sources, APIs, and databases into production AI systems.\n\n"
        "Proficient in Python, FastAPI, PostgreSQL, MongoDB, Redis, and Neo4j, delivering "
        "scalable microservices across enterprise productivity, financial services, and "
        "recruitment domains."
    ),
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
}

SEED_EXPERIENCES: list[dict] = [
    {
        "company": "PrayagAI",
        "role": "AI Engineer",
        "location": "Chennai, India",
        "startDate": "2026-03",
        "endDate": None,
        "order": 0,
        "bullets": [
            (
                "Architect enterprise-grade Generative AI applications using OpenAI, LangChain, "
                "LangGraph, and MCP, supporting 200+ concurrent users."
            ),
            (
                "Reduced manual information-lookup time by 40% through conversational assistants "
                "that retrieve and reason over enterprise knowledge across 5 business platforms."
            ),
            (
                "Automated contextual Q&A and document understanding workflows using RAG, OCR, "
                "and speech-to-text, processing 500+ documents/conversations per week."
            ),
            (
                "Connected Outlook, OneDrive, Slack, Fireflies AI, and Taghash through REST APIs, "
                "eliminating manual data pulls for end users."
            ),
            (
                "Modeled Neo4j knowledge and relationship graphs spanning 10,000+ entities to "
                "provide relationship-aware context and improve retrieval relevance."
            ),
            (
                "Orchestrated multi-agent workflows for task execution and tool selection, "
                "reducing routine task turnaround by 35%."
            ),
        ],
        "projects": [
            {
                "name": "MINDSPAN — Enterprise Generative AI & Knowledge Platform",
                "summary": (
                    "Unified information across 6 workplace applications through a single "
                    "conversational interface."
                ),
                "bullets": [
                    (
                        "Unified information across 6 workplace applications through a single "
                        "conversational interface, reducing context switching for end users."
                    ),
                    (
                        "Standardized AI-agent access to enterprise tools through MCP-based "
                        "integration, reducing new-connector onboarding time to under 3 days."
                    ),
                    (
                        "Combined Neo4j relationship graphs with retrieval workflows to enrich "
                        "LLM context, improving answer accuracy by 25%."
                    ),
                    (
                        "Converted unstructured documents and audio into structured data using OCR "
                        "and speech-to-text, processing 300+ items/day."
                    ),
                ],
                "stack": [
                    "Python",
                    "FastAPI",
                    "OpenAI",
                    "LangChain",
                    "LangGraph",
                    "MCP",
                    "Neo4j",
                ],
            },
            {
                "name": "Smart Recruitment Platform",
                "summary": (
                    "End-to-end AI recruitment with resume screening, MCQs, and real-time voice "
                    "interviews."
                ),
                "bullets": [
                    (
                        "Delivered an end-to-end AI recruitment platform covering resume "
                        "screening, MCQ assessments, and AI interviews, reducing screening time "
                        "per candidate by 50%."
                    ),
                    (
                        "Built a real-time voice interview experience using LiveKit, OpenAI, and "
                        "Gemini, supporting 20+ concurrent candidate interviews."
                    ),
                    (
                        "Engineered stage-based interview agents that dynamically adapt "
                        "follow-up questions to candidate responses, reducing irrelevant "
                        "questions by 30%."
                    ),
                    (
                        "Automated structured interview scoring and reporting, reducing manual "
                        "reviewer time by 1.5+ hours per candidate."
                    ),
                ],
                "stack": [
                    "Python",
                    "FastAPI",
                    "OpenAI",
                    "Gemini",
                    "LiveKit",
                    "LangChain",
                    "LangGraph",
                    "MongoDB",
                    "Redis",
                ],
            },
        ],
    },
    {
        "company": "Thapovan Info Systems",
        "role": "Junior Programming Analyst",
        "location": "Chennai, India",
        "startDate": "2024-09",
        "endDate": "2026-02",
        "order": 1,
        "bullets": [
            (
                "Shipped backend and AI solutions using Python, FastAPI, LLMs, and vector "
                "search, supporting 10+ production microservices."
            ),
            (
                "Engineered financial-document microservices for extraction, validation, and "
                "LLM-based annotation, processing 5,000+ documents/month."
            ),
            (
                "Integrated OpenAI, Azure Content Understanding, AWS Bedrock, and OCR into "
                "document workflows, achieving 95% extraction accuracy."
            ),
            (
                "Scaled RAG and vector-search solutions across PostgreSQL/pgvector, ChromaDB, "
                "MongoDB, Neo4j, and Redis, handling 10,000+ queries/day."
            ),
        ],
        "projects": [
            {
                "name": "LMSFA — Loan Management System, Financial & Accounting",
                "summary": (
                    "Bank-statement extraction and LLM validation for loan processing."
                ),
                "bullets": [
                    (
                        "Built a bank-statement extraction microservice, reducing manual "
                        "data-entry time by 60% across the loan-processing pipeline."
                    ),
                    (
                        "Combined OCR, OpenAI, and Azure Content Understanding to parse 8 "
                        "financial-document formats with 92% extraction accuracy."
                    ),
                    (
                        "Flagged inconsistent and anomalous extracted values through LLM-based "
                        "validation, reducing downstream review effort by 40%."
                    ),
                ],
                "stack": [
                    "Python",
                    "FastAPI",
                    "OpenAI",
                    "Azure Content Understanding",
                    "OCR",
                    "REST APIs",
                    "Microservices",
                ],
            },
            {
                "name": "Auto BRS — Automated Bank Reconciliation System",
                "summary": "Vector similarity matching across high-volume transactions.",
                "bullets": [
                    (
                        "Replaced manual transaction-by-transaction reconciliation with "
                        "vector-based similarity matching across 50,000+ transactions/day."
                    ),
                    (
                        "Implemented one-to-one, one-to-many, and many-to-one matching, "
                        "achieving a 90% auto-match rate."
                    ),
                    (
                        "Reduced reconciliation processing time by 70% and compute cost by 35% "
                        "through workflow optimization."
                    ),
                ],
                "stack": ["Python", "Vector Search", "PostgreSQL", "pgvector", "FastAPI"],
            },
        ],
    },
    {
        "company": "Thapovan Info Systems",
        "role": "Junior Programming Analyst Intern",
        "location": "Chennai, India",
        "startDate": "2024-07",
        "endDate": "2024-09",
        "order": 2,
        "bullets": [
            (
                "Contributed to LLM-powered applications and REST API integrations using Python "
                "and LangChain, delivering 4 proof-of-concept features."
            ),
            (
                "Implemented document parsing, OCR, and embeddings for semantic search across a "
                "1,000+ document test corpus."
            ),
            (
                "Collaborated with senior engineers on backend services and AI integrations, "
                "accelerating onboarding to production codebases."
            ),
        ],
        "projects": [],
    },
]

SEED_EDUCATION: list[dict] = [
    {
        "school": "SRM University",
        "degree": "M.Sc. Applied Data Science",
        "startYear": "2022",
        "endYear": "2024",
        "highlights": [
            "Data Science",
            "Machine Learning",
            "AI",
            "Generative AI",
            "NLP",
            "Data Analytics",
        ],
        "order": 0,
    },
    {
        "school": "Loyola College",
        "degree": "B.Sc. Mathematics",
        "startYear": "2019",
        "endYear": "2022",
        "highlights": [
            "Mathematics",
            "Statistics",
            "Probability",
            "Linear Algebra",
            "Calculus",
            "Numerical Methods",
        ],
        "order": 1,
    },
]

SEED_SKILL_GROUPS: list[dict] = [
    {
        "category": "Generative AI & LLMs",
        "items": [
            "LLMs",
            "Prompt Engineering",
            "RAG",
            "AI Agents",
            "Multi-Agent Systems",
            "LLM Evaluation",
            "Tool Calling",
            "Conversational AI",
        ],
        "order": 0,
    },
    {
        "category": "Frameworks & Orchestration",
        "items": [
            "LangChain",
            "LangGraph",
            "LlamaIndex",
            "OpenAI Agent SDK",
            "Model Context Protocol (MCP)",
            "NeMo Guardrails",
        ],
        "order": 1,
    },
    {
        "category": "Models & Cloud AI",
        "items": [
            "OpenAI GPT Models",
            "Gemini",
            "LLaMA",
            "Mistral",
            "Azure OpenAI Service",
            "AWS Bedrock",
        ],
        "order": 2,
    },
    {
        "category": "Databases & Vector Stores",
        "items": ["PostgreSQL", "pgvector", "ChromaDB", "MongoDB", "Neo4j", "Redis"],
        "order": 3,
    },
    {
        "category": "Retrieval & Knowledge Systems",
        "items": [
            "Vector Search",
            "Semantic Search",
            "Embeddings",
            "Knowledge Graphs",
            "Graph-Based Retrieval",
        ],
        "order": 4,
    },
    {
        "category": "Document & Speech AI",
        "items": [
            "OCR",
            "Azure Content Understanding",
            "AWS Textract",
            "Document Extraction",
            "Document Classification",
            "Speech-to-Text",
            "LiveKit",
        ],
        "order": 5,
    },
    {
        "category": "Backend & Infrastructure",
        "items": [
            "Python",
            "FastAPI",
            "REST APIs",
            "Microservices",
            "AWS",
            "Azure",
            "Docker",
            "Git/GitHub",
        ],
        "order": 6,
    },
    {
        "category": "Programming",
        "items": ["Python", "JavaScript", "SQL"],
        "order": 7,
    },
]

SEED_PROJECTS: list[dict] = [
    {
        "name": "MINDSPAN — Enterprise Generative AI & Knowledge Platform",
        "company": "PrayagAI",
        "summary": (
            "Unified information across 6 workplace applications through a single "
            "conversational interface, reducing context switching for end users."
        ),
        "bullets": [
            (
                "Unified information across 6 workplace applications through a single "
                "conversational interface, reducing context switching for end users."
            ),
            (
                "Standardized AI-agent access to enterprise tools through MCP-based "
                "integration, reducing new-connector onboarding time to under 3 days."
            ),
            (
                "Combined Neo4j relationship graphs with retrieval workflows to enrich "
                "LLM context, improving answer accuracy by 25%."
            ),
            (
                "Converted unstructured documents and audio into structured data using "
                "OCR and speech-to-text, processing 300+ items/day."
            ),
        ],
        "stack": [
            "Python",
            "FastAPI",
            "OpenAI",
            "LangChain",
            "LangGraph",
            "MCP",
            "Neo4j",
        ],
        "metrics": [
            "6 apps unified",
            "25% accuracy lift",
            "300+ items/day",
            "Connector onboarding < 3 days",
        ],
        "order": 0,
    },
    {
        "name": "Smart Recruitment Platform",
        "company": "PrayagAI",
        "summary": (
            "End-to-end AI recruitment platform covering resume screening, MCQ assessments, "
            "and AI interviews, reducing screening time per candidate by 50%."
        ),
        "bullets": [
            (
                "Delivered an end-to-end AI recruitment platform covering resume screening, "
                "MCQ assessments, and AI interviews, reducing screening time per candidate by 50%."
            ),
            (
                "Built a real-time voice interview experience using LiveKit, OpenAI, and Gemini, "
                "supporting 20+ concurrent candidate interviews."
            ),
            (
                "Engineered stage-based interview agents that dynamically adapt follow-up "
                "questions to candidate responses, reducing irrelevant questions by 30%."
            ),
            (
                "Automated structured interview scoring and reporting, reducing manual "
                "reviewer time by 1.5+ hours per candidate."
            ),
        ],
        "stack": [
            "Python",
            "FastAPI",
            "OpenAI",
            "Gemini",
            "LiveKit",
            "LangChain",
            "LangGraph",
            "MongoDB",
            "Redis",
        ],
        "metrics": [
            "50% faster screening",
            "20+ concurrent interviews",
            "1.5+ hrs saved / candidate",
            "30% fewer irrelevant questions",
        ],
        "order": 1,
    },
    {
        "name": "LMSFA — Loan Management System, Financial & Accounting",
        "company": "Thapovan Info Systems",
        "summary": (
            "Bank-statement extraction microservice reducing manual data-entry time by 60% "
            "across the loan-processing pipeline."
        ),
        "bullets": [
            (
                "Built a bank-statement extraction microservice, reducing manual data-entry "
                "time by 60% across the loan-processing pipeline."
            ),
            (
                "Combined OCR, OpenAI, and Azure Content Understanding to parse 8 "
                "financial-document formats with 92% extraction accuracy."
            ),
            (
                "Flagged inconsistent and anomalous extracted values through LLM-based "
                "validation, reducing downstream review effort by 40%."
            ),
        ],
        "stack": [
            "Python",
            "FastAPI",
            "OpenAI",
            "Azure Content Understanding",
            "OCR",
            "REST APIs",
            "Microservices",
        ],
        "metrics": [
            "5,000+ docs/month",
            "92% extraction accuracy",
            "60% less manual entry",
            "40% less review effort",
        ],
        "order": 2,
    },
    {
        "name": "Auto BRS — Automated Bank Reconciliation System",
        "company": "Thapovan Info Systems",
        "summary": (
            "Vector-based similarity matching across 50,000+ transactions/day with "
            "one-to-one, one-to-many, and many-to-one matching."
        ),
        "bullets": [
            (
                "Replaced manual transaction-by-transaction reconciliation with "
                "vector-based similarity matching across 50,000+ transactions/day."
            ),
            (
                "Implemented one-to-one, one-to-many, and many-to-one matching, "
                "achieving a 90% auto-match rate."
            ),
            (
                "Reduced reconciliation processing time by 70% and compute cost by 35% "
                "through workflow optimization."
            ),
        ],
        "stack": ["Python", "Vector Search", "PostgreSQL", "pgvector", "FastAPI"],
        "metrics": [
            "50,000+ tx/day",
            "90% auto-match",
            "70% faster",
            "35% lower compute cost",
        ],
        "order": 3,
    },
]

SEED_SITE_SETTINGS: dict = {
    "sectionLabels": {
        "experience": "Experience",
        "skills": "Capabilities",
        "projects": "Systems shipped",
        "education": "Education",
    },
    "themePreset": "midnight",
    "accentColor": "#5b8def",
    "backgroundColor": "#0b131e",
    "heroBackdrop": "aurora",
}
