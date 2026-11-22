# AI Zero to Hero — Full Lesson Catalogue

Generated from `rohitg00/ai-engineering-from-scratch` (MIT): **20 phases · 542 lessons**, every lesson mapped 1:1,
plus our additions: **Start Here** (7 primer lessons) and **AI System Design** (12 case studies). **Total: 561 interactive units.**

Format: **Scene** = animated step-through (Problem → Concept → Try it → Case → Recap) · **Scene + code lab** = the same plus the lesson's runnable code (the repo's Build lessons) · **Project** = capstone brief with milestones.
Status: **LIVE** = Phase 1 launch (29 units) · **NEXT** = Phase 2 (0) · **SOON** = open for contributors.

## Topic paths (cross-cutting filters)
| Path | Lessons |
|---|---|
| Very basics | 8 |
| RAG | 18 |
| Tool calling | 11 |
| MCP | 18 |
| Agent Skills | 6 |
| Agents | 27 |
| Evaluation | 35 |
| Security & safety | 25 |

---

## V0 · Start Here — LIVE (7)

1. What is AI, ML & GenAI?
2. How an LLM picks the next word
3. Tokens & context windows
4. Your first API call
5. Messages, roles & system prompts
6. Napkin math: cost & latency
7. What an AI engineer actually does

## V1 · Foundations — 56 lessons
_Tools, maths and classical ML._

### Phase 00 · Setup & Tooling (13)
>   
> **Opening incident:** An API key was committed to a public repo.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Dev Environment | Scene + code lab | Python, TypeScript, Rust | SOON | basics |
| 02 | Git & Collaboration | Scene | — | SOON |  |
| 03 | GPU Setup & Cloud | Scene + code lab | Python | SOON |  |
| 04 | APIs & Keys | Scene + code lab | Python, TypeScript | SOON | basics |
| 05 | Jupyter Notebooks | Scene + code lab | Python | SOON |  |
| 06 | Python Environments | Scene + code lab | Shell | SOON |  |
| 07 | Docker for AI | Scene + code lab | Docker | SOON |  |
| 08 | Editor Setup | Scene + code lab | — | SOON |  |
| 09 | Data Management | Scene + code lab | Python | SOON |  |
| 10 | Terminal & Shell | Scene | — | SOON |  |
| 11 | Linux for AI | Scene | — | SOON |  |
| 12 | Debugging & Profiling | Scene + code lab | Python | SOON |  |
| 13 | Python for AI Engineering | Scene + code lab | Python, TypeScript | SOON | basics |

### Phase 01 · Math Foundations (22)
> The intuition behind every AI algorithm, through code.  
> **Opening incident:** Search returns shoes for a "boot camp" query.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Linear Algebra Intuition | Scene | Python, Julia | SOON |  |
| 02 | Vectors, Matrices & Operations | Scene + code lab | Python, Julia | SOON |  |
| 03 | Matrix Transformations & Eigenvalues | Scene + code lab | Python, Julia | SOON |  |
| 04 | Calculus for ML: Derivatives & Gradients | Scene | Python, Julia | SOON |  |
| 05 | Chain Rule & Automatic Differentiation | Scene + code lab | Python, Julia | SOON |  |
| 06 | Probability & Distributions | Scene | Python, Julia | SOON |  |
| 07 | Bayes' Theorem & Statistical Thinking | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | Optimization: Gradient Descent Family | Scene + code lab | Python, Julia | SOON |  |
| 09 | Information Theory: Entropy, KL Divergence | Scene | Python, TypeScript | SOON |  |
| 10 | Dimensionality Reduction: PCA, t-SNE, UMAP | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 11 | Singular Value Decomposition | Scene + code lab | Python, Julia | SOON |  |
| 12 | Tensor Operations | Scene + code lab | Python, TypeScript | SOON |  |
| 13 | Numerical Stability | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 14 | Norms & Distances | Scene + code lab | Python, TypeScript | SOON |  |
| 15 | Statistics for ML | Scene + code lab | Python, TypeScript | SOON |  |
| 16 | Sampling Methods | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 17 | Linear Systems | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 18 | Convex Optimization | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 19 | Complex Numbers for AI | Scene | Python, TypeScript | SOON |  |
| 20 | The Fourier Transform | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 21 | Graph Theory for ML | Scene + code lab | Python, TypeScript | SOON |  |
| 22 | Stochastic Processes | Scene | Python, Julia | SOON |  |

### Phase 02 · ML Fundamentals (21)
> Classical ML — still the backbone of most production AI.  
> **Opening incident:** The fraud model is 99% accurate and catches nothing.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | What Is Machine Learning | Scene | Python | LIVE | basics |
| 02 | Linear Regression from Scratch | Scene + code lab | Python, Rust, Julia | LIVE |  |
| 03 | Logistic Regression & Classification | Scene + code lab | Python, Rust, Julia | LIVE |  |
| 04 | Decision Trees & Random Forests | Scene + code lab | Python, TypeScript | LIVE |  |
| 05 | Support Vector Machines | Scene + code lab | Python, Julia | LIVE |  |
| 06 | KNN & Distance Metrics | Scene + code lab | Python, TypeScript | LIVE | eval |
| 07 | Unsupervised Learning: K-Means, DBSCAN | Scene + code lab | Python, TypeScript | LIVE |  |
| 08 | Feature Engineering & Selection | Scene + code lab | Python, TypeScript | LIVE |  |
| 09 | Model Evaluation: Metrics, Cross-Validation | Scene + code lab | Python, Julia | LIVE | eval |
| 10 | Bias, Variance & the Learning Curve | Scene | Python | LIVE |  |
| 11 | Ensemble Methods: Boosting, Bagging, Stacking | Scene + code lab | Python | LIVE |  |
| 12 | Hyperparameter Tuning | Scene + code lab | Python | LIVE |  |
| 13 | ML Pipelines & Experiment Tracking | Scene + code lab | Python | LIVE |  |
| 14 | Naive Bayes | Scene + code lab | Python | LIVE |  |
| 15 | Time Series Fundamentals | Scene + code lab | Python | LIVE |  |
| 16 | Anomaly Detection | Scene + code lab | Python | LIVE |  |
| 17 | Handling Imbalanced Data | Scene + code lab | Python | LIVE |  |
| 18 | Feature Selection | Scene + code lab | Python | LIVE |  |
| 19 | ML System Design — From Problem to Deployed Model | Scene + code lab | Python, TypeScript | LIVE |  |
| 20 | Monitoring Models in Production — Data Drift and Concept Drift | Scene + code lab | Python, TypeScript | LIVE |  |
| 21 | Feature Stores and Training-Serving Skew | Scene + code lab | Python, TypeScript | LIVE |  |

## V2 · Deep Learning — 58 lessons
_From a perceptron to vision and speech._

### Phase 03 · Deep Learning Core (13)
> Neural networks from first principles. No frameworks until you build one.  
> **Opening incident:** Loss is NaN after 3 epochs.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | The Perceptron: Where It All Started | Scene + code lab | Python, TypeScript, Rust, Julia | SOON |  |
| 02 | Multi-Layer Networks & Forward Pass | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 03 | Backpropagation from Scratch | Scene + code lab | Python, TypeScript, Rust, Julia | SOON |  |
| 04 | Activation Functions: ReLU, Sigmoid, GELU & Why | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 05 | Loss Functions: MSE, Cross-Entropy, Contrastive | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 06 | Optimizers: SGD, Momentum, Adam, AdamW | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 07 | Regularization: Dropout, Weight Decay, BatchNorm | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 08 | Weight Initialization & Training Stability | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 09 | Learning Rate Schedules & Warmup | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 10 | Build Your Own Mini Framework | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 11 | Introduction to PyTorch | Scene + code lab | Python | SOON |  |
| 12 | Introduction to JAX | Scene + code lab | Python | SOON |  |
| 13 | Debugging Neural Networks | Scene + code lab | Python | SOON |  |

