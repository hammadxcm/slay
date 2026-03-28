import { FLAGS, PROFILE_SUBCOMMANDS, SUBCOMMANDS } from './index.js';

export function generateZsh(): string {
  const subcommands = SUBCOMMANDS.map((s) => `'${s}:${s} command'`).join(' ');
  const flags = FLAGS.map((f) => `'${f}'`).join(' ');
  const profileSubs = PROFILE_SUBCOMMANDS.map((s) => `'${s}'`).join(' ');

  return `#compdef slay
# slay zsh completion

_slay() {
  local -a subcommands flags profile_subs

  subcommands=(${subcommands})
  flags=(${flags})
  profile_subs=(${profileSubs})

  if (( CURRENT == 2 )); then
    _describe 'command' subcommands
    _describe 'flags' flags
    return
  fi

  case "\${words[2]}" in
    profile)
      if (( CURRENT == 3 )); then
        _describe 'profile subcommand' profile_subs
      fi
      return
      ;;
    completions)
      if (( CURRENT == 3 )); then
        local -a shells
        shells=('bash' 'zsh' 'fish')
        _describe 'shell' shells
      fi
      return
      ;;
  esac

  case "\${words[CURRENT-1]}" in
    --profile)
      local -a names
      names=(\$(slay --list-profile-names 2>/dev/null))
      _describe 'profile' names
      return
      ;;
  esac

  _describe 'flags' flags
}

compdef _slay slay
`;
}
