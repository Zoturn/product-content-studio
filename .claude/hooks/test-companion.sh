#!/usr/bin/env bash
# PostToolUse(Write|Edit): report a missing or stale companion spec for the file just written.
#
# Advisory only, never blocking. Jest specs live beside their source as <name>.spec.ts, so a
# missing or outdated one is visible the moment the source changes rather than at review time.
set -u

payload=$(cat)

json_field() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$payload" | jq -r "$1 // empty"
  else
    printf '%s' "$payload" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);process.stdout.write($2||'')}catch(e){}})"
  fi
}

file=$(json_field '.tool_response.filePath // .tool_input.file_path' '(j.tool_response&&j.tool_response.filePath)||(j.tool_input&&j.tool_input.file_path)')
[ -n "$file" ] || exit 0
file=${file//\\//}          # Windows paths arrive backslash-separated
[ -f "$file" ] || exit 0

# Only the logic worth unit-testing: services, validation, auth helpers, components.
case "$file" in
  */src/lib/*|*/src/components/*) ;;
  *) exit 0 ;;
esac

case "$file" in
  *.spec.ts|*.spec.tsx|*.cy.ts|*.cy.tsx) exit 0 ;;
  *.d.ts|*/index.ts|*.config.ts) exit 0 ;;
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

base=${file%.*}
ext=${file##*.}
spec="$base.spec.$ext"

message=""
if [ ! -f "$spec" ]; then
  message="No test file exists for $file. Decide whether this file warrants tests; if it does, create $(basename "$spec") beside it — Jest for logic and services, Cypress for anything crossing an HTTP or browser boundary. If it genuinely does not warrant tests, say why."
elif [ "$file" -nt "$spec" ]; then
  message="$file is newer than its test $(basename "$spec"). Check whether this edit added behaviour the existing tests do not cover — new branches, new error paths, new props — and extend the spec accordingly."
fi

[ -n "$message" ] || exit 0

if command -v jq >/dev/null 2>&1; then
  jq -nc --arg m "$message" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
else
  node -e 'process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:process.argv[1]}}))' "$message"
fi
exit 0