### Phase 04 · Computer Vision (28)
> From pixels to understanding — image, video, 3D, VLMs, and world models.  
> **Opening incident:** The receipt scanner reads $1,000 as $1.000.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Image Fundamentals: Pixels, Channels, Color Spaces | Scene | Python, Julia | SOON |  |
| 02 | Convolutions from Scratch | Scene + code lab | Python, Julia | SOON |  |
| 03 | CNNs: LeNet to ResNet | Scene + code lab | Python | SOON |  |
| 04 | Image Classification | Scene + code lab | Python | SOON |  |
| 05 | Transfer Learning & Fine-Tuning | Scene + code lab | Python | SOON |  |
| 06 | Object Detection — YOLO from Scratch | Scene + code lab | Python | SOON |  |
| 07 | Semantic Segmentation — U-Net | Scene + code lab | Python | SOON |  |
| 08 | Instance Segmentation — Mask R-CNN | Scene + code lab | Python | SOON |  |
| 09 | Image Generation — GANs | Scene + code lab | Python | SOON |  |
| 10 | Image Generation — Diffusion Models | Scene + code lab | Python | SOON |  |
| 11 | Stable Diffusion — Architecture & Fine-Tuning | Scene + code lab | Python | SOON |  |
| 12 | Video Understanding — Temporal Modeling | Scene + code lab | Python | SOON |  |
| 13 | 3D Vision: Point Clouds, NeRFs | Scene + code lab | Python | SOON |  |
| 14 | Vision Transformers (ViT) | Scene + code lab | Python | SOON |  |
| 15 | Real-Time Vision: Edge Deployment | Scene + code lab | Python, Rust | SOON |  |
| 16 | Build a Complete Vision Pipeline | Scene + code lab | Python | SOON |  |
| 17 | Self-Supervised Vision — SimCLR, DINO, MAE | Scene + code lab | Python | SOON |  |
| 18 | Open-Vocabulary Vision — CLIP | Scene + code lab | Python | SOON |  |
| 19 | OCR & Document Understanding | Scene + code lab | Python | SOON |  |
| 20 | Image Retrieval & Metric Learning | Scene + code lab | Python | SOON | rag, eval |
| 21 | Keypoint Detection & Pose Estimation | Scene + code lab | Python | SOON |  |
| 22 | 3D Gaussian Splatting from Scratch | Scene + code lab | Python | SOON |  |
| 23 | Diffusion Transformers & Rectified Flow | Scene + code lab | Python | SOON |  |
| 24 | SAM 3 & Open-Vocabulary Segmentation | Scene + code lab | Python | SOON |  |
| 25 | Vision-Language Models (ViT-MLP-LLM) | Scene + code lab | Python | SOON |  |
| 26 | Monocular Depth & Geometry Estimation | Scene + code lab | Python | SOON |  |
| 27 | Multi-Object Tracking & Video Memory | Scene + code lab | Python, Rust | SOON |  |
| 28 | World Models & Video Diffusion | Scene + code lab | Python | SOON |  |

### Phase 06 · Speech & Audio (17)
> Hear, understand, speak.  
> **Opening incident:** The voice bot talks over the customer.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Audio Fundamentals: Waveforms, Sampling, FFT | Scene | Python, TypeScript, Julia | SOON |  |
| 02 | Spectrograms, Mel Scale & Audio Features | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 03 | Audio Classification | Scene + code lab | Python, TypeScript | SOON |  |
| 04 | Speech Recognition (ASR) | Scene + code lab | Python, TypeScript | SOON |  |
| 05 | Whisper: Architecture & Fine-Tuning | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Speaker Recognition & Verification | Scene + code lab | Python, TypeScript | SOON |  |
| 07 | Text-to-Speech (TTS) | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | Voice Cloning & Voice Conversion | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Music Generation | Scene + code lab | Python, TypeScript | SOON |  |
| 10 | Audio-Language Models | Scene + code lab | Python, TypeScript | SOON |  |
| 11 | Real-Time Audio Processing | Scene + code lab | Python, Rust | SOON |  |
| 12 | Build a Voice Assistant Pipeline | Scene + code lab | Python, TypeScript | SOON |  |
| 13 | Neural Audio Codecs — EnCodec, SNAC, Mimi, DAC | Scene | Python, TypeScript | SOON |  |
| 14 | Voice Activity Detection & Turn-Taking | Scene + code lab | Python, TypeScript, Rust | SOON |  |
| 15 | Streaming Speech-to-Speech — Moshi, Hibiki | Scene | Python, TypeScript | SOON |  |
| 16 | Voice Anti-Spoofing & Audio Watermarking | Scene + code lab | Python, TypeScript | SOON |  |
| 17 | Audio Evaluation — WER, MOS, MMAU, Leaderboards | Scene | Python, TypeScript | SOON | eval |

## V3 · Language — 45 lessons
_NLP, attention and the transformer, by hand._

### Phase 05 · NLP: Foundations to Advanced (29)
> Language is the interface to intelligence.  
> **Opening incident:** The answer was split across two chunks.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Text Processing: Tokenization, Stemming, Lemmatization | Scene + code lab | Python, TypeScript | SOON |  |
| 02 | Bag of Words, TF-IDF & Text Representation | Scene + code lab | Python, TypeScript | SOON |  |
| 03 | Word Embeddings: Word2Vec from Scratch | Scene + code lab | Python, Julia | SOON |  |
| 04 | GloVe, FastText & Subword Embeddings | Scene + code lab | Python, TypeScript | SOON |  |
| 05 | Sentiment Analysis | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Named Entity Recognition (NER) | Scene + code lab | Python, TypeScript | SOON |  |
| 07 | POS Tagging & Syntactic Parsing | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | Text Classification — CNNs & RNNs for Text | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Sequence-to-Sequence Models | Scene + code lab | Python, TypeScript | SOON |  |
| 10 | Attention Mechanism — The Breakthrough | Scene + code lab | Python, TypeScript | SOON |  |
| 11 | Machine Translation | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | Text Summarization | Scene + code lab | Python, TypeScript | SOON |  |
| 13 | Question Answering Systems | Scene + code lab | Python, TypeScript | SOON |  |
| 14 | Information Retrieval & Search | Scene + code lab | Python, TypeScript, Rust | SOON | rag, eval |
| 15 | Topic Modeling: LDA, BERTopic | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 16 | Text Generation | Scene + code lab | Python, TypeScript | SOON |  |
| 17 | Chatbots: Rule-Based to Neural | Scene + code lab | Python, TypeScript | SOON |  |
| 18 | Multilingual NLP | Scene + code lab | Python, TypeScript | SOON |  |
| 19 | Subword Tokenization: BPE, WordPiece, Unigram, SentencePiece | Scene | Python, TypeScript, Rust | SOON |  |
| 20 | Structured Outputs & Constrained Decoding | Scene + code lab | Python, TypeScript, Rust | SOON | tools |
| 21 | NLI & Textual Entailment | Scene | Python, TypeScript | SOON |  |
| 22 | Embedding Models Deep Dive | Scene | Python, TypeScript | SOON | rag |
| 23 | Chunking Strategies for RAG | Scene + code lab | Python, TypeScript | SOON | rag |
| 24 | Coreference Resolution | Scene | Python, TypeScript | SOON |  |
| 25 | Entity Linking & Disambiguation | Scene + code lab | Python, TypeScript | SOON |  |
| 26 | Relation Extraction & Knowledge Graph Construction | Scene + code lab | Python, TypeScript | SOON |  |
| 27 | LLM Evaluation: RAGAS, DeepEval, G-Eval | Scene + code lab | Python, TypeScript | SOON | rag, eval |
| 28 | Long-Context Evaluation: NIAH, RULER, LongBench, MRCR | Scene | Python, TypeScript | SOON | eval |
| 29 | Dialogue State Tracking | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 07 · Transformers Deep Dive (16)
> The architecture that changed everything.  
> **Opening incident:** Latency doubles as the chat grows.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Why Transformers: The Problems with RNNs | Scene | Python, Julia | SOON |  |
| 02 | Self-Attention from Scratch | Scene + code lab | Python, Rust, Julia | SOON | basics |
| 03 | Multi-Head Attention | Scene + code lab | Python, Rust | SOON |  |
| 04 | Positional Encoding: Sinusoidal, RoPE, ALiBi | Scene + code lab | Python, Rust, Julia | SOON |  |
| 05 | The Full Transformer: Encoder + Decoder | Scene + code lab | Python, Julia | SOON |  |
| 06 | BERT — Masked Language Modeling | Scene + code lab | Python, Rust | SOON |  |
| 07 | GPT — Causal Language Modeling | Scene + code lab | Python, Rust | SOON |  |
| 08 | T5, BART — Encoder-Decoder Models | Scene | Python, Rust | SOON |  |
| 09 | Vision Transformers (ViT) | Scene + code lab | Python, Rust | SOON |  |
| 10 | Audio Transformers — Whisper Architecture | Scene | Python, Rust | SOON |  |
| 11 | Mixture of Experts (MoE) | Scene + code lab | Python, Rust | SOON |  |
| 12 | KV Cache, Flash Attention & Inference Optimization | Scene + code lab | Python, Rust | SOON |  |
| 13 | Scaling Laws | Scene | Python, Rust | SOON |  |
| 14 | Build a Transformer from Scratch | Scene + code lab | Python | SOON |  |
| 15 | Attention Variants — Sliding Window, Sparse, Differential | Scene + code lab | Python, Rust | SOON |  |
| 16 | Speculative Decoding — Draft, Verify, Repeat | Scene + code lab | Python, Rust | SOON |  |

