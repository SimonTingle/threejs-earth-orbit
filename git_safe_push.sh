#!/bin/bash
set -euo pipefail

# === CONFIG ===
ARCHIVE_PREFIX="archive"
DATE_TAG=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_FOLDER="${ARCHIVE_PREFIX}_${DATE_TAG}"

# === GUARD RAILS ===
echo "=== GIT ARCHIVE SAFETY SCRIPT ==="

# Ensure inside a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repository. Exiting."
  exit 1
fi

# Ensure clean working directory
if [[ -n "$(git status --porcelain)" ]]; then
  echo "⚠️ Your working directory has uncommitted changes."
  read -rp "Do you want to continue anyway? (y/N): " cont
  [[ "$cont" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
fi

# Confirm current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  read -rp "You are NOT on main branch. Continue anyway? (y/N): " cont
  [[ "$cont" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
fi

# Test GitHub connection
if ! git ls-remote --exit-code >/dev/null 2>&1; then
  echo "❌ Cannot connect to remote repository. Check your credentials."
  exit 1
fi

# Pull latest just in case
echo "Fetching latest remote changes..."
git fetch origin
git pull origin "$CURRENT_BRANCH" --rebase

# Check if archive folder already exists
if [ -d "$ARCHIVE_PREFIX" ] || git ls-tree -r HEAD --name-only | grep -q "^${ARCHIVE_PREFIX}"; then
  echo "⚠️ Archive folder already exists in repo."
  echo "Creating a new one named: ${ARCHIVE_FOLDER}"
else
  ARCHIVE_FOLDER="${ARCHIVE_PREFIX}"
fi

# Confirm archiving
echo ""
echo "Ready to move current code into '${ARCHIVE_FOLDER}'"
read -rp "Do you want to continue and archive the current main branch? (y/N): " cont
[[ "$cont" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }

# Create archive folder
mkdir -p "$ARCHIVE_FOLDER"

# Move all project files except .git and archive folder itself
echo "Archiving current files..."
shopt -s dotglob
for item in *; do
  [[ "$item" == ".git" || "$item" == "$ARCHIVE_FOLDER" ]] && continue
  mv "$item" "$ARCHIVE_FOLDER"/
done
shopt -u dotglob

git add .
git commit -m "Archive old main code into ${ARCHIVE_FOLDER}"
git push origin "$CURRENT_BRANCH"

echo "✅ Old code archived successfully in '${ARCHIVE_FOLDER}'"

# Prompt for next step
echo ""
read -rp "Now ready to add new code to main and push? (y/N): " proceed
[[ "$proceed" =~ ^[Yy]$ ]] || { echo "Aborted after archive."; exit 0; }

# Add new code step — you can modify this section as needed
echo ""
echo "=== READY TO UPDATE MAIN ==="
echo "Place your new code in the project root, then run:"
echo "  git add ."
echo "  git commit -m \"Add new code\""
echo "  git push origin main"
echo ""
echo "🟢 Archive completed safely. Main is ready for update."
