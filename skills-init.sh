#!/usr/bin/env bash
set -euo pipefail

submodule_path=".agent"
submodule_url="https://github.com/draxjs/ai-skills.git"
submodule_branch="main"
backup_created=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            cat <<'EOF'
Usage: ./init-agent-skills.sh

Initializes the shared Drax AI skills submodule at .agent.

If .agent is already configured as a submodule, the script initializes and synchronizes it.
If .agent is still a local folder, the script moves it to a timestamped backup folder and
adds https://github.com/draxjs/ai-skills.git as the .agent submodule.
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
    echo "Run this script from the repository root: $project_root" >&2
    exit 1
fi

is_agent_submodule() {
    git ls-files --stage "$submodule_path" 2>/dev/null | awk '{print $1}' | grep -q '^160000$'
}

has_agent_submodule_config() {
    [[ -f ".gitmodules" ]] && git config --file .gitmodules --get-regexp "submodule\\..*\\.path" 2>/dev/null | grep -q "[[:space:]]$submodule_path$"
}

if is_agent_submodule || has_agent_submodule_config; then
    git submodule sync "$submodule_path"
    git submodule update --init --recursive "$submodule_path"
    git config -f .gitmodules "submodule.$submodule_path.branch" "$submodule_branch"
    git add .gitmodules "$submodule_path"
    echo "$submodule_path is configured as a submodule."
    echo "Current commit: $(git -C "$submodule_path" rev-parse --short HEAD)"
    exit 0
fi

if [[ -e "$submodule_path" || -L "$submodule_path" ]]; then
    backup_path=".agent.local-backup-$(date +%Y%m%d%H%M%S)"
    mv "$submodule_path" "$backup_path"
    backup_created="$backup_path"

    if [[ -n "$(git ls-files "$submodule_path")" ]]; then
        git rm -r --cached "$submodule_path"
    fi
fi

git submodule add -b "$submodule_branch" "$submodule_url" "$submodule_path"
git submodule update --init --recursive "$submodule_path"
git add .gitmodules "$submodule_path"

echo "$submodule_path was added as a submodule from $submodule_url."
echo "Current commit: $(git -C "$submodule_path" rev-parse --short HEAD)"

if [[ -n "$backup_created" ]]; then
    echo "Previous local $submodule_path folder was moved to $backup_created."
    echo "Review and remove that backup folder after confirming the migration."
fi

echo "Commit the migration with:"
echo "git commit -m \"Use shared AI skills submodule\""
