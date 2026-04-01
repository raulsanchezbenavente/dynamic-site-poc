import { ClipboardCopyHelperService } from './clipboard-copy.service';

describe('ClipboardCopyHelperService', () => {
  let service: ClipboardCopyHelperService;
  let clipboardWriteTextSpy: jasmine.Spy;

  beforeEach(() => {
    service = new ClipboardCopyHelperService();
    clipboardWriteTextSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call navigator.clipboard.writeText with value', () => {
    service.copy('test-value');
    expect(clipboardWriteTextSpy).toHaveBeenCalledWith('test-value');
  });

  it('should handle clipboard copy failure', async () => {
    clipboardWriteTextSpy.and.returnValue(Promise.reject('error'));
    const consoleErrorSpy = spyOn(console, 'error');
    await service.copy('fail-value');
    setTimeout(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Clipboard copy failed:', 'error');
    }, 0);
  });
});
