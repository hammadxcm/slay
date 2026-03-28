import { FLAGS, PROFILE_SUBCOMMANDS, SUBCOMMANDS } from './index.js';

export function generateBash(): string {
  const subcommands = SUBCOMMANDS.join(' ');
  const flags = FLAGS.join(' ');
  const profileSubs = PROFILE_SUBCOMMANDS.join(' ');

  return `# slay bash completion
_slay_completions() {
  local cur prev words cword
  _init_completion || return

  local subcommands="${subcommands}"
  local flags="${flags}"
  local profile_subs="${profileSubs}"

  if [[ \${cword} -eq 1 ]]; then
    COMPREPLY=( \$(compgen -W "\${subcommands} \${flags}" -- "\${cur}") )
    return
  fi

  case "\${words[1]}" in
    profile)
      if [[ \${cword} -eq 2 ]]; then
        COMPREPLY=( \$(compgen -W "\${profile_subs}" -- "\${cur}") )
      fi
      return
      ;;
    completions)
      if [[ \${cword} -eq 2 ]]; then
        COMPREPLY=( \$(compgen -W "bash zsh fish" -- "\${cur}") )
      fi
      return
      ;;
  esac

  case "\${prev}" in
    --profile)
      local names
      names=\$(slay --list-profile-names 2>/dev/null)
      COMPREPLY=( \$(compgen -W "\${names}" -- "\${cur}") )
      return
      ;;
  esac

  COMPREPLY=( \$(compgen -W "\${flags}" -- "\${cur}") )
}

complete -F _slay_completions slay
`;
}
