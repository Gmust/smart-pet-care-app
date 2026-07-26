#!/usr/bin/env bash
# Usage: ./scripts/migrate-icon.sh <old-path> <new-domain> <export-name> <folder-name>
# Example: ./scripts/migrate-icon.sh src/icons/plus general PlusIcon plus
set -euo pipefail

OLD="$1"
DOMAIN="$2"
EXPORT_NAME="$3"
FOLDER="$4"

TARGET_DIR="src/icons/$DOMAIN/$FOLDER"
BARREL="src/icons/$DOMAIN/index.ts"

mkdir -p "src/icons/$DOMAIN"
git mv "$OLD" "$TARGET_DIR"

# Fix relative import depth: a root-level icon (icons/<slug>/index.tsx) is
# ONE level deep and imports "../icons" + "../StyledSvg". Nested under a
# domain (icons/<domain>/<slug>/index.tsx) it's TWO levels deep and needs
# "../../icons" + "../../StyledSvg".
sed -i \
  -e 's#from "\.\./icons"#from "../../icons"#' \
  -e 's#from "\.\./StyledSvg"#from "../../StyledSvg"#' \
  "$TARGET_DIR/index.tsx"

EXPORT_LINE="export { $EXPORT_NAME } from \"./$FOLDER\";"
if [ ! -f "$BARREL" ]; then
  echo "$EXPORT_LINE" > "$BARREL"
  echo "Created $BARREL"
else
  if grep -q "from \"./$FOLDER\"" "$BARREL"; then
    echo "Already present in $BARREL, skipping"
  else
    echo "$EXPORT_LINE" >> "$BARREL"
    echo "Appended to $BARREL"
  fi
fi

echo "Moved $OLD -> $TARGET_DIR"