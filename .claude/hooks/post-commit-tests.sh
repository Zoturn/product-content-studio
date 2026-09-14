#!/usr/bin/env bash
# PostToolUse(Bash): after a git commit that touched application code, run Jest.
#
# Silent when the suite is green. A commit that breaks tests should say so immediately, while the
# change is still in mind, rather than at the next manual run.
set -u

payload=$(cat)

json_field() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$payload" | jq -r "$1 // empty"
  else
    printf '%s' "$payload" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);process.stdout.write($2||'')}catch(e){}})"
  fi
}

command_text=$(json_field '.tool_input.command' '(j.tool_input&&j.tool_input.command)')
case "$command_text" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

[ -d node_modules ] || exit 0
command -v npm >/dev/null 2>&1 || exit 0

changed=$(git show --name-only --pretty=format: HEAD 2>/dev/null)
[ -n "$changed" ] || exit 0

case "$changed" in
  *src/*|*prisma/*) ;;
  *) exit 0 ;;
esac

if output=$(npm test --silent 2>&1); then
  exit 0
fi

message="Jest failed after this commit. Fix it before moving on, and do not stack further work on a red suite:"$'\n'"$(printf '%s' "$output" | tail -40)"

if command -v jq >/dev/null 2>&1; then
  jq -nc --arg m "$message" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
else
  node -e 'process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:process.argv[1]}}))' "$message"
fi
exit 0
