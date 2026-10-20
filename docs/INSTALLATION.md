# 🔧 Installation Guide

---

## ⚡ NPM (Recommended)

```bash
npm install -g optikit
```

Verify:

```bash
optikit --version
```

You get two commands — `optikit` and `ok` — both work identically.

---

## 📦 Homebrew

### Via HTTPS

```bash
brew tap dev-mahmoud-elshenawy/optikit
brew install optikit
```

### Via SSH (Recommended)

```bash
brew tap dev-mahmoud-elshenawy/optikit git@github.com:dev-mahmoud-elshenawy/optikit.git
brew install optikit
```

---

## 🛠️ From Source

```bash
git clone https://github.com/dev-mahmoud-elshenawy/optikit.git
cd optikit
npm install && npm run build
npm link
```

Verify:

```bash
optikit --version
```

---

## ✅ Shell Autocomplete (Optional)

Enable tab completion for all commands and flags:

```bash
optikit completion >> ~/.zshrc && source ~/.zshrc
```

---

## 🚀 Next Steps

```bash
optikit init                    # Setup OptiKit in your Flutter project
optikit aliases                 # See all commands & shortcuts
optikit --help                  # Full help
```