## V4 · Large Language Models — 68 lessons
_Generative AI, RL, train a mini GPT, ship RAG._

### Phase 08 · Generative AI (15)
> Create images, video, audio, 3D, and more.  
> **Opening incident:** Generated product photos all have six fingers.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Generative Models: Taxonomy & History | Scene | Python, TypeScript | SOON |  |
| 02 | Autoencoders & VAE | Scene + code lab | Python, TypeScript | SOON |  |
| 03 | GANs: Generator vs Discriminator | Scene + code lab | Python, TypeScript | SOON |  |
| 04 | Conditional GANs & Pix2Pix | Scene + code lab | Python, TypeScript | SOON |  |
| 05 | StyleGAN | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Diffusion Models — DDPM from Scratch | Scene + code lab | Python, TypeScript | SOON |  |
| 07 | Latent Diffusion & Stable Diffusion | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | ControlNet, LoRA & Conditioning | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Inpainting, Outpainting & Editing | Scene + code lab | Python, TypeScript | SOON |  |
| 10 | Video Generation | Scene + code lab | Python, TypeScript | SOON |  |
| 11 | Audio Generation | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | 3D Generation | Scene + code lab | Python, TypeScript | SOON |  |
| 13 | Flow Matching & Rectified Flows | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 14 | Evaluation: FID, CLIP Score | Scene + code lab | Python, TypeScript | SOON | eval |
| 19 | Visual Autoregressive Modeling (VAR): Next-Scale Prediction | Scene + code lab | Python, Julia | SOON |  |

### Phase 09 · Reinforcement Learning (12)
> The foundation of RLHF and game-playing AI.  
> **Opening incident:** The reward model learned to love long answers.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | MDPs, States, Actions & Rewards | Scene | Python, TypeScript | SOON |  |
| 02 | Dynamic Programming | Scene + code lab | Python, TypeScript | SOON |  |
| 03 | Monte Carlo Methods | Scene + code lab | Python, TypeScript | SOON |  |
| 04 | Q-Learning, SARSA | Scene + code lab | Python, TypeScript | SOON |  |
| 05 | Deep Q-Networks (DQN) | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Policy Gradients — REINFORCE | Scene + code lab | Python, TypeScript | SOON |  |
| 07 | Actor-Critic — A2C, A3C | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | PPO | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Reward Modeling & RLHF | Scene + code lab | Python, TypeScript | SOON |  |
| 10 | Multi-Agent RL | Scene + code lab | Python, TypeScript | SOON |  |
| 11 | Sim-to-Real Transfer | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | RL for Games | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 10 · LLMs from Scratch (24)
> Build, train, and understand large language models.  
> **Opening incident:** The fine-tuned model forgot how to speak English.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Tokenizers: BPE, WordPiece, SentencePiece | Scene + code lab | Python, Rust | SOON | basics |
| 02 | Building a Tokenizer from Scratch | Scene + code lab | Python, TypeScript | SOON |  |
| 03 | Data Pipelines for Pre-Training | Scene + code lab | Python, Rust | SOON |  |
| 04 | Pre-Training a Mini GPT (124M) | Scene + code lab | Python, Rust | SOON |  |
| 05 | Distributed Training, FSDP, DeepSpeed | Scene + code lab | Python | SOON |  |
| 06 | Instruction Tuning — SFT | Scene + code lab | Python | SOON |  |
| 07 | RLHF — Reward Model + PPO | Scene + code lab | Python | SOON |  |
| 08 | DPO — Direct Preference Optimization | Scene + code lab | Python | SOON |  |
| 09 | Constitutional AI & Self-Improvement | Scene + code lab | Python | SOON |  |
| 10 | Evaluation — Benchmarks, Evals | Scene + code lab | Python | SOON | eval |
| 11 | Quantization: INT8, GPTQ, AWQ, GGUF | Scene + code lab | Python, Rust | SOON |  |
| 12 | Inference Optimization | Scene + code lab | Python, Rust | SOON |  |
| 13 | Building a Complete LLM Pipeline | Scene + code lab | Python, Rust | SOON |  |
| 14 | Open Models: Architecture Walkthroughs | Scene | Python, Rust | SOON |  |
| 15 | Speculative Decoding and EAGLE-3 | Scene + code lab | Python, Rust | SOON |  |
| 16 | Differential Attention (V2) | Scene + code lab | Python, Rust | SOON |  |
| 17 | Native Sparse Attention (DeepSeek NSA) | Scene + code lab | Python, Rust | SOON |  |
| 18 | Multi-Token Prediction (MTP) | Scene + code lab | Python, Rust | SOON |  |
| 19 | DualPipe Parallelism | Scene | Python, Rust | SOON |  |
| 20 | DeepSeek-V3 Architecture Walkthrough | Scene | Python, Rust | SOON |  |
| 21 | Jamba — Hybrid SSM-Transformer | Scene | Python, Rust | SOON |  |
| 22 | Async and Hogwild! Inference | Scene + code lab | Python, Rust | SOON |  |
| 25 | Speculative Decoding and EAGLE | Scene + code lab | Python | SOON |  |
| 34 | Gradient Checkpointing and Activation Recomputation | Scene + code lab | Python | SOON |  |

