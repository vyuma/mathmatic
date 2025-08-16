# Implementation Plan

- [x] 1. プロジェクトセットアップと依存関係の追加





  - MathLive、react-markdown、KaTeX等の必要なライブラリをインストール
  - TypeScript型定義とVite設定を更新
  - 基本的なプロジェクト構造を作成
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. 基本データモデルとサービスの実装




- [x] 2.1 Noteデータモデルとインターフェースの定義



  - Note、NoteMetadata、MathNodeの型定義を作成
  - データ検証関数を実装
  - 単体テストを作成
  - _Requirements: 4.1, 5.2_


- [x] 2.2 LocalStorageサービスの実装

  - StorageServiceインターフェースを定義
  - LocalStorageServiceクラスを実装（CRUD操作）
  - エラーハンドリングとStorageErrorクラスを実装
  - 単体テストを作成
  - _Requirements: 4.1, 4.2, 4.4, 6.2_

- [x] 3. 基本レイアウトとナビゲーションの実装


- [x] 3.1 アプリケーションレイアウトコンポーネントの作成


  - Layout、Header、Sidebarコンポーネントを実装
  - レスポンシブデザインのCSS設定
  - モバイル/デスクトップ表示の切り替え機能
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.2 メモ一覧表示機能の実装


  - NoteListコンポーネントを作成
  - メモのタイトル、作成日時、更新日時の表示
  - メモ選択とナビゲーション機能
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
-

- [x] 4. Markdownエディタの基本実装




- [x] 4.1 基本的なMarkdownエディタコンポーネントの作成







  - テキストエリアベースのエディタを実装
  - リアルタイム入力処理とstate管理
  - 基本的なエディタUIとツールバー
  - _Requirements: 1.2, 1.3, 2.1_


- [ ] 4.2 Markdownプレビュー機能の実装






  - react-markdownを使ったプレビューコンポーネント
  - remark-gfmプラグインで拡張Markdown記法をサポート
  - リアルタイムプレビュー更新（デバウンス処理）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
-

- [x] 5. MathLive統合の実装




- [x] 5.1 MathLiveコンポーネントの基本実装






  - MathfieldElementのReactラッパーコンポーネント

  - useMathFieldカスタムフックの実装

  - MathLive設定とカスタマイゼーション

  - _Requirements: 3.1, 3.2_






- [x] 5.2 数式入力モードの実装









  - エディタ内での数式入力トリガー機能
  - MathLiveエディタの表示/非表示制御
  - LaTeX文字列のMarkdownテキストへの挿入


  - _Requirements: 3.1, 3.3_
-

- [x] 5.3 数式プレビューとレンダリングの実装







  - remark-mathとrehype-katexプラグインの統合
  - インライン数式（$...$）とブロック数式（$$...$$）のサポート
  - 数式クリックでの編集モード切り替え
  - _Requirements: 3.4, 3.5_
-



- [x] 6. メモ管理機能の実装






- [x] 6.1 新規メモ作成機能



  - 空白メモの初期化処理

ンドラー
  - 空白メモの初期化処理
  - メモIDの生成とstate管理
  - _Requirements: 1.1, 1.2_





- [x] 6.2 自動保存機能の実装


  - メモ変更の検知とデバウンス処理
  - 5秒間隔での自動保存機能
  - 保存状態の視覚的フィードバック
  - _Requirements: 4.1, 4.2, 4.4_




- [x] 6.3 手動保存とメモ削除機能


  - 手動保存ボタンと即座保存処理
  - 削除確認ダイアログの実装
  - メモ削除処理と一覧からの除去
  - _Requirements: 4.3, 6.1, 6.2, 6.3, 6.4_



-

- [x] 7. エクスポート機能の実装







- [x] 7.1 エクスポートサービスの基本実装



  - ExportServiceクラスとExportFormatインターフェース
  - Markdownファイルエクスポート機能
  - ファイルダウンロード処理
  - _Requirements: 8.1, 8.2_

- [x] 7.2 HTML形式エクスポートの実装



  - HTMLレンダリング機能（Ka
TeX CSS含む）
  - 完全なHTMLドキュメント生成
  - 数式の適切な形式での出力
  - _Requirements: 8.3, 8.4_

-



- [x] 8. エラーハンドリングとユーザビリティの向上




- [x] 8.1 包括的なエラーハンドリングの実装



  - ErrorBoundaryコンポーネントの作成

  - StorageError、MathRenderError、ExportErrorの処理

  - ユーザーフレンドリーなエラーメッセージ表示

  - _Requirements: 全般的なエラー処理_


- [x] 8.2 タッチデバイス最適化



  - タッチ操作に最適化されたUI調整
  - MathLiveのバーチャルキーボード設定

  - モバイルでの使いやすさ向上
  - _Requirements: 7.4_





- [x] 9. テストとパフォーマンス最適化




- [x] 9.1 単体テストの実装







  - 主要コンポーネントのReact Testing Libraryテスト
  - サービスクラスのJestテスト
  - 数式処理ユーティリティのテスト
  - _Requirements: 全般的な品質保証_

- [x] 9.2 パフォーマンス最適化の実装

  - React.memoによるコンポーネント最適化
  - MathLiveの遅延読み込み実装
  - 大きなメモリストでの仮想スクロール
  - _Requirements: 全般的なパフォーマンス_




- [x] 10. 最終統合とポリッシュ






  - 全機能の統合テストと動作確認
  - UIの最終調整とスタイリング
  - アクセシビリティの確認と改善
  - _Requirements: 全要件の最終確認_
- [x] 11. 数式表示モード修正

  - mathUtils.tsのreplaceMathExpressionとinsertMathExpression関数でディスプレイモード（$$）とインラインモード（$）の区別を修正
  - useMathEditing.tsのcompleteMathEditing関数でディスプレイモードの区別を修正
  - 数式の正しい表示形式を確保
  - _Requirements: 3.4, 3.5_

- [x] 12. 数式エディタ自動フォーカス改善

  - MathEditorコンポーネントの自動フォーカス機能を改善
  - 数式編集モード開始時に確実にカーソルがフォーカスされるように修正
  - タッチデバイスでの仮想キーボード表示の最適化
  - _Requirements: 3.1, 3.2_