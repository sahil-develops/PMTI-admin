/**
 * FAQ Handler for Blog Posts
 * This script provides interactive FAQ functionality for published blog posts
 */

(function() {
  'use strict';

  // FAQ Toggle Function
  function toggleFAQ(faqId) {
    const content = document.getElementById(`${faqId}-content`);
    const icon = document.querySelector(`[data-faq-id="${faqId}"] .faq-icon`);
    
    if (content && icon) {
      const isExpanded = content.classList.contains('expanded');
      
      if (isExpanded) {
        content.classList.remove('expanded');
        if (icon instanceof HTMLElement) {
          icon.style.transform = 'rotate(0deg)';
        }
      } else {
        content.classList.add('expanded');
        if (icon instanceof HTMLElement) {
          icon.style.transform = 'rotate(180deg)';
        }
      }
    }
  }

  // Add global toggle function
  window.toggleFAQ = toggleFAQ;

  // Auto-initialize FAQs when DOM is loaded
  function initializeFAQs() {
    // Add CSS styles for FAQ blocks
    const style = document.createElement('style');
    style.textContent = `
      /* WordPress-style FAQ blocks */
      .wp-faq-block {
        margin: 2rem 0;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: box-shadow 0.2s ease;
      }

      .wp-faq-block:hover {
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      .faq-header {
        padding: 1.25rem 1.5rem;
        background: #4338ca;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.2s ease;
        user-select: none;
      }

      .faq-header:hover {
        background: #3730a3;
      }

      .faq-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.4;
      }

      .faq-icon {
        transition: transform 0.3s ease;
        min-width: 20px;
        min-height: 20px;
        flex-shrink: 0;
      }

      .faq-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .faq-content.expanded {
        max-height: 1000px;
      }

      .faq-content > div {
        padding: 1.5rem;
        background-color: #f8fafc;
        color: #374151;
        line-height: 1.6;
      }

      .faq-content p {
        margin: 0 0 1rem 0;
      }

      .faq-content p:last-child {
        margin-bottom: 0;
      }

      .faq-content ul, .faq-content ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .faq-content li {
        margin: 0.5rem 0;
      }

      .faq-content strong {
        font-weight: 600;
        color: #1f2937;
      }

      .faq-content em {
        font-style: italic;
        color: #6b7280;
      }

      .faq-content a {
        color: #2563eb;
        text-decoration: none;
      }

      .faq-content a:hover {
        text-decoration: underline;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .faq-header {
          padding: 1rem 1.25rem;
        }

        .faq-header h3 {
          font-size: 1rem;
        }

        .faq-content > div {
          padding: 1.25rem;
        }
      }

      /* Accessibility improvements */
      .faq-header:focus {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }

      .faq-header:focus:not(:focus-visible) {
        outline: none;
      }

      /* Animation for smooth transitions */
      @keyframes faqExpand {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .faq-content.expanded > div {
        animation: faqExpand 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);

    // Add click event listeners to all FAQ headers
    const faqHeaders = document.querySelectorAll('.faq-header');
    faqHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const faqBlock = this.closest('.wp-faq-block');
        if (faqBlock) {
          const faqId = faqBlock.getAttribute('data-faq-id');
          if (faqId) {
            toggleFAQ(faqId);
          }
        }
      });

      // Add keyboard support for accessibility
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });

      // Add ARIA attributes for accessibility
      const faqBlock = header.closest('.wp-faq-block');
      if (faqBlock) {
        const faqId = faqBlock.getAttribute('data-faq-id');
        const content = document.getElementById(`${faqId}-content`);
        
        if (content) {
          header.setAttribute('role', 'button');
          header.setAttribute('tabindex', '0');
          header.setAttribute('aria-expanded', 'false');
          header.setAttribute('aria-controls', `${faqId}-content`);
          
          content.setAttribute('role', 'region');
          content.setAttribute('aria-labelledby', `${faqId}-header`);
        }
      }
    });

    // Add analytics tracking (optional)
    function trackFAQInteraction(faqId, action) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'faq_interaction', {
          'event_category': 'FAQ',
          'event_label': action,
          'faq_id': faqId
        });
      }
      
      // Also track with other analytics if available
      if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', {
          event_name: 'FAQ Interaction',
          faq_id: faqId,
          action: action
        });
      }
    }

    // Enhanced toggle function with analytics
    window.toggleFAQ = function(faqId) {
      const content = document.getElementById(`${faqId}-content`);
      const icon = document.querySelector(`[data-faq-id="${faqId}"] .faq-icon`);
      const header = document.querySelector(`[data-faq-id="${faqId}"] .faq-header`);
      
      if (content && icon && header) {
        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
          content.classList.remove('expanded');
          header.setAttribute('aria-expanded', 'false');
          if (icon instanceof HTMLElement) {
            icon.style.transform = 'rotate(0deg)';
          }
          trackFAQInteraction(faqId, 'collapse');
        } else {
          content.classList.add('expanded');
          header.setAttribute('aria-expanded', 'true');
          if (icon instanceof HTMLElement) {
            icon.style.transform = 'rotate(180deg)';
          }
          trackFAQInteraction(faqId, 'expand');
        }
      }
    };

    console.log('FAQ Handler initialized successfully');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFAQs);
  } else {
    initializeFAQs();
  }

  // Also initialize for dynamic content (if using AJAX or SPA)
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      // Re-initialize in case content was loaded dynamically
      setTimeout(initializeFAQs, 100);
    });
  }

})(); 