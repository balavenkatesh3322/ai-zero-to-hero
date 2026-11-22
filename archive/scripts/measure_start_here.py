"""Measure every model-internal number shown in the Start Here lessons — no hand-typed data.

Runs one real open model (Qwen2.5-0.5B-Instruct) on CPU and writes src/lessons/data/start-here.json:
  - tokenization of the lesson question (token strings + ids) and English/Spanish/Hindi token counts
  - input-embedding vectors and cosine similarities for three words
  - attention from the next-token position back to the question tokens
  - next-token probabilities with and without the policy in context, at several temperatures
  - the model's actual greedy answers (with/without context, with/without a system prompt)

Usage:  .venv/bin/python measure_start_here.py ../../src/lessons/data/start-here.json
"""
import datetime
import json
import sys

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
OUT = sys.argv[1]
torch.manual_seed(0)

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.float32, attn_implementation="eager")
model.eval()
revision = getattr(model.config, "_commit_hash", None)

QUESTION = "How long do I have to return shoes?"
SYSTEM_PLAIN = "You are a customer-support assistant for an online shoe store. Answer in one sentence."
POLICY = "Store policy: Returns are accepted within 14 days of delivery."
ANSWER_PREFIX = "You have "


def chat_ids(system: str, user: str, prefix: str = "") -> list[int]:
    msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    text = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True) + prefix
    return tok(text, add_special_tokens=False)["input_ids"]


def show(t: str) -> str:
    return tok.convert_tokens_to_string([t])


@torch.no_grad()
def next_token(ids: list[int], temps: list[float], k: int = 5):
    out = model(torch.tensor([ids]), output_attentions=True)
    logits = out.logits[0, -1].float()
    result = {}
    for T in temps:
        if T == 0:
            p = torch.zeros_like(logits); p[logits.argmax()] = 1.0
        else:
            p = torch.softmax(logits / T, dim=-1)
        top = torch.topk(p, k)
        result[str(T)] = [{"token": tok.decode([i]), "p": round(float(v), 4)} for v, i in zip(top.values, top.indices)]
    return result, out.attentions


@torch.no_grad()
def greedy(ids: list[int], max_new: int = 40) -> str:
    g = model.generate(torch.tensor([ids]), max_new_tokens=max_new, do_sample=False, pad_token_id=tok.eos_token_id)
    return tok.decode(g[0, len(ids):], skip_special_tokens=True).strip()


data = {
    "provenance": {
        "model": MODEL, "revision": revision, "dtype": "float32", "device": "cpu",
        "measuredAt": datetime.date.today().isoformat(),
        "script": "scripts/data/measure_start_here.py",
        "torch": torch.__version__,
        "note": "Probabilities are softmax(logits / T) over the full vocabulary; T = 0 means greedy (argmax).",
    }
}

# 1. Tokenization of the question
q_ids = tok(QUESTION, add_special_tokens=False)["input_ids"]
data["tokens"] = [{"text": show(t), "id": i} for t, i in zip(tok.convert_ids_to_tokens(q_ids), q_ids)]

# 2. Same question in three languages (translations written by hand, counts measured)
LANGS = {
    "English": QUESTION,
    "Spanish": "¿Cuánto tiempo tengo para devolver los zapatos?",
    "Hindi": "मुझे जूते लौटाने के लिए कितना समय मिलता है?",
}
data["languages"] = [{"lang": k, "text": v, "tokens": len(tok(v, add_special_tokens=False)["input_ids"]), "chars": len(v)} for k, v in LANGS.items()]

# 3. Input embeddings for three words (first sub-token of each, leading space as in a sentence)
emb = model.get_input_embeddings().weight
words = [" return", " refund", " shoes"]
vecs = {}
data["embeddings"] = {"dims": int(emb.shape[1]), "words": []}
for w in words:
    ids = tok(w, add_special_tokens=False)["input_ids"]
    v = emb[ids[0]].float()
    vecs[w] = v
    data["embeddings"]["words"].append({"word": w, "tokenIds": ids, "first12": [round(float(x), 4) for x in v[:12]]})
cos = torch.nn.functional.cosine_similarity
data["embeddings"]["cosine"] = [
    {"a": a, "b": b, "cos": round(float(cos(vecs[a], vecs[b], dim=0)), 4)}
    for a, b in [(" return", " refund"), (" return", " shoes"), (" refund", " shoes")]
]

# 4. Next-token odds: without and with the policy in context
TEMPS = [0, 0.7, 1.5]
plain_ids = chat_ids(SYSTEM_PLAIN, QUESTION, ANSWER_PREFIX)
plain, attns = next_token(plain_ids, TEMPS)
grounded_ids = chat_ids(SYSTEM_PLAIN + " " + POLICY, QUESTION, ANSWER_PREFIX)
grounded, _ = next_token(grounded_ids, TEMPS)
data["nextToken"] = {"prompt": {"system": SYSTEM_PLAIN, "user": QUESTION, "assistantPrefix": ANSWER_PREFIX},
                     "policy": POLICY, "promptTokens": len(plain_ids), "groundedPromptTokens": len(grounded_ids),
                     "withoutPolicy": plain, "withPolicy": grounded}

# 4b. Whole candidate answers "You have N days": joint probability of the number tokens + " days" at each temperature
CANDIDATES = ["14", "30", "60", "90"]

