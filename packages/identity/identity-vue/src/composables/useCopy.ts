
export function useCopy(){

  function unsecuredCopyToClipboard(text:string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
  }

  async function copy(text:string) {
    if(navigator.clipboard){
      await  navigator.clipboard.writeText(text)
    }else{
      unsecuredCopyToClipboard(text)
    }
  }

  return {
    copy,
  }
}