### Phase 11 · LLM Engineering (17)
> Put LLMs to work in production.  
> **Opening incident:** The bot quotes a refund policy from 2019.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Prompt Engineering: Techniques & Patterns | Scene + code lab | Python, TypeScript | SOON | basics |
| 02 | Few-Shot, CoT, Tree-of-Thought | Scene + code lab | Python | SOON |  |
| 03 | Structured Outputs | Scene + code lab | Python, TypeScript | SOON | tools |
| 04 | Embeddings & Vector Representations | Scene + code lab | Python, TypeScript | SOON | basics |
| 05 | Context Engineering | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | RAG: Retrieval-Augmented Generation | Scene + code lab | Python, TypeScript | SOON | rag, eval |
| 07 | Advanced RAG: Chunking, Reranking | Scene + code lab | Python, TypeScript | SOON | rag |
| 08 | Fine-Tuning with LoRA & QLoRA | Scene + code lab | Python | SOON |  |
| 09 | Function Calling & Tool Use | Scene + code lab | Python, TypeScript | SOON | tools |
| 10 | Evaluation & Testing | Scene + code lab | Python, TypeScript | SOON | eval |
| 11 | Caching, Rate Limiting & Cost | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | Guardrails & Safety | Scene + code lab | Python, TypeScript | SOON | security |
| 13 | Building a Production LLM App | Scene + code lab | Python, TypeScript | SOON |  |
| 14 | Model Context Protocol (MCP) | Scene + code lab | Python, TypeScript, Go | SOON | mcp |
| 15 | Prompt Caching & Context Caching | Scene + code lab | Python, TypeScript | SOON |  |
| 16 | Agent State Machines — Graphs, Nodes, Checkpoints | Scene + code lab | Python | SOON |  |
| 17 | Agent Framework Tradeoffs | Scene | Python, TypeScript | SOON |  |

## V5 · Agents — 171 lessons
_Multimodal, tools & MCP, agents, swarms._

