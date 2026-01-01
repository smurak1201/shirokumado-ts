# WSL UbuntuでのNode.jsセットアップガイド

WSL上のUbuntuでNode.jsを最新バージョンにアップグレードする方法を説明します。

## 📋 前提条件

- WSL2上のUbuntu
- 管理者権限（sudo）

## 🔧 Node.jsのアップグレード方法

### 方法1: nvmを使用（推奨）

nvm（Node Version Manager）を使用すると、複数のNode.jsバージョンを簡単に切り替えられます。

#### 1. nvmのインストール

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# シェル設定を再読み込み
source ~/.bashrc
# または
source ~/.zshrc
```

#### 2. Node.js 24のインストール

```bash
# 最新のLTSバージョンをインストール
nvm install 24

# インストールしたバージョンを使用
nvm use 24

# デフォルトバージョンを設定
nvm alias default 24

# バージョンを確認
node --version
npm --version
```

#### 3. プロジェクトで自動的にバージョンを使用

プロジェクトルートに`.nvmrc`ファイルがある場合、以下のコマンドで自動的にそのバージョンを使用できます：

```bash
# プロジェクトディレクトリに移動
cd /home/user/app/shirokumado-ts

# .nvmrcに指定されたバージョンを使用
nvm use

# または、自動的に使用するように設定（.bashrcに追加）
echo 'autoload -U add-zsh-hook' >> ~/.zshrc
echo 'load-nvmrc() {' >> ~/.zshrc
echo '  local node_version="$(nvm version)"' >> ~/.zshrc
echo '  local nvmrc_path="$(nvm_find_nvmrc)"' >> ~/.zshrc
echo '  if [ -n "$nvmrc_path" ]; then' >> ~/.zshrc
echo '    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")' >> ~/.zshrc
echo '    if [ "$nvmrc_node_version" != "N/A" ] && [ "$nvmrc_node_version" != "$node_version" ]; then' >> ~/.zshrc
echo '      nvm use' >> ~/.zshrc
echo '    fi' >> ~/.zshrc
echo '  fi' >> ~/.zshrc
echo '}' >> ~/.zshrc
echo 'add-zsh-hook chpwd load-nvmrc' >> ~/.zshrc
echo 'load-nvmrc' >> ~/.zshrc
```

### 方法2: NodeSourceリポジトリを使用

#### 1. 既存のNode.jsを削除（オプション）

```bash
# aptでインストールしたNode.jsを削除
sudo apt remove nodejs npm
sudo apt autoremove
```

#### 2. NodeSourceリポジトリを追加

```bash
# Node.js 24.xのリポジトリを追加
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -

# Node.jsをインストール
sudo apt install -y nodejs

# バージョンを確認
node --version
npm --version
```

### 方法3: Snapを使用

```bash
# Node.js 24をインストール
sudo snap install node --classic --channel=24

# バージョンを確認
node --version
npm --version
```

## 🔄 プロジェクトの依存関係を再インストール

Node.jsをアップグレードした後、プロジェクトの依存関係を再インストールしてください：

```bash
cd /home/user/app/shirokumado-ts

# node_modulesとpackage-lock.jsonを削除
rm -rf node_modules package-lock.json

# 依存関係を再インストール
npm install
```

## ✅ 確認

以下のコマンドで、正しいバージョンが使用されているか確認できます：

```bash
# Node.jsのバージョン確認
node --version  # v24.x.x が表示されるはずです

# npmのバージョン確認
npm --version   # 11.x.x が表示されるはずです

# プロジェクトのengines要件を確認
npm run build   # エラーが出ないか確認
```

## 🐛 トラブルシューティング

### nvmコマンドが見つからない

```bash
# .bashrcまたは.zshrcに以下を追加
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 設定を再読み込み
source ~/.bashrc
# または
source ~/.zshrc
```

### 複数のNode.jsバージョンがインストールされている

```bash
# インストールされているバージョンを確認
nvm list

# 不要なバージョンを削除
nvm uninstall <version>

# デフォルトバージョンを設定
nvm alias default 24
```

### パスの問題

```bash
# 現在のNode.jsのパスを確認
which node

# nvmを使用している場合、~/.nvm/versions/node/v24.x.x/bin/node が表示されるはずです
```

## 📚 参考リンク

- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [NodeSource](https://github.com/nodesource/distributions)
- [Node.js公式サイト](https://nodejs.org/)
- [WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/)