@torch.no_grad()
def seq_prob(prefix_ids: list[int], cont: str, T: float) -> float:
    c_ids = tok(cont, add_special_tokens=False)["input_ids"]
    ids = torch.tensor([prefix_ids + c_ids])
    logits = model(ids).logits[0].float()
    total = 1.0
    for j, t in enumerate(c_ids):
        row = logits[len(prefix_ids) + j - 1]
        if T == 0:
            total *= 1.0 if int(row.argmax()) == t else 0.0
        else:
            total *= float(torch.softmax(row / T, dim=-1)[t])
    return total

def candidates(prefix_ids):
    out = {}
    for T in TEMPS:
        raw = {c: seq_prob(prefix_ids, c + " days", T) for c in CANDIDATES}
        z = sum(raw.values()) or 1.0
        out[str(T)] = [{"answer": c + " days", "p": round(raw[c], 5), "shareOfShown": round(raw[c] / z, 4)} for c in CANDIDATES]
    return out

data["candidates"] = {"candidates": [c + " days" for c in CANDIDATES], "withoutPolicy": candidates(plain_ids), "withPolicy": candidates(grounded_ids),
                      "note": "p = product over the answer's tokens of softmax(logits/T); shareOfShown renormalises over these four answers only."}

# 5. Attention from the last position to the question tokens (last layer, mean over heads)
full_text = tok.decode(plain_ids)
start = None
for s in range(len(plain_ids) - len(q_ids) + 1):
    if plain_ids[s:s + len(q_ids)] == q_ids:
        start = s
if start is not None:
    last = attns[-1][0].mean(dim=0)[-1]           # [seq]
    w = last[start:start + len(q_ids)].float()
    w = w / w.sum()
    data["attention"] = {"layer": "last", "heads": "mean", "fromPosition": "next-token position",
                         "tokens": [{"text": show(t), "weight": round(float(x), 4)} for t, x in zip(tok.convert_ids_to_tokens(q_ids), w)]}

# 6. The model's actual answers (greedy decoding)
data["answers"] = {
    "withoutPolicy": greedy(chat_ids(SYSTEM_PLAIN, QUESTION)),
    "withPolicy": greedy(chat_ids(SYSTEM_PLAIN + " " + POLICY, QUESTION)),
    "systemFrench": greedy(chat_ids("Always answer in French, in one sentence.", "What is a token in a language model?")),
    "systemOneSentence": greedy(chat_ids("Answer in one short sentence.", "What is a token in a language model?")),
    "systemPirate": greedy(chat_ids("You are a pirate. Always answer like a pirate.", "What is a token in a language model?")),
    "systemNone": greedy(chat_ids("You are a helpful assistant.", "What is a token in a language model?"), max_new=60),
}

# 7. Chat template: how roles become one token stream
data["chatTemplate"] = {"rendered": tok.apply_chat_template(
    [{"role": "system", "content": "Answer in one short sentence."}, {"role": "user", "content": "What is a token?"}],
    tokenize=False, add_generation_prompt=True),
    "contextWindow": int(model.config.max_position_embeddings), "vocabSize": int(model.config.vocab_size)}

# 8. Tokenization samples for the Tokens lesson (texts written for the lesson; token splits measured)
SAMPLES = {
    "English sentence": "How long do I have to return shoes?",
    "Spanish sentence": "¿Cuánto tiempo tengo para devolver los zapatos?",
    "Hindi sentence": "मुझे जूते लौटाने के लिए कितना समय मिलता है?",
    "A number": "The order total is 1234567.89 dollars.",
    "Python code": "def add(a, b):\n    return a + b",
    "JSON": '{"order_id": 4521, "status": "shipped"}',
    "Emoji": "Great service 👍🎉",
}
data["samples"] = []
for name, text in SAMPLES.items():
    ids = tok(text, add_special_tokens=False)["input_ids"]
    data["samples"].append({"name": name, "text": text, "chars": len(text), "tokens": [{"text": tok.decode([i]), "id": i} for i in ids]})

# 9. Statelessness: the model only knows what is in this request
def chat_msgs(msgs):
    text = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
    return tok(text, add_special_tokens=False)["input_ids"]
SYS = {"role": "system", "content": "You are a helpful assistant. Answer in one sentence."}
data["memory"] = {
    "firstTurn": {"user": "Hi, my name is Priya."},
    "secondTurnUser": "What is my name?",
    "withoutHistory": greedy(chat_msgs([SYS, {"role": "user", "content": "What is my name?"}])),
}
first_reply = greedy(chat_msgs([SYS, {"role": "user", "content": "Hi, my name is Priya."}]))
data["memory"]["firstTurn"]["assistant"] = first_reply
data["memory"]["withHistory"] = greedy(chat_msgs([SYS, {"role": "user", "content": "Hi, my name is Priya."}, {"role": "assistant", "content": first_reply}, {"role": "user", "content": "What is my name?"}]))

# 10. GenAI on a classic ML task (spam), for the "What is AI" lesson
EMAILS = ["You won a FREE cruise! Click here to claim your prize now.", "Hi, can you send me the invoice for order 4521?"]
data["spam"] = [{"email": e, "llm": greedy(chat_msgs([{"role": "system", "content": "Classify the email as SPAM or NOT SPAM. Reply with the label and a reason of at most 10 words."}, {"role": "user", "content": e}]), max_new=24)} for e in EMAILS]

json.dump(data, open(OUT, "w"), indent=1, ensure_ascii=False)
print(json.dumps(data, indent=1, ensure_ascii=False)[:6000])