### Phase 12 · Multimodal AI (25)
> See, hear, read, and reason across modalities — from ViT patches to computer-use agents.  
> **Opening incident:** The model reads a chart upside down.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Vision Transformers and the Patch-Token Primitive | Scene | Python, TypeScript | SOON |  |
| 02 | CLIP and Contrastive Vision-Language Pretraining | Scene + code lab | Python, TypeScript | SOON |  |
| 03 | BLIP-2 Q-Former as Modality Bridge | Scene + code lab | Python, TypeScript | SOON |  |
| 04 | Flamingo and Gated Cross-Attention | Scene | Python, TypeScript | SOON |  |
| 05 | LLaVA and Visual Instruction Tuning | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Any-Resolution Vision — Patch-n'-Pack and NaFlex | Scene + code lab | Python, TypeScript | SOON |  |
| 07 | Open-Weight VLM Recipes: What Actually Matters | Scene | Python, TypeScript | SOON |  |
| 08 | LLaVA-OneVision: Single, Multi, Video | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Qwen-VL Family and Dynamic-FPS Video | Scene | Python, TypeScript | SOON |  |
| 10 | InternVL3 Native Multimodal Pretraining | Scene | Python, TypeScript | SOON |  |
| 11 | Chameleon Early-Fusion Token-Only | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | Emu3 Next-Token Prediction for Generation | Scene | Python, TypeScript | SOON |  |
| 13 | Transfusion Autoregressive + Diffusion | Scene + code lab | Python, TypeScript | SOON |  |
| 14 | Show-o Discrete-Diffusion Unified | Scene | Python, TypeScript | SOON |  |
| 15 | Janus-Pro Decoupled Encoders | Scene + code lab | Python, TypeScript | SOON |  |
| 16 | MIO Any-to-Any Streaming | Scene | Python, TypeScript | SOON |  |
| 17 | Video-Language Temporal Grounding | Scene + code lab | Python, TypeScript | SOON |  |
| 18 | Long-Video at Million-Token Context | Scene + code lab | Python, TypeScript | SOON |  |
| 19 | Audio-Language Models: Whisper to AF3 | Scene + code lab | Python, TypeScript | SOON |  |
| 20 | Omni Models: Thinker-Talker Streaming | Scene + code lab | Python, TypeScript | SOON |  |
| 21 | Embodied VLAs: RT-2, OpenVLA, π0, GR00T | Scene | Python, TypeScript | SOON |  |
| 22 | Document and Diagram Understanding | Scene + code lab | Python, TypeScript | SOON |  |
| 23 | ColPali Vision-Native Document RAG | Scene + code lab | Python, TypeScript | SOON | rag |
| 24 | Multimodal RAG and Cross-Modal Retrieval | Scene + code lab | Python, TypeScript | SOON | rag, eval |
| 25 | Multimodal Agents and Computer-Use (Capstone) | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 13 · Tools & Protocols (45)
> The interfaces between AI and the real world.  
> **Opening incident:** The model called delete_user with the wrong ID.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | The Tool Interface | Scene | Python, TypeScript | SOON | tools |
| 02 | Function Calling Deep Dive | Scene + code lab | Python, TypeScript | SOON | tools |
| 03 | Parallel and Streaming Tool Calls | Scene + code lab | Python, TypeScript, Go | SOON | tools |
| 04 | Structured Output | Scene + code lab | Python, TypeScript | SOON | tools |
| 05 | Tool Schema Design | Scene | Python, TypeScript | SOON | tools |
| 06 | MCP Fundamentals: Stateless Requests and JSON-RPC | Scene | Python, TypeScript | SOON | mcp |
| 07 | Building an MCP Server: Stateless Python and TypeScript | Scene + code lab | Python, TypeScript, Go | SOON | mcp |
| 08 | Building an MCP Client: Discovery, Routing, and Dual-Era Fallback | Scene + code lab | Python, TypeScript | SOON | mcp |
| 09 | MCP Transports: stdio and Stateless Streamable HTTP | Scene | Python, TypeScript, Go | SOON | mcp |
| 10 | MCP Resources and Prompts: Addressable Context for Stateless Servers | Scene + code lab | Python, TypeScript | SOON | mcp |
| 11 | MCP Model Input: Sampling Migration and Stateless MRTR | Scene + code lab | Python, TypeScript | SOON | mcp |
| 12 | Explicit Scope and Stateless Elicitation | Scene + code lab | Python, TypeScript | SOON |  |
| 13 | MCP Tasks Extension: Durable Work on a Stateless Core | Scene + code lab | Python, TypeScript | SOON | mcp |
| 14 | MCP Apps on the Stateless Protocol | Scene + code lab | Python, TypeScript | SOON | mcp |
| 15 | MCP Security: Poisoned Metadata, Routing, and MRTR State | Scene | Python, TypeScript | SOON | mcp, security |
| 16 | MCP Authorization: CIMD, Issuer Binding, PKCE, and Step-Up | Scene + code lab | Python, TypeScript, Go | SOON | mcp |
| 17 | Stateless MCP Gateways and Registry Admission | Scene | Python, TypeScript, Go | SOON | mcp |
| 18 | MCP Auth in Production: Issuer-Bound Enrollment and Tokens | Scene + code lab | Python, TypeScript, Go | SOON | mcp |
| 19 | A2A Protocol | Scene + code lab | Python, TypeScript, Go | SOON |  |
| 20 | OpenTelemetry GenAI | Scene + code lab | Python, TypeScript | SOON |  |
| 21 | LLM Routing Layer | Scene | Python, TypeScript, Go | SOON |  |
| 22 | Agent Skills: Portable Contract and Runtime Boundary | Scene + code lab | Python, TypeScript | SOON | skills |
| 23 | Capstone: Stateless Tool Ecosystem | Scene + code lab | Python, TypeScript | SOON |  |
| 24 | Skill Discovery and Progressive Disclosure | Scene + code lab | Python, TypeScript | SOON | skills |
| 25 | Skill Invocation and Routing | Scene + code lab | Python, TypeScript | SOON | skills |
| 26 | Skill Permissions, Sandboxes, and Trust | Scene + code lab | Python, TypeScript | SOON | skills, security |
| 27 | Skill Evals, Packaging, and Portability | Scene + code lab | Python, TypeScript | SOON | skills, eval |
| 28 | MCP Tool Contracts and Content | Scene + code lab | Python, TypeScript | SOON | mcp |
| 29 | MCP Reliability, Cancellation, and Flow Control | Scene + code lab | Python, TypeScript | SOON | mcp |
| 30 | MCP Registry Supply Chain: Admission, Drift, and Rollback | Scene + code lab | Python, TypeScript | SOON | mcp |
| 31 | MCP Conformance Engineering: Versioning, Evidence, and Operations | Scene + code lab | Python, TypeScript | SOON | mcp |
| 32 | Program Anatomy: An ELF Reader From Scratch | Scene + code lab | Python, TypeScript, Rust | SOON |  |
| 33 | Disassembly and Control Flow: From Bytes to a Graph You Can Check | Scene + code lab | Python, TypeScript, Rust | SOON |  |
| 34 | Lifting to Pseudocode: IR, SSA, and Structuring From Scratch | Scene + code lab | Python, TypeScript | SOON |  |
| 35 | Evidence, Confidence, and Unknowns in Binary Analysis | Scene + code lab | Python, TypeScript | SOON |  |
| 36 | Rebuild and Prove Equal: Differential Tests, Byte Comparison, and the Evidence Loop | Scene + code lab | Python, TypeScript | SOON |  |
| 37 | The Reverse Engineering Landscape: History, Tool Families, and How a Decompiler Is Built | Scene + code lab | Python, TypeScript | SOON |  |
| 38 | Calling Conventions and Stack Frames: System V, Windows x64, and AArch64 | Scene + code lab | Python, TypeScript | SOON |  |
| 39 | Compiler Idioms: What Optimization Does to Your Code and How to Read It Back | Scene + code lab | Python, TypeScript | SOON |  |
| 40 | Linking, Loading, and Stripped Binaries: PLT, GOT, Imports, Fixups, and Function Identification | Scene + code lab | Python, TypeScript, Rust | SOON |  |
| 41 | Recovering Data and Types: Structs, Arrays, C++ Objects, and DWARF | Scene + code lab | Python, TypeScript | SOON |  |
| 42 | Dynamic Analysis of Your Own Program: Debuggers, Traces, and Confirming Static Claims | Scene + code lab | Python, TypeScript | SOON |  |
| 43 | Beyond Native Code: Python, JVM, .NET, and WebAssembly Bytecode | Scene + code lab | Python, TypeScript | SOON |  |
| 44 | Binary Diffing and Symbolic Execution: Matching Functions and Solving for Inputs | Scene + code lab | Python, TypeScript | SOON |  |
| 45 | AI-Assisted Reverse Engineering: LLM Decompilers, Analysis Agents, and Ground Truth | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 14 · Agent Engineering (54)
> Build agents from first principles, use coding agents reliably, and shape the work before implementation.  
> **Opening incident:** The agent loops forever on a 404.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | The Agent Loop | Scene + code lab | Python, TypeScript | SOON | agents |
| 02 | ReWOO and Plan-and-Execute | Scene + code lab | Python, TypeScript | SOON | agents |
| 03 | Reflexion and Verbal Reinforcement Learning | Scene + code lab | Python, TypeScript | SOON | agents |
| 04 | Tree of Thoughts and LATS | Scene + code lab | Python, TypeScript | SOON | agents |
| 05 | Self-Refine and CRITIC | Scene + code lab | Python, TypeScript | SOON | agents |
| 06 | Tool Use and Function Calling | Scene + code lab | Python, TypeScript | SOON | tools |
| 07 | Agent Memory — Virtual Context and Memory Paging | Scene + code lab | Python, TypeScript | SOON | agents |
| 08 | Memory Blocks and Sleep-Time Compute | Scene + code lab | Python, TypeScript | SOON | agents |
| 09 | Hybrid Memory — Vector + Graph + KV | Scene + code lab | Python, TypeScript | SOON | agents |
| 10 | Skill Libraries and Lifelong Learning (Voyager) | Scene + code lab | Python, TypeScript | SOON | skills |
| 11 | Planning with HTN and Evolutionary Search | Scene + code lab | Python, TypeScript | SOON |  |
| 12 | Anthropic's Workflow Patterns | Scene + code lab | Python, TypeScript | SOON | agents |
| 13 | Stateful Graph Orchestration — Durable Execution and Checkpoints | Scene + code lab | Python, TypeScript | SOON | agents |
| 14 | The Actor Model for Agents | Scene + code lab | Python, TypeScript | SOON |  |
| 15 | Role-Based Agent Teams — Roles, Tasks, Processes | Scene + code lab | Python | SOON |  |
| 16 | OpenAI Agents SDK — Handoffs, Guardrails, Tracing | Scene + code lab | Python, TypeScript | SOON | security |
| 17 | The Harness as a Library — Subagents and Session Store | Scene + code lab | Python, TypeScript | SOON | agents |
| 18 | Production Agent Runtimes | Scene | Python, TypeScript | SOON | agents |
| 19 | Benchmarks — SWE-bench, GAIA, AgentBench | Scene | Python, TypeScript | SOON | eval |
| 20 | Benchmarks — WebArena and OSWorld | Scene | Python, TypeScript | SOON | eval |
| 21 | Computer Use — Claude, OpenAI CUA, Gemini | Scene + code lab | Python, TypeScript | SOON | agents |
| 22 | Voice Agents — Pipecat and LiveKit | Scene + code lab | Python, TypeScript | SOON | agents |
| 23 | OpenTelemetry GenAI Semantic Conventions | Scene + code lab | Python, TypeScript, Go | SOON |  |
| 24 | Agent Observability — Langfuse, Phoenix, Opik | Scene | Python, TypeScript | SOON |  |
| 25 | Multi-Agent Debate and Collaboration | Scene + code lab | Python, TypeScript | SOON |  |
| 26 | Failure Modes — Why Agents Break | Scene + code lab | Python, TypeScript | SOON | agents |
| 27 | Prompt Injection and the PVE Defense | Scene + code lab | Python, TypeScript | SOON | security |
| 28 | Orchestration Patterns — Supervisor, Swarm, Hierarchical | Scene + code lab | Python, TypeScript | SOON | agents |
| 29 | Production Runtimes — Queue, Event, Cron | Scene | Python, TypeScript, Go | SOON |  |
| 30 | Eval-Driven Agent Development | Scene + code lab | Python, TypeScript | SOON | eval |
| 31 | Agent Workbench: Why Capable Models Still Fail | Scene | Python, TypeScript | SOON | agents |
| 32 | The Minimal Agent Workbench | Scene + code lab | Python, TypeScript | SOON | agents |
| 33 | Agent Instructions as Executable Constraints | Scene + code lab | Python, TypeScript | SOON |  |
| 34 | Repo Memory and Durable State | Scene + code lab | Python, TypeScript | SOON |  |
| 35 | Initialization Scripts for Agents | Scene + code lab | Python, TypeScript | SOON |  |
| 36 | Scope Contracts and Task Boundaries | Scene + code lab | Python, TypeScript | SOON |  |
| 37 | Runtime Feedback Loops | Scene + code lab | Python, TypeScript | SOON |  |
| 38 | Verification Gates | Scene + code lab | Python, TypeScript | SOON |  |
| 39 | Reviewer Agent: Separate Builder from Marker | Scene + code lab | Python, TypeScript | SOON |  |
| 40 | Multi-Session Handoff | Scene + code lab | Python, TypeScript | SOON |  |
| 41 | The Workbench on a Real Repo | Scene + code lab | Python, TypeScript | SOON |  |
| 42 | Capstone: Ship a Reusable Agent Workbench Pack | Scene + code lab | Python, TypeScript | SOON | agents |
| 43 | Frame the Task Before the Agent Writes Code | Scene + code lab | Python, TypeScript | SOON |  |
| 44 | Build an Evidence-Backed Execution Plan | Scene + code lab | Python, TypeScript | SOON |  |
| 45 | Delegate Agent Work with Isolation and Merge Contracts | Scene + code lab | Python, TypeScript | SOON |  |
| 46 | Turn Every Agent Correction into a System Improvement | Scene + code lab | Python, TypeScript | SOON |  |
| 47 | Define the Outcome Before You Choose the Output | Scene + code lab | Python, TypeScript | SOON |  |
| 48 | Discover the Workflow People Actually Perform | Scene + code lab | Python, TypeScript | SOON |  |
| 49 | Map Assumptions and Resolve the Riskiest One First | Scene + code lab | Python, TypeScript | SOON |  |
| 50 | Choose the Smallest Slice That Can Change the Decision | Scene + code lab | Python, TypeScript | SOON |  |
| 51 | Write Specifications That Preserve Judgment | Scene + code lab | Python, TypeScript | SOON |  |
| 52 | Design Success Metrics Before the Result Exists | Scene + code lab | Python, TypeScript | SOON | eval |
| 53 | Choose Prototype, Pilot, or Production Deliberately | Scene + code lab | Python, TypeScript | SOON |  |
| 54 | Build a Feedback Ratchet with Ownership and Retirement | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 15 · Autonomous Systems (22)
> Long-horizon agents, self-improvement, and the 2026 safety stack.  
> **Opening incident:** The coding agent force-pushed to main.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | From Chatbots to Long-Horizon Agents (METR) | Scene | Python, TypeScript | SOON | agents |
| 02 | STaR, V-STaR, Quiet-STaR: Self-Taught Reasoning | Scene | Python, TypeScript | SOON |  |
| 03 | AlphaEvolve: Evolutionary Coding Agents | Scene | Python, TypeScript | SOON |  |
| 04 | Darwin Gödel Machine: Self-Modifying Agents | Scene | Python, TypeScript | SOON |  |
| 05 | AI Scientist v2: Workshop-Level Research | Scene | Python, TypeScript | SOON |  |
| 06 | Automated Alignment Research (Anthropic AAR) | Scene | Python, TypeScript | SOON |  |
| 07 | Recursive Self-Improvement: Capability vs Alignment | Scene | Python, TypeScript | SOON |  |
| 08 | Bounded Self-Improvement Designs | Scene | Python, TypeScript | SOON |  |
| 09 | Autonomous Coding Agent Landscape (SWE-bench, CodeAct) | Scene | Python, TypeScript | SOON |  |
| 10 | Permission Modes for Autonomous Agents | Scene | Python, TypeScript | SOON | security |
| 11 | Browser Agents and Indirect Prompt Injection | Scene | Python, TypeScript | SOON | security |
| 12 | Durable Execution for Long-Running Agents | Scene | Python, TypeScript, Go | SOON |  |
| 13 | Action Budgets, Iteration Caps, Cost Governors | Scene | Python, TypeScript | SOON |  |
| 14 | Kill Switches, Circuit Breakers, Canary Tokens | Scene | Python, TypeScript | SOON | security |
| 15 | HITL: Propose-Then-Commit | Scene | Python, TypeScript | SOON |  |
| 16 | Checkpoints and Rollback | Scene | Python, TypeScript | SOON |  |
| 17 | Constitutional AI and Rule Overrides | Scene | Python, TypeScript | SOON |  |
| 18 | Llama Guard and Input/Output Classification | Scene | Python, TypeScript | SOON | security |
| 19 | Anthropic Responsible Scaling Policy v3.0 | Scene | Python, TypeScript | SOON |  |
| 20 | OpenAI Preparedness Framework and DeepMind FSF | Scene | Python, TypeScript | SOON |  |
| 21 | METR Time Horizons and External Evaluation | Scene | Python, TypeScript, Julia | SOON | eval |
| 22 | CAIS, CAISI, and Societal-Scale Risk | Scene | Python, TypeScript | SOON |  |

