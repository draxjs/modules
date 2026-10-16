#!/usr/bin/env bash
set -euo pipefail

commit_message="Update shared AI skills"
create_commit="false"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --commit)
            create_commit="true"
            shift
            ;;
        --message|-m)
            if [[ $# -lt 2 ]]; then
                echo "Missing value for $1" >&2
                exit 1
            fi
            commit_message="$2"
            shift 2
            ;;
        --help|-h)
            cat <<'EOF'
Usage: ./update-agent-skills.sh [--commit] [--message "Commit message"]

Initializes and synchronizes the .agent submodule with the shared Drax AI skills repository.

By default, it stages the updated .agent pointer when it changes.
Use --commit to also create the commit in this scaffold repository.
EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

project_root="$(git rev-parse --show-toplevel)"

if [[ "$project_root" != "$script_dir" ]]; then
    echo "Run this script from the scaffold repository root: $project_root" >&2
    exit 1
fi

if [[ ! -f ".gitmodules" ]]; then
    echo "Missing .gitmodules file." >&2
    exit 1
fi

if ! git config --file .gitmodules --get-regexp "submodule\\..*\\.path" | grep -q "[[:space:]]\\.agent$"; then
    echo "The .agent submodule is not configured in .gitmodules." >&2
    exit 1
fi

before="$(git rev-parse "HEAD:.agent" 2>/dev/null || true)"

git submodule sync .agent
git submodule update --init --recursive .agent

if [[ -n "$(git -C .agent status --short)" ]]; then
    echo "The .agent submodule has local changes. Commit, stash, or discard them before syncing." >&2
    exit 1
fi

git submodule update --remote .agent

after="$(git -C .agent rev-parse HEAD)"

if [[ "$before" == "$after" ]]; then
    echo ".agent is already synchronized at ${after:0:12}."
    exit 0
fi

git add .agent

if [[ "$create_commit" == "true" ]]; then
    git commit -m "$commit_message" -- .agent
    echo ".agent synchronized from ${before:0:12} to ${after:0:12}."
    exit 0
fi

echo ".agent synchronized from ${before:0:12} to ${after:0:12}."
echo "The updated submodule pointer is staged."
echo "Commit it with:"
echo "git commit -m \"$commit_message\""
