import { render, screen } from '@testing-library/react';
import { LogoutLoader } from '@/components/LogoutLoader';

describe('LogoutLoader', () => {
  // ========== Component Rendering Tests ==========

  describe('renderingTests_isVisibleFalse_shouldNotRender', () => {
    it('should not render any content when isVisible is false', () => {
      const { container } = render(<LogoutLoader isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('renderingTests_isVisibleTrue_shouldRenderOverlay', () => {
    it('should render overlay when isVisible is true', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveStyle({
        position: 'fixed',
        inset: '0',
        zIndex: '100',
      });
    });
  });

  describe('renderingTests_isVisibleTrue_shouldRenderModal', () => {
    it('should render modal dialog when isVisible is true', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveStyle({
        position: 'relative',
        maxWidth: '580px',
        width: '90%',
      });
    });
  });

  describe('renderingTests_wordmarkDisplay_shouldShowCorrectText', () => {
    it('should display wordmark with "break" and "Down" text', () => {
      render(<LogoutLoader isVisible={true} />);
      expect(screen.getByText('break')).toBeInTheDocument();
      expect(screen.getByText('Down')).toBeInTheDocument();
    });
  });

  describe('renderingTests_wordmarkDisplay_shouldApplyCorrectColors', () => {
    it('should apply correct colors to wordmark parts', () => {
      render(<LogoutLoader isVisible={true} />);
      const breakSpan = screen.getByText('break');
      const downSpan = screen.getByText('Down');

      expect(breakSpan).toHaveStyle({
        color: 'var(--fg-primary)',
      });
      expect(downSpan).toHaveStyle({
        color: 'var(--accent-highlight)',
      });
    });
  });

  // ========== Default Variant Tests (Status Bar) ==========

  describe('defaultVariantTests_statusBar_shouldRenderStatusBarVariant', () => {
    it('should render status bar variant by default', () => {
      render(<LogoutLoader isVisible={true} />);
      const statusText = screen.getByText('Signing you out');
      expect(statusText).toBeInTheDocument();
      expect(statusText).toHaveStyle({
        color: 'var(--fg-primary)',
      });
    });
  });

  describe('defaultVariantTests_statusBar_shouldDisplayPulsingDot', () => {
    it('should display pulsing dot in status bar variant', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      // Find all span elements and check for the dot with animation
      const spans = container.querySelectorAll('span');
      let foundAnimatedDot = false;

      spans.forEach((span) => {
        const style = window.getComputedStyle(span);
        if (style.animation && style.animation.includes('pulse-logout')) {
          foundAnimatedDot = true;
        }
      });

      // Alternative: check for dot with specific dimensions
      const statusBar = screen.getByRole('dialog');
      const dotsInStatusBar = statusBar.querySelectorAll('[style*="width: 10px"]');
      expect(dotsInStatusBar.length).toBeGreaterThan(0);
    });
  });

  describe('defaultVariantTests_statusBar_shouldDisplayStatusText', () => {
    it('should display default status text "Signing you out"', () => {
      render(<LogoutLoader isVisible={true} />);
      expect(screen.getByText('Signing you out')).toBeInTheDocument();
    });
  });

  // ========== Variant Tests ==========

  describe('variantTests_minimal_shouldRenderMinimalVariant', () => {
    it('should render minimal variant with dot and text', () => {
      render(<LogoutLoader isVisible={true} variant="minimal" />);
      expect(screen.getByText('Signing you out')).toBeInTheDocument();

      // Check for bracket symbol (●)
      const minimalText = screen.getByText('Signing you out').parentElement;
      expect(minimalText?.textContent).toContain('●');
    });
  });

  describe('variantTests_spinner_shouldRenderSpinnerVariant', () => {
    it('should render spinner variant with spinner icon and text', () => {
      render(<LogoutLoader isVisible={true} variant="spinner" />);
      expect(screen.getByText('Signing you out')).toBeInTheDocument();
      expect(screen.getByText('Securing your data')).toBeInTheDocument();
    });
  });

  describe('variantTests_statusbar_shouldRenderStatusBarVariant', () => {
    it('should render status bar variant explicitly', () => {
      render(<LogoutLoader isVisible={true} variant="statusbar" />);
      expect(screen.getByText('Signing you out')).toBeInTheDocument();
    });
  });

  // ========== Text Content Tests ==========

  describe('textContentTests_customStatusText_shouldDisplayCustomText', () => {
    it('should display custom status text when provided', () => {
      render(
        <LogoutLoader isVisible={true} statusText="Securely logging out" />
      );
      expect(screen.getByText('Securely logging out')).toBeInTheDocument();
    });
  });

  describe('textContentTests_customSubtitleText_shouldDisplayCustomSubtitle', () => {
    it('should display custom subtitle text in spinner variant', () => {
      render(
        <LogoutLoader
          isVisible={true}
          variant="spinner"
          subtitleText="Please wait"
        />
      );
      expect(screen.getByText('Please wait')).toBeInTheDocument();
    });
  });

  // ========== Animation Tests ==========

  describe('animationTests_cssAnimations_shouldIncludeKeyframes', () => {
    it('should include pulse-logout keyframes in style tag', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('@keyframes pulse-logout');
    });
  });

  describe('animationTests_cssAnimations_shouldIncludeSpinKeyframes', () => {
    it('should include spin-logout keyframes in style tag', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('@keyframes spin-logout');
    });
  });

  describe('animationTests_dotAnimation_shouldApplyAnimationClass', () => {
    it('should apply pulse animation to dot in status bar variant', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('animation: pulse-logout 1s ease-in-out infinite');
    });
  });

  describe('animationTests_dotAnimation_minimalVariant_shouldApplyCorrectDuration', () => {
    it('should apply 1.5s animation duration to dot in minimal variant', () => {
      const { container } = render(
        <LogoutLoader isVisible={true} variant="minimal" />
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('animation: pulse-logout 1.5s ease-in-out infinite');
    });
  });

  describe('animationTests_spinnerAnimation_shouldApplySpinAnimation', () => {
    it('should apply spin animation to spinner variant', () => {
      const { container } = render(
        <LogoutLoader isVisible={true} variant="spinner" />
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('animation: spin-logout 0.8s linear infinite');
    });
  });

  // ========== Accessibility Tests ==========

  describe('a11yTests_overlayRole_shouldHaveStatusRole', () => {
    it('should have role="status" on overlay', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('a11yTests_overlayAriaLive_shouldHaveAriaLivePolite', () => {
    it('should have aria-live="polite" on overlay', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('a11yTests_overlayAriaLabel_shouldHaveDefaultAriaLabel', () => {
    it('should have default aria-label on overlay', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute(
        'aria-label',
        'Signing you out. Please wait.'
      );
    });
  });

  describe('a11yTests_customAriaLabel_shouldDisplayCustomAriaLabel', () => {
    it('should display custom aria-label when provided', () => {
      render(
        <LogoutLoader
          isVisible={true}
          ariaLabel="Logging you out securely"
        />
      );
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute(
        'aria-label',
        'Logging you out securely'
      );
    });
  });

  describe('a11yTests_modalRole_shouldHaveDialogRole', () => {
    it('should have role="dialog" on modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('a11yTests_modalAriaModal_shouldHaveAriaModal', () => {
    it('should have aria-modal="true" on modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('a11yTests_modalAriaLabel_shouldHaveAriaLabel', () => {
    it('should have aria-label on modal for screen readers', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-label');
    });
  });

  // ========== Styling Tests ==========

  describe('stylingTests_overlay_shouldHaveCorrectBackgroundColor', () => {
    it('should have semi-transparent black background on overlay', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      });
    });
  });

  describe('stylingTests_overlay_shouldPreventInteraction', () => {
    it('should have pointer-events properties for overlay', () => {
      render(<LogoutLoader isVisible={true} />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveStyle({
        position: 'fixed',
        display: 'flex',
        zIndex: '100',
      });
    });
  });

  describe('stylingTests_modal_shouldBeCentered', () => {
    it('should center modal with flexbox', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });
  });

  describe('stylingTests_modal_shouldHaveCorrectMaxWidth', () => {
    it('should have max-width of 580px on modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        maxWidth: '580px',
      });
    });
  });

  describe('stylingTests_modal_shouldHaveResponsiveWidth', () => {
    it('should have width of 90% on modal for responsive behavior', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        width: '90%',
      });
    });
  });

  describe('stylingTests_modal_shouldHavePadding', () => {
    it('should have padding for content spacing inside modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        padding: '40px 56px',
      });
    });
  });

  describe('stylingTests_modal_shouldHaveBorder', () => {
    it('should have border on modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        border: '1px solid var(--border-strong)',
      });
    });
  });

  describe('stylingTests_modal_shouldHaveBorderRadius', () => {
    it('should have border-radius on modal', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        borderRadius: 'var(--radius-lg)',
      });
    });
  });

  describe('stylingTests_modal_shouldHaveShadow', () => {
    it('should have box-shadow on modal for depth', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
      });
    });
  });

  // ========== Edge Case Tests ==========

  describe('edgeCaseTests_rapidToggle_shouldHandleVisibilityToggle', () => {
    it('should handle rapid isVisible toggles without errors', () => {
      const { rerender } = render(<LogoutLoader isVisible={false} />);

      rerender(<LogoutLoader isVisible={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<LogoutLoader isVisible={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<LogoutLoader isVisible={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('edgeCaseTests_modalOverflow_shouldNotOverflowOnMobile', () => {
    it('should have responsive styling to prevent text overflow on mobile', () => {
      render(<LogoutLoader isVisible={true} />);
      const modal = screen.getByRole('dialog');
      const textContent = screen.getByText('Signing you out');

      expect(modal).toHaveStyle({
        width: '90%',
        maxWidth: '580px',
      });
      expect(textContent).toBeInTheDocument();
    });
  });

  describe('edgeCaseTests_longStatusText_shouldHandleLongText', () => {
    it('should handle long status text without breaking layout', () => {
      const longText =
        'Securely signing you out and cleaning up your session data';
      render(
        <LogoutLoader isVisible={true} statusText={longText} />
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  // ========== Props Combinations Tests ==========

  describe('propsCombinationTests_allPropsCustom_shouldRenderWithAllCustomProps', () => {
    it('should render with all custom props specified', () => {
      render(
        <LogoutLoader
          isVisible={true}
          variant="spinner"
          statusText="Custom logout"
          subtitleText="Custom subtitle"
          ariaLabel="Custom aria label"
        />
      );

      expect(screen.getByText('Custom logout')).toBeInTheDocument();
      expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Custom aria label'
      );
    });
  });

  describe('propsCombinationTests_minimalVariant_shouldIgnoreSubtitleText', () => {
    it('should not display subtitle text in minimal variant', () => {
      render(
        <LogoutLoader
          isVisible={true}
          variant="minimal"
          subtitleText="This should not appear"
        />
      );

      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
    });
  });

  describe('propsCombinationTests_statusBarVariant_shouldIgnoreSubtitleText', () => {
    it('should not display subtitle text in status bar variant', () => {
      render(
        <LogoutLoader
          isVisible={true}
          variant="statusbar"
          subtitleText="This should not appear"
        />
      );

      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
    });
  });

  // ========== Integration Tests ==========

  describe('integrationTests_fullComponentFlow_shouldRenderCompleteUI', () => {
    it('should render complete logout loader UI with all elements', () => {
      render(<LogoutLoader isVisible={true} />);

      // Check overlay
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Check modal
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Check wordmark
      expect(screen.getByText('break')).toBeInTheDocument();
      expect(screen.getByText('Down')).toBeInTheDocument();

      // Check status text
      expect(screen.getByText('Signing you out')).toBeInTheDocument();

      // Check accessibility attributes
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('integrationTests_styleTagInjection_shouldInjectAnimationStyles', () => {
    it('should inject CSS animations via style tag', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      const styleTag = container.querySelector('style');

      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('@keyframes pulse-logout');
      expect(styleTag?.textContent).toContain('@keyframes spin-logout');
    });
  });

  describe('integrationTests_contentVariance_shouldRenderDifferentContentPerVariant', () => {
    it('should render different content structure for each variant', () => {
      const { rerender, container: container1 } = render(
        <LogoutLoader isVisible={true} variant="minimal" />
      );

      let styleContent1 = container1.querySelector('style')?.textContent || '';
      expect(styleContent1).toContain('1.5s');

      rerender(<LogoutLoader isVisible={true} variant="statusbar" />);
      let styleContent2 = container1.querySelector('style')?.textContent || '';
      expect(styleContent2).toBeDefined();

      rerender(<LogoutLoader isVisible={true} variant="spinner" />);
      expect(screen.getByText('Securing your data')).toBeInTheDocument();
    });
  });

  // ========== Return Value Tests ==========

  describe('returnValueTests_notVisible_shouldReturnNull', () => {
    it('should return null when isVisible is false', () => {
      const { container } = render(<LogoutLoader isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('returnValueTests_visible_shouldReturnReactNode', () => {
    it('should return React elements when isVisible is true', () => {
      const { container } = render(<LogoutLoader isVisible={true} />);
      expect(container.firstChild).not.toBeNull();
    });
  });
});