### Phase 16 · Multi-Agent & Swarms (25)
> Coordination, emergence, and collective intelligence.  
> **Opening incident:** Three agents agree on a wrong answer.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Why Multi-Agent | Scene | TypeScript | SOON |  |
| 02 | FIPA-ACL Heritage and Speech Acts | Scene | Python, TypeScript | SOON |  |
| 03 | Communication Protocols | Scene + code lab | TypeScript | SOON |  |
| 04 | The Multi-Agent Primitive Model | Scene | Python, TypeScript | SOON |  |
| 05 | Supervisor / Orchestrator-Worker Pattern | Scene + code lab | Python, TypeScript | SOON |  |
| 06 | Hierarchical Architecture and Decomposition Drift | Scene | Python, TypeScript | SOON |  |
| 07 | Society of Mind and Multi-Agent Debate | Scene + code lab | Python, TypeScript | SOON |  |
| 08 | Role Specialization — Planner / Critic / Executor / Verifier | Scene + code lab | Python, TypeScript | SOON |  |
| 09 | Parallel Swarm and Networked Architectures | Scene + code lab | Python, TypeScript, Go | SOON |  |
| 10 | Group Chat and Speaker Selection | Scene + code lab | Python, TypeScript | SOON |  |
| 11 | Handoffs and Routines (Stateless Orchestration) | Scene + code lab | Python, TypeScript | SOON | agents |
| 12 | A2A — The Agent-to-Agent Protocol | Scene + code lab | Python, TypeScript, Go | SOON |  |
| 13 | Shared Memory and Blackboard Patterns | Scene + code lab | Python, TypeScript | SOON |  |
| 14 | Consensus and Byzantine Fault Tolerance | Scene + code lab | Python, TypeScript | SOON |  |
| 15 | Voting, Self-Consistency, and Debate Topology | Scene + code lab | Python, TypeScript | SOON |  |
| 16 | Negotiation and Bargaining | Scene + code lab | Python, TypeScript | SOON |  |
| 17 | Generative Agents and Emergent Simulation | Scene + code lab | Python, TypeScript | SOON |  |
| 18 | Theory of Mind and Emergent Coordination | Scene + code lab | Python, TypeScript | SOON |  |
| 19 | Swarm Optimization (PSO, ACO) | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 20 | MARL — MADDPG, QMIX, MAPPO | Scene | Python, TypeScript | SOON |  |
| 21 | Agent Economies, Token Incentives, Reputation | Scene | Python, TypeScript | SOON |  |
| 22 | Production Scaling — Queues, Checkpoints, Durability | Scene + code lab | Python, TypeScript | SOON |  |
| 23 | Failure Modes — MAST, Groupthink, Monoculture | Scene | Python, TypeScript | SOON |  |
| 24 | Evaluation and Coordination Benchmarks | Scene | Python, TypeScript | SOON | eval |
| 25 | Case Studies and 2026 State of the Art | Scene | Python, TypeScript | SOON |  |

## V6 · Production & Safety — 144 lessons
_Serving, safety, capstones._

