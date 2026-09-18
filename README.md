# Koki Hata — portfolio

白表紙のめくり本。[GitHub Pages](https://shin9898.github.io/portfolio/) 向けの静的 HTML。v4 は **仕組みと、仕事の1話**。職務経歴書の写しではない。

- 氏名: Koki Hata
- GitHub: [shin9898](https://github.com/shin9898)
- 所属: 株式会社トリプルスリー（フルスタックエンジニア）

## 中身（16頁）

出典は本人の職務経歴書 PDF（2026年9月18日現在）、本人談、個人リポジトリのコード。書いてないことは書かない。

- 表紙
- だれか（銀行約8年 → 飲食 SaaS）+ 仕組み4つの地図
- **workbench** — skills / hooks / cron / 学習ループ。打順の 3・4・5 が主
- **AI ハーネス** — Claude → Codex → CodeRabbit。人が止まれる
- **ベイビー PdM** — 2026.07〜、肩書なし。拾う → 案 → 承認※ → 進行 → 届ける※
- **このめくり本** — 職務経歴書の写しではない。載せないものを先に書く
- **仕事の1話** — ONBOARDING リニューアルの土台（モノレポ、LIFF と管理者 Web、未着手のデータ移行、ハーネス）。名前変更は本人の案ではない
- 出典 + 連絡

切った頁: 年表、なぜ銀行→エンジニア、エンジニア/CS/銀行の業務カード、ENGAGEMENT / ONBOARDING / REPORT の目次、マージ件数、技術カタログ、自己PRの独立頁。

めくりは **page-flip 2.0.7**。`?page=N` で任意の頁（だれかは 1、仕組みは 2、1話は 11）。

壁紙は Noun Project の野球線画（CC BY 3.0）。マークは Lucide（ISC）: workbench `square-terminal` / ハーネス `git-branch` / PdM `clipboard-list` / この本 `book-open` / 1話 `refresh-cw` / 銀行 `landmark`。

## ローカル

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

[http://127.0.0.1:4173/](http://127.0.0.1:4173/) を開く。
