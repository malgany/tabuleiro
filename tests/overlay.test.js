import { jest } from '@jest/globals';
import { showOverlay, showPopup } from '../js/ui.js';

describe('overlay helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('showOverlay adds and removes element', () => {
    showOverlay('Olá', { duration: 100 });
    expect(document.querySelector('.overlay')).not.toBeNull();

    jest.advanceTimersByTime(100);
    jest.advanceTimersByTime(300);
    expect(document.querySelector('.overlay')).toBeNull();
  });

  test('showPopup adds and removes element', () => {
    showPopup('Oi', { duration: 100, corner: 'top-right' });
    expect(document.querySelector('.popup')).not.toBeNull();
    expect(
      document.querySelector('.popup-container.top-right'),
    ).not.toBeNull();

    jest.advanceTimersByTime(100);
    jest.advanceTimersByTime(300);
    expect(document.querySelector('.popup')).toBeNull();
    expect(document.querySelector('.popup-container')).toBeNull();
  });
});