### Phase 17 · Infrastructure & Production (29)
> Ship AI to the real world.  
> **Opening incident:** p99 latency is 14 s at 200 users — and the bill tripled.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Managed LLM Platforms — Bedrock, Azure OpenAI, Vertex AI | Scene | Python, TypeScript | SOON |  |
| 02 | Inference Platform Economics — Fireworks, Together, Baseten, Modal | Scene | Python, TypeScript | SOON |  |
| 03 | GPU Autoscaling on Kubernetes — Karpenter, KAI Scheduler | Scene | Python, TypeScript | SOON |  |
| 04 | Serving Engine Internals — PagedAttention, Continuous Batching, Chunked Prefill | Scene | Python, TypeScript, Rust | SOON |  |
| 05 | EAGLE-3 Speculative Decoding in Production | Scene | Python, TypeScript | SOON |  |
| 06 | Prefix-Cache Serving — RadixAttention and KV Reuse | Scene | Python, TypeScript, Rust | SOON |  |
| 07 | Hardware-Specialized Inference Compilation — FP8 and NVFP4 on Blackwell | Scene | Python, TypeScript | SOON |  |
| 08 | Inference Metrics — TTFT, TPOT, ITL, Goodput, P99 | Scene | Python, TypeScript | SOON | eval |
| 09 | Production Quantization — AWQ, GPTQ, GGUF, FP8, NVFP4 | Scene | Python, TypeScript | SOON |  |
| 10 | Cold Start Mitigation for Serverless LLMs | Scene | Python, TypeScript | SOON |  |
| 11 | Multi-Region LLM Serving and KV Cache Locality | Scene | Python, TypeScript | SOON |  |
| 12 | Edge Inference — ANE, Hexagon, WebGPU, Jetson | Scene | Python, TypeScript | SOON |  |
| 13 | LLM Observability Stack Selection | Scene | Python, TypeScript | SOON |  |
| 14 | Prompt Caching and Semantic Caching Economics | Scene | Python, TypeScript | SOON |  |
| 15 | Batch APIs — the 50% Discount as Industry Standard | Scene | Python, TypeScript | SOON |  |
| 16 | Model Routing as a Cost-Reduction Primitive | Scene | Python, TypeScript | SOON |  |
| 17 | Disaggregated Prefill/Decode — NVIDIA Dynamo and llm-d | Scene | Python, TypeScript | SOON |  |
| 18 | Production Serving Stack — KV Offloading and Cache-Aware Routing | Scene | Python, TypeScript | SOON |  |
| 19 | AI Gateways — LiteLLM, Portkey, Kong, Bifrost | Scene | Python, TypeScript | SOON |  |
| 20 | Shadow, Canary, and Progressive Deployment | Scene | Python, TypeScript | SOON |  |
| 21 | A/B Testing LLM Features — GrowthBook and Statsig | Scene | Python, TypeScript, Julia | SOON |  |
| 22 | Load Testing LLM APIs — k6, LLMPerf, GenAI-Perf | Scene + code lab | Python, TypeScript | SOON |  |
| 23 | SRE for AI — Multi-Agent Incident Response | Scene | Python, TypeScript | SOON |  |
| 24 | Chaos Engineering for LLM Production | Scene | Python, TypeScript | SOON |  |
| 25 | Security — Secrets, PII Scrubbing, Audit Logs | Scene | Python, TypeScript | SOON | security |
| 26 | Compliance — SOC 2, HIPAA, GDPR, EU AI Act, ISO 42001 | Scene | Python, TypeScript | SOON | security |
| 27 | FinOps for LLMs — Unit Economics and Multi-Tenant Attribution | Scene | Python, TypeScript | SOON |  |
| 28 | Self-Hosted Serving Selection — Matching Engine to Hardware and Scale | Scene | Python, TypeScript | SOON |  |
| 29 | Model Demo Interfaces — From a Function to a Shareable App | Scene + code lab | Python, TypeScript | SOON |  |

### Phase 18 · Ethics, Safety & Alignment (30)
> Build AI that helps humanity. Not optional.  
> **Opening incident:** A PDF told the agent to email the customer list.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Instruction-Following as Alignment Signal | Scene | Python, TypeScript | SOON |  |
| 02 | Reward Hacking & Goodhart's Law | Scene | Python, TypeScript | SOON |  |
| 03 | Direct Preference Optimization Family | Scene | Python, TypeScript | SOON |  |
| 04 | Sycophancy as RLHF Amplification | Scene | Python, TypeScript | SOON |  |
| 05 | Constitutional AI & RLAIF | Scene | Python, TypeScript | SOON |  |
| 06 | Mesa-Optimization & Deceptive Alignment | Scene | Python, TypeScript | SOON |  |
| 07 | Sleeper Agents — Persistent Deception | Scene | Python, TypeScript | SOON |  |
| 08 | In-Context Scheming in Frontier Models | Scene | Python, TypeScript | SOON |  |
| 09 | Alignment Faking | Scene | Python, TypeScript | SOON |  |
| 10 | AI Control — Safety Despite Subversion | Scene | Python, TypeScript | SOON | security |
| 11 | Scalable Oversight & Weak-to-Strong | Scene | Python, TypeScript | SOON |  |
| 12 | Red-Teaming: PAIR & Automated Attacks | Scene + code lab | Python, TypeScript | SOON | security |
| 13 | Many-Shot Jailbreaking | Scene | Python, TypeScript | SOON | security |
| 14 | ASCII Art & Visual Jailbreaks | Scene + code lab | Python, TypeScript | SOON | security |
| 15 | Indirect Prompt Injection | Scene + code lab | Python, TypeScript | SOON | security |
| 16 | Red-Team Tooling: Garak, Llama Guard, PyRIT | Scene + code lab | Python, TypeScript | SOON | security |
| 17 | WMDP & Dual-Use Capability Evaluation | Scene | Python, TypeScript | SOON | eval |
| 18 | Frontier Safety Frameworks — RSP, PF, FSF | Scene | Python, TypeScript | SOON | security |
| 19 | Model Welfare Research | Scene | Python, TypeScript | SOON |  |
| 20 | Bias & Representational Harm | Scene + code lab | Python, TypeScript | SOON |  |
| 21 | Fairness Criteria: Group, Individual, Counterfactual | Scene | Python, TypeScript | SOON |  |
| 22 | Differential Privacy for LLMs | Scene + code lab | Python, TypeScript, Julia | SOON |  |
| 23 | Watermarking: SynthID, Stable Signature, C2PA | Scene + code lab | Python, TypeScript | SOON |  |
| 24 | Regulatory Frameworks: EU, US, UK, Korea | Scene | Python, TypeScript | SOON |  |
| 25 | EchoLeak & CVEs for AI | Scene | Python, TypeScript | SOON |  |
| 26 | Model, System & Dataset Cards | Scene + code lab | Python, TypeScript | SOON |  |
| 27 | Data Provenance & Training-Data Governance | Scene | Python, TypeScript | SOON |  |
| 28 | Alignment Research Ecosystem: MATS, Redwood, Apollo, METR | Scene | Python, TypeScript | SOON |  |
| 29 | Moderation Systems: OpenAI, Perspective, Llama Guard | Scene + code lab | Python, TypeScript | SOON | security |
| 30 | Dual-Use Risk: Cyber, Bio, Chem, Nuclear | Scene | Python, TypeScript | SOON |  |

### Phase 19 · Capstone Projects (85)
> 17 end-to-end products + 9 deep-build tracks. 20-40 hours per project; 4-12 lessons per track.  
> **Opening incident:** Ship it end to end, with evals and a dashboard.

