#!/bin/bash
# Generated via opfab --completion
# Added manually :  
#    [[ $COMPREPLY ]] && return      
#    _filedir
# to solve issue with file completion see https://github.com/f/omelette/issues/4

if type compdef &>/dev/null; then
  _opfab_completion() {
    compadd -- `opfab --compzsh --compgen "${CURRENT}" "${words[CURRENT-1]}" "${BUFFER}"`
  }
  compdef _opfab_completion opfab
elif type complete &>/dev/null; then
  _opfab_completion() {
    local cur prev nb_colon
    _get_comp_words_by_ref -n : cur prev
    nb_colon=$(grep -o ":" <<< "$COMP_LINE" | wc -l)

    COMPREPLY=( $(compgen -W '$(opfab --compbash --compgen "$((COMP_CWORD - (nb_colon * 2)))" "$prev" "${COMP_LINE}")' -- "$cur") )
    __ltrim_colon_completions "$cur"
    # Added 
    [[ ${#COMPREPLY[@]} -gt 0 ]] && return  
    _filedir
    # End added
  }
  complete -F _opfab_completion opfab
elif type compctl &>/dev/null; then
  _opfab_completion () {
    local cword line point si
    read -Ac words
    read -cn cword
    read -l line
    si="$IFS"
    if ! IFS=$'
' reply=($(opfab --compzsh --compgen "${cword}" "${words[cword-1]}" "${line}")); then
      local ret=$?
      IFS="$si"
      return $ret
    fi
    IFS="$si"
  }
  compctl -K _opfab_completion opfab
fi

