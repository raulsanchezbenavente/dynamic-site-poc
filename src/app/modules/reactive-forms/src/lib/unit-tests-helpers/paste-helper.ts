export function simulatePaste(input: HTMLInputElement, text: string) {
  // 1) Dispara el evento 'paste' con clipboardData (si el entorno lo soporta)
  let defaultPrevented = false;
  try {
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    const evt = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    defaultPrevented = !input.dispatchEvent(evt) || evt.defaultPrevented;
  } catch {
    // Algunos entornos (JSDOM/iOS) no soportan ClipboardEvent constructor
  }

  // 2) Si nadie previno, insertamos manualmente el texto como haría el navegador
  if (!defaultPrevented) {
    const start = input.selectionStart ?? input.value.length;
    const end   = input.selectionEnd   ?? input.value.length;

    let next = input.value.slice(0, start) + text + input.value.slice(end);

    // Respeta maxlength si está definido
    if (input.maxLength >= 0) {
      next = next.slice(0, input.maxLength);
    }

    input.value = next;

    // 3) Notificamos cambio
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}