| # | Lesson | Format | Languages | Status | Topics |
|---|---|---|---|---|---|
| 01 | Terminal-Native Coding Agent | Project | Python, TypeScript | SOON |  |
| 02 | RAG over Codebase (Cross-Repo Semantic Search) | Project | Python, TypeScript | SOON | rag |
| 03 | Real-Time Voice Assistant (ASR → LLM → TTS) | Project | Python, TypeScript | SOON |  |
| 04 | Multimodal Document QA (Vision-First) | Project | Python, TypeScript | SOON |  |
| 05 | Autonomous Research Agent (AI-Scientist Class) | Project | Python, TypeScript | SOON |  |
| 06 | DevOps Troubleshooting Agent for Kubernetes | Project | Python, TypeScript | SOON |  |
| 07 | End-to-End Fine-Tuning Pipeline | Project | Python, TypeScript | SOON |  |
| 08 | Production RAG Chatbot (Regulated Vertical) | Project | Python, TypeScript | SOON | rag |
| 09 | Code Migration Agent (Repo-Level Upgrade) | Project | Python, TypeScript | SOON |  |
| 10 | Multi-Agent Software Engineering Team | Project | Python, TypeScript | SOON |  |
| 11 | LLM Observability & Eval Dashboard | Project | Python, TypeScript, Go | SOON | eval |
| 12 | Video Understanding Pipeline (Scene → QA) | Project | Python, TypeScript | SOON |  |
| 13 | Stateless MCP Server with Registry and Governance | Project | Python, TypeScript, Go | SOON | mcp |
| 14 | Speculative-Decoding Inference Server | Project | Python, TypeScript | SOON |  |
| 15 | Constitutional Safety Harness + Red-Team Range | Project | Python, TypeScript | SOON | agents, security |
| 16 | GitHub Issue-to-PR Autonomous Agent | Project | Python, TypeScript | SOON |  |
| 17 | Personal AI Tutor (Adaptive, Multimodal) | Project | Python, TypeScript | SOON |  |
| 20 | Agent Harness Loop Contract | Project | Python, TypeScript | SOON | agents |
| 21 | Tool Registry with Schema Validation | Project | Python, TypeScript | SOON | tools |
| 22 | JSON-RPC 2.0 Over Newline-Delimited Stdio | Project | Python, TypeScript | SOON |  |
| 23 | Function Call Dispatcher | Project | Python, TypeScript | SOON | tools |
| 24 | Plan-Execute Control Flow | Project | Python, TypeScript | SOON | agents |
| 25 | Verification Gates and Observation Budget | Project | Python, TypeScript | SOON |  |
| 26 | Sandbox Runner with Denylist and Path Jail | Project | Python, TypeScript | SOON | security |
| 27 | Eval Harness with Fixture Tasks | Project | Python, TypeScript | SOON | agents, eval |
| 28 | Observability with OTel GenAI Spans and Prometheus Metrics | Project | Python, TypeScript | SOON | eval |
| 29 | End-to-End Coding Agent on the Harness | Project | Python, TypeScript | SOON | agents |
| 30 | BPE Tokenizer From Scratch | Project | Python, TypeScript, Rust | SOON |  |
| 31 | Tokenized Dataset with Sliding Window | Project | Python | SOON |  |
| 32 | Token and Positional Embeddings | Project | Python | SOON |  |
| 33 | Multi-Head Self-Attention | Project | Python | SOON |  |
| 34 | Transformer Block from Scratch | Project | Python | SOON |  |
| 35 | GPT Model Assembly | Project | Python | SOON |  |
| 36 | Training Loop and Evaluation | Project | Python | SOON | eval |
| 37 | Loading Pretrained Weights | Project | Python | SOON |  |
| 38 | Classifier Fine-Tuning by Head Swap | Project | Python | SOON |  |
| 39 | Instruction Tuning by Supervised Fine-Tuning | Project | Python | SOON |  |
| 40 | Direct Preference Optimization from Scratch | Project | Python | SOON |  |
| 41 | Full Evaluation Pipeline | Project | Python | SOON | eval |
| 42 | Large Corpus Downloader | Project | Python, TypeScript | SOON |  |
| 43 | HDF5 Tokenized Corpus | Project | Python | SOON |  |
| 44 | Cosine LR with Linear Warmup | Project | Python | SOON |  |
| 45 | Gradient Clipping and Mixed Precision | Project | Python | SOON |  |
| 46 | Gradient Accumulation | Project | Python | SOON |  |
| 47 | Checkpoint Save and Resume | Project | Python | SOON |  |
| 48 | Distributed Data Parallel and FSDP from Scratch | Project | Python | SOON |  |
| 49 | Language Model Evaluation Harness | Project | Python, TypeScript | SOON | agents, eval |
| 50 | Hypothesis Generator | Project | Python, TypeScript | SOON |  |
| 51 | Literature Retrieval | Project | Python, TypeScript | SOON | rag, eval |
| 52 | Experiment Runner | Project | Python, TypeScript | SOON |  |
| 53 | Result Evaluator | Project | Python | SOON |  |
| 54 | Paper Writer | Project | Python, TypeScript | SOON |  |
| 55 | Critic Loop | Project | Python, TypeScript | SOON |  |
| 56 | Iteration Scheduler | Project | Python, TypeScript | SOON |  |
| 57 | End-to-End Research Demo | Project | Python, TypeScript | SOON |  |
| 58 | Vision Encoder Patches | Project | Python | SOON |  |
| 59 | Vision Transformer Encoder | Project | Python | SOON |  |
| 60 | Projection Layer for Modality Alignment | Project | Python | SOON |  |
| 61 | Cross-Attention Fusion | Project | Python | SOON |  |
| 62 | Vision-Language Pretraining | Project | Python | SOON |  |
| 63 | Multimodal Evaluation | Project | Python | SOON | eval |
| 64 | Chunking Strategies, Compared | Project | Python, TypeScript | SOON | rag |
| 65 | Hybrid Retrieval with BM25 and Dense Embeddings | Project | Python, TypeScript | SOON | rag, eval |
| 66 | Cross-Encoder Reranker | Project | Python | SOON | rag |
| 67 | Query Rewriting: HyDE, Multi-Query, and Decomposition | Project | Python, TypeScript | SOON | rag |
| 68 | RAG Evaluation: Precision, Recall, MRR, nDCG, Faithfulness, Answer Relevance | Project | Python, TypeScript | SOON | rag, eval |
| 69 | End-to-End RAG System | Project | Python | SOON | rag |
| 70 | Task Spec Format | Project | Python, TypeScript | SOON |  |
| 71 | Classical Metrics | Project | Python, TypeScript | SOON | eval |
| 72 | Code Exec Metric | Project | Python, TypeScript | SOON | eval |
| 73 | Perplexity and Calibration | Project | Python, TypeScript | SOON |  |
| 74 | Leaderboard Aggregation | Project | Python, TypeScript | SOON |  |
| 75 | End-to-End Eval Runner | Project | Python, TypeScript | SOON | eval |
| 76 | Collective Ops From Scratch | Project | Python | SOON |  |
| 77 | Data Parallel DDP From Scratch | Project | Python | SOON |  |
| 78 | ZeRO Optimizer State Sharding | Project | Python | SOON |  |
| 79 | Pipeline Parallel and Bubble Analysis | Project | Python | SOON |  |
| 80 | Sharded Checkpoint and Atomic Resume | Project | Python | SOON |  |
| 81 | End-to-End Distributed Training | Project | Python | SOON |  |
| 82 | Jailbreak Taxonomy | Project | Python | SOON | security |
| 83 | Prompt Injection Detector | Project | Python, TypeScript | SOON | security |
| 84 | Refusal Evaluation | Project | Python | SOON | eval, security |
| 85 | Content Classifier Integration | Project | Python, TypeScript | SOON |  |
| 86 | Constitutional Rules Engine | Project | Python | SOON |  |
| 87 | End-to-End Safety Gate | Project | Python, TypeScript | SOON | security |

## AI System Design — 12 cases (our addition)

1. Design Enterprise document Q&A (RAG) — LIVE
2. Design ChatGPT
3. Design Coding assistant
4. Design Customer-support agent
5. Design Real-time voice assistant
6. Design AI search engine
7. Design Deep-research multi-agent system
8. Design LLM gateway / platform
9. Design Content moderation
10. Design Meeting summarizer
11. Design Code-review bot
12. Design LLM-powered recommender
