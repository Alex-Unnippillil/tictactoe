(function () {
  'use strict';

  const TOOLTIP_ATTRIBUTE = 'data-tooltip';
  const ACTIVE_ATTRIBUTE = 'data-visible';
  const PLACEMENT_ATTRIBUTE = 'data-placement';

  function uniqueIdGenerator() {
    let counter = 0;
    return function nextId() {
      counter += 1;
      return `tooltip-${counter}`;
    };
  }

  const nextTooltipId = uniqueIdGenerator();

  function setupTooltip(trigger) {
    const tooltipText = trigger.getAttribute(TOOLTIP_ATTRIBUTE);
    if (!tooltipText) {
      return;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.id = trigger.getAttribute('aria-describedby') || nextTooltipId();
    tooltip.textContent = tooltipText;
    tooltip.hidden = true;
    tooltip.setAttribute(ACTIVE_ATTRIBUTE, 'false');
    tooltip.setAttribute(PLACEMENT_ATTRIBUTE, 'top');

    document.body.appendChild(tooltip);

    if (!trigger.hasAttribute('aria-describedby')) {
      trigger.setAttribute('aria-describedby', tooltip.id);
    }

    const showTooltip = () => {
      tooltip.hidden = false;
      tooltip.setAttribute(ACTIVE_ATTRIBUTE, 'true');
      positionTooltip(trigger, tooltip);
    };

    const hideTooltip = () => {
      tooltip.setAttribute(ACTIVE_ATTRIBUTE, 'false');
      window.setTimeout(() => {
        if (tooltip.getAttribute(ACTIVE_ATTRIBUTE) === 'false') {
          tooltip.hidden = true;
        }
      }, 150);
    };

    const handleMouseEnter = () => {
      showTooltip();
    };

    const handleMouseLeave = () => {
      hideTooltip();
    };

    const handleFocus = () => {
      showTooltip();
    };

    const handleBlur = () => {
      hideTooltip();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        hideTooltip();
      }
    };

    trigger.addEventListener('mouseenter', handleMouseEnter);
    trigger.addEventListener('mouseleave', handleMouseLeave);
    trigger.addEventListener('focus', handleFocus);
    trigger.addEventListener('blur', handleBlur);
    trigger.addEventListener('keydown', handleKeyDown);

    window.addEventListener('scroll', hideTooltip, { passive: true });
    window.addEventListener('resize', () => {
      if (tooltip.getAttribute(ACTIVE_ATTRIBUTE) === 'true') {
        positionTooltip(trigger, tooltip);
      }
    });
  }

  function positionTooltip(trigger, tooltip) {
    const triggerRect = trigger.getBoundingClientRect();
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';

    // Force layout to ensure measurements are up-to-date.
    const tooltipRect = tooltip.getBoundingClientRect();

    const preferredTop = triggerRect.top + window.scrollY - tooltipRect.height - 8;
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    let top;
    let placement;
    if (preferredTop >= 0 || spaceAbove > spaceBelow) {
      top = Math.max(window.scrollY + 4, preferredTop);
      placement = 'top';
    } else {
      top = triggerRect.bottom + window.scrollY + 8;
      placement = 'bottom';
    }

    let left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
    const minLeft = window.scrollX + 4;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - tooltipRect.width - 4;
    if (left < minLeft) {
      left = minLeft;
    } else if (left > maxLeft) {
      left = maxLeft;
    }

    tooltip.setAttribute(PLACEMENT_ATTRIBUTE, placement);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function initTooltips() {
    const triggers = document.querySelectorAll(`[${TOOLTIP_ATTRIBUTE}]`);
    triggers.forEach((trigger) => {
      setupTooltip(trigger);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
  } else {
    initTooltips();
  }
})();
