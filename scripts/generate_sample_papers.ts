import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function createAcademicPdf(
  filename: string,
  title: string,
  authors: string,
  abstract: string,
  sections: Array<{ heading: string; page: number; content: string[] }>
) {
  const pdfDoc = await PDFDocument.create();
  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHeading = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Group sections by page
  const pageMap = new Map<number, Array<{ heading?: string; text: string; isAbstract?: boolean }>>();

  // Page 1: Title, Authors, Abstract, Introduction
  pageMap.set(1, [
    { text: title, isAbstract: false },
    { text: authors, isAbstract: false },
    { text: abstract, isAbstract: true },
  ]);

  for (const s of sections) {
    if (!pageMap.has(s.page)) {
      pageMap.set(s.page, []);
    }
    const list = pageMap.get(s.page)!;
    list.push({ heading: s.heading, text: s.content.join('\n\n') });
  }

  const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);

  for (const pageNum of sortedPages) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // Header / Footer
    page.drawText(`PaperPilot Academic Archive — Document Page ${pageNum}`, {
      x: 50,
      y: height - 30,
      size: 9,
      font: fontItalic,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(`Page ${pageNum} of ${sortedPages.length}`, {
      x: width - 100,
      y: 30,
      size: 9,
      font: fontBody,
      color: rgb(0.4, 0.4, 0.4),
    });

    const items = pageMap.get(pageNum) || [];
    for (const item of items) {
      if (pageNum === 1 && item === items[0]) {
        // Document Title
        page.drawText(item.text, {
          x: 50,
          y,
          size: 16,
          font: fontTitle,
          color: rgb(0.1, 0.2, 0.4),
        });
        y -= 25;
      } else if (pageNum === 1 && item === items[1]) {
        // Authors
        page.drawText(item.text, {
          x: 50,
          y,
          size: 10,
          font: fontItalic,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 25;
      } else if (item.isAbstract) {
        // Abstract Box
        page.drawRectangle({
          x: 45,
          y: y - 80,
          width: width - 90,
          height: 90,
          color: rgb(0.95, 0.97, 1.0),
          borderColor: rgb(0.8, 0.85, 0.95),
          borderWidth: 1,
        });
        page.drawText('ABSTRACT', {
          x: 55,
          y: y - 5,
          size: 10,
          font: fontHeading,
          color: rgb(0.1, 0.3, 0.6),
        });

        // Split text roughly
        const lines = wrapText(item.text, 80);
        let absY = y - 20;
        for (const line of lines.slice(0, 5)) {
          page.drawText(line, {
            x: 55,
            y: absY,
            size: 9,
            font: fontBody,
            color: rgb(0.2, 0.2, 0.2),
          });
          absY -= 12;
        }
        y -= 105;
      } else {
        if (item.heading) {
          y -= 10;
          page.drawText(item.heading, {
            x: 50,
            y,
            size: 12,
            font: fontHeading,
            color: rgb(0.15, 0.25, 0.45),
          });
          y -= 16;
        }

        const paragraphs = item.text.split('\n\n');
        for (const para of paragraphs) {
          const lines = wrapText(para, 85);
          for (const line of lines) {
            if (y < 60) break;
            page.drawText(line, {
              x: 50,
              y,
              size: 9.5,
              font: fontBody,
              color: rgb(0.15, 0.15, 0.15),
            });
            y -= 13;
          }
          y -= 6;
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const dir = path.join(process.cwd(), 'sample_papers');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const outPath = path.join(dir, filename);
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Generated: ${outPath} (${pdfBytes.length} bytes, ${sortedPages.length} pages)`);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = current ? current + ' ' + w : w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function main() {
  // Paper 1: Attention Is All You Need
  await createAcademicPdf(
    'Attention_Is_All_You_Need.pdf',
    'Attention Is All You Need',
    'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin (Google Brain / Google Research)',
    'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a novel network architecture based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    [
      {
        page: 1,
        heading: '1. Introduction & Background',
        content: [
          'Recurrent neural networks, long short-term memory (LSTM), and gated recurrent neural networks have been firmly established as state-of-the-art approaches in sequence modeling. Recurrent models inherently factor computation along the symbol positions of input and output sequences. This sequentially generates a sequence of hidden states h_t, preventing parallelization within training examples, which becomes critical at longer sequence lengths.',
          'Attention mechanisms have become an integral part of compelling sequence modeling, allowing modeling of dependencies without regard to their distance in the input or output sequences. In this work we propose the Transformer, an architecture eschewing recurrence and instead relying entirely on self-attention to compute representations of input and output.',
        ],
      },
      {
        page: 2,
        heading: '2. Model Architecture: Scaled Dot-Product & Multi-Head Attention',
        content: [
          'The Transformer follows an encoder-decoder structure using stacked self-attention and point-wise, fully connected layers for both encoder and decoder. The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism, and a simple position-wise fully connected feed-forward network.',
          'Scaled Dot-Product Attention: We compute attention on queries Q, keys K, and values V as: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. The scaling factor 1/sqrt(d_k) counteracts extremely small gradients for large dimensions d_k.',
          'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions: MultiHead(Q,K,V) = Concat(head_1, ..., head_h) * W^O, where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V). In our work we employ h = 8 parallel attention heads.',
        ],
      },
      {
        page: 3,
        heading: '3. Empirical Results on WMT 2014 & Computational Complexity',
        content: [
          'On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4, outperforming the best existing models including ensembles by more than 2.0 BLEU. Training took 3.5 days on 8 NVIDIA P100 GPUs, a fraction of previous training costs.',
          'On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days, at 1/4 the training cost of previously published models.',
          'Limitations & Complexity: Self-attention per layer has computational complexity O(n^2 * d) where n is sequence length and d is representation dimension. When sequence length n exceeds dimension d, self-attention layers are slower than recurrent layers, necessitating future work for extreme context lengths.',
        ],
      },
    ]
  );

  // Paper 2: LoRA: Low-Rank Adaptation of Large Language Models
  await createAcademicPdf(
    'LoRA_Low_Rank_Adaptation.pdf',
    'LoRA: Low-Rank Adaptation of Large Language Models',
    'Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen (Microsoft Corporation)',
    'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks. Full fine-tuning becomes prohibitive as models scale to hundreds of billions of parameters. We propose Low-Rank Adaptation (LoRA), which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters.',
    [
      {
        page: 1,
        heading: '1. Introduction and The Problem of Adaptation Scale',
        content: [
          'Natural language processing has undergone a revolution driven by scaled pre-trained models such as GPT-3 (175B parameters). Adapting these models via full fine-tuning requires updating all parameters for every downstream task, requiring enormous storage and compute. For GPT-3, storing independent fine-tuned checkpoints of 175B parameters for dozens of tasks is practically unfeasible.',
          'Existing parameter-efficient methods such as prefix tuning or adapter layers introduce non-trivial inference latency (by adding serial computation layers) or reduce the sequence length available for context.',
        ],
      },
      {
        page: 2,
        heading: '2. Methodology: Low-Rank Matrix Decomposition',
        content: [
          'We take inspiration from intrinsic dimension studies showing that parameter updates Delta_W during task adaptation reside in a low-dimensional subspace. For a pre-trained weight matrix W_0 in R^{d x k}, we constrain its update by representing it as Delta_W = B * A, where B in R^{d x r} and A in R^{r x k}, with rank r << min(d, k).',
          'During training, W_0 is frozen and receives no gradient updates, while A and B contain trainable parameters. For input x, modified forward pass is h = W_0 * x + (alpha / r) * B * A * x. We initialize A with Gaussian distribution and B with zero, so Delta_W = 0 at the start of training.',
          'Key Advantages: No added inference latency because W = W_0 + Delta_W can be pre-computed and merged directly when deploying. Furthermore, switching between tasks requires swapping only the low-rank matrices.',
        ],
      },
      {
        page: 3,
        heading: '3. Results on GPT-3 175B, Benchmarks & Limitations',
        content: [
          'Experiments on RoBERTa, DeBERTa, and GPT-3 175B demonstrate that LoRA performs on par or better than full fine-tuning on GLUE, MultiNLI, and WikiSQL benchmarks, while using 10,000 times fewer trainable parameters and 3 times less GPU memory.',
          'On GPT-3 175B, LoRA reduces trainable parameter count from 175,255.8M to 37.7M (with r = 4), achieving 73.4% accuracy on WikiSQL compared to 73.8% for full fine-tuning.',
          'Limitations: It is not straightforward to batch inputs across different tasks with different rank adaptations in a single forward pass without dynamic kernel dispatching. Additionally, selecting optimal rank r across heterogeneous task families requires empirical tuning.',
        ],
      },
    ]
  );

  // Paper 3: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
  await createAcademicPdf(
    'RAG_Retrieval_Augmented_Generation.pdf',
    'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    'Patrick Lewis, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Scott Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela (Facebook AI Research / UCL / NYU)',
    'Large pre-trained language models store factual knowledge in their parameters, but their ability to access and manipulate knowledge is limited, and they prone to hallucinations. We present Retrieval-Augmented Generation (RAG) models, which combine pre-trained parametric memory (seq2seq generator) with non-parametric memory (dense vector index of Wikipedia) accessed via Dense Passage Retrieval (DPR).',
    [
      {
        page: 1,
        heading: '1. Introduction: Parametric vs Non-Parametric Memory',
        content: [
          'Pre-trained neural language models have achieved remarkable success on open-domain NLP benchmarks. However, they struggle to update their factual knowledge dynamically, can hallucinate incorrect assertions with high confidence, and cannot readily cite specific external evidence supporting their claims.',
          'We introduce RAG, a general-purpose fine-tuning recipe for sequence-to-sequence models that augments parametric memory (BART generator) with a non-parametric retrieval component based on Dense Passage Retrieval (DPR) over a dense vector index of 21 million Wikipedia passages.',
        ],
      },
      {
        page: 2,
        heading: '2. RAG Architectures: RAG-Sequence vs RAG-Token',
        content: [
          'The retriever p_eta(z|x) uses DPR: dense bi-encoder with query encoder q(x) and document encoder d(z) computing similarity via dot product. Top-k retrieved passages z are passed to the generator p_theta(y|x, z).',
          'RAG-Sequence Model: Uses the same retrieved document to predict all target tokens: p_RAG-Seq(y|x) = sum_{z} p_eta(z|x) * prod_{i} p_theta(y_i | x, z, y_{1:i-1}). It generates complete candidate sequences per document and marginalizes.',
          'RAG-Token Model: Allows each token to attend to a different retrieved document: p_RAG-Token(y|x) = prod_{i} sum_{z} p_eta(z|x) * p_theta(y_i | x, z, y_{1:i-1}). This allows the generator to synthesize information from multiple distinct documents when constructing an answer.',
        ],
      },
      {
        page: 3,
        heading: '3. Benchmark Results, Open-Domain QA & Limitations',
        content: [
          'We evaluate RAG on open-domain question answering datasets: Natural Questions (NQ), TriviaQA, WebQuestions, and CuratedTREC, alongside Jeopardy question generation and fact verification (FEVER).',
          'On Natural Questions, RAG achieves 44.5 Exact Match (EM), substantially outperforming closed-book T5-11B (34.5 EM) and DPR alone (41.5 EM). On TriviaQA, RAG achieves 56.1 EM.',
          'Key Findings & Limitations: Non-parametric memory allows updating knowledge simply by swapping the passage index without retraining model weights. However, limitations include: retrieval errors propagate directly to the generator; fixed passage chunking (100 words) can fragment multi-sentence reasoning; and DPR retriever was kept frozen during generator training.',
        ],
      },
    ]
  );
}

main().catch(console.error);
