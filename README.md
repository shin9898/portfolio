# Koki Hata — portfolio

白表紙のめくり本。[GitHub Pages](https://shin9898.github.io/portfolio/) 向けの静的 HTML。v5 は **16頁**。職務経歴書の写しではない。

- 氏名: Koki Hata
- GitHub: [shin9898](https://github.com/shin9898)
- 所属: 株式会社トリプルスリー（フルスタックエンジニア）

## 中身（16頁）

- 表紙 — 氏名・職種・一言。概要への入口
- P.01–02 — 経歴1行と得意3つ。ONBOARDING の要約と代表証拠
- P.03–04 — ONBOARDING。問題と判断、結果といま。移行は未着手
- P.05–06 — workbench の流れと、学びが次の手順になった公開例
- P.07–08 — Claude → Codex → CodeRabbit と、公開できる差し戻し1件
- P.09–10 — 顧客の声を、開発の判断へ
- P.11–12 — この本の設計と、改修前後・検証
- P.13–14 — ログアウトで開く直リンクと連絡
- 裏表紙 — 氏名、GitHub、更新日、クレジット

打順は P.01 だけ。連絡先は GitHub のみ。

めくりは **page-flip 2.0.7**。必須操作ではない。`?page=N` で任意の頁。概要は 1、ONBOARDING は 3。

壁紙は Noun Project の野球線画（CC BY 3.0）。マークは Lucide（ISC）。

## ローカル

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

[http://127.0.0.1:4173/](http://127.0.0.1:4173/) を開く。
