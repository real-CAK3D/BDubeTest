# Chat meaning model

`all-MiniLM-L6-v2` by sentence-transformers (Apache License 2.0), in the
8-bit ONNX form published at huggingface.co/Xenova/all-MiniLM-L6-v2.

The shop chat uses it (see `lib/meaning.ts`) to tell when two sentences mean
the same thing. It runs on the website's own server; nothing is sent anywhere.
Delete this folder and the chat still works, just without it.
