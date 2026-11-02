// ==UserScript==
// @name         Cart Price Changes for Amazon
// @namespace    https://github.com/Coursion-Studio/amazon-cart-price-changes
// @version      1.2.0
// @description  Your Amazon cart and saved-for-later price changes as cards or a table: old vs new, change, history, period filters.
// @author       Coursion Studio
// @license      MIT
// @homepageURL  https://github.com/Coursion-Studio/amazon-cart-price-changes
// @supportURL   https://github.com/Coursion-Studio/amazon-cart-price-changes/issues
// @icon         https://raw.githubusercontent.com/Coursion-Studio/amazon-cart-price-changes/main/icons/icon48.png
// @updateURL    https://raw.githubusercontent.com/Coursion-Studio/amazon-cart-price-changes/main/amazon-cart-price-changes.user.js
// @downloadURL  https://raw.githubusercontent.com/Coursion-Studio/amazon-cart-price-changes/main/amazon-cart-price-changes.user.js
// @match        *://*.amazon.com.tr/*
// @match        *://*.amazon.com/*
// @match        *://*.amazon.co.uk/*
// @match        *://*.amazon.de/*
// @match        *://*.amazon.fr/*
// @match        *://*.amazon.it/*
// @match        *://*.amazon.es/*
// @match        *://*.amazon.nl/*
// @match        *://*.amazon.se/*
// @match        *://*.amazon.pl/*
// @match        *://*.amazon.com.be/*
// @match        *://*.amazon.ca/*
// @match        *://*.amazon.com.mx/*
// @match        *://*.amazon.com.br/*
// @match        *://*.amazon.com.au/*
// @match        *://*.amazon.co.jp/*
// @match        *://*.amazon.in/*
// @match        *://*.amazon.sg/*
// @match        *://*.amazon.ae/*
// @match        *://*.amazon.sa/*
// @match        *://*.amazon.eg/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  var s = document.createElement('style');
  s.id = 'apc-style';
  s.textContent = "#apc-panel {\n  --apc-surface: #ffffff;\n  --apc-plane: #f9f9f7;\n  --apc-ink: #0b0b0b;\n  --apc-ink-2: #52514e;\n  --apc-muted: #898781;\n  --apc-grid: #e1e0d9;\n  --apc-axis: #c3c2b7;\n  --apc-border: rgba(11, 11, 11, 0.1);\n  --apc-up: #d03b3b;\n  --apc-down: #0ca30c;\n  --apc-down-text: #006300;\n  --apc-link: #007185;\n  --apc-accent: #2a78d6;\n  --apc-accent-soft: #e8f1fb;\n  --apc-accent-text: #1c5cab;\n  color-scheme: light;\n  display: block;\n  box-sizing: border-box;\n  margin: 0 0 14px;\n  padding: 14px 16px 10px;\n  background: var(--apc-surface);\n  border: 1px solid var(--apc-border);\n  border-radius: 10px;\n  box-shadow: 0 1px 2px rgba(11, 11, 11, 0.04);\n  color: var(--apc-ink);\n  font: 13px/1.4 \"Amazon Ember\", system-ui, -apple-system, \"Segoe UI\", sans-serif;\n  text-align: left;\n}\n#apc-panel *,\n#apc-panel *::before,\n#apc-panel *::after {\n  box-sizing: border-box;\n}\n#apc-panel button {\n  font: inherit;\n}\n\n#apc-panel .apc-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  flex-wrap: wrap;\n  margin-bottom: 12px;\n}\n#apc-panel .apc-title-wrap {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n}\n#apc-panel .apc-title {\n  font-size: 16px;\n  font-weight: 700;\n  letter-spacing: -0.01em;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  line-height: 22px;\n}\n#apc-panel .apc-badge {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--apc-ink-2);\n  background: var(--apc-plane);\n  border: 1px solid var(--apc-border);\n  border-radius: 999px;\n  padding: 0 8px;\n  line-height: 18px;\n}\n#apc-panel .apc-subtitle {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  color: var(--apc-ink-2);\n  margin-top: 1px;\n}\n#apc-panel .apc-newdot {\n  display: inline-block;\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--apc-accent);\n}\n#apc-panel .apc-controls {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n#apc-panel .apc-search {\n  appearance: none;\n  -webkit-appearance: none;\n  height: 28px;\n  min-width: 180px;\n  padding: 0 10px;\n  font: inherit;\n  font-size: 12px;\n  color: var(--apc-ink);\n  background: var(--apc-surface);\n  border: 1px solid rgba(11, 11, 11, 0.18);\n  border-radius: 6px;\n  margin: 0;\n  outline: none;\n}\n#apc-panel .apc-search:focus {\n  border-color: var(--apc-accent);\n  box-shadow: 0 0 0 3px rgba(42, 120, 214, 0.2);\n}\n#apc-panel .apc-search::placeholder {\n  color: var(--apc-muted);\n}\n#apc-panel .apc-seg {\n  display: inline-flex;\n  border: 1px solid rgba(11, 11, 11, 0.18);\n  border-radius: 6px;\n  overflow: hidden;\n  height: 28px;\n}\n#apc-panel .apc-segbtn {\n  appearance: none;\n  background: var(--apc-surface);\n  border: 0;\n  margin: 0;\n  padding: 0 11px;\n  font-size: 12px;\n  color: var(--apc-ink-2);\n  cursor: pointer;\n  line-height: 26px;\n  transition: background 0.12s;\n}\n#apc-panel .apc-segbtn + .apc-segbtn {\n  border-left: 1px solid rgba(11, 11, 11, 0.18);\n}\n#apc-panel .apc-segbtn:hover {\n  background: var(--apc-plane);\n}\n#apc-panel .apc-segbtn.active {\n  background: var(--apc-ink);\n  color: #fff;\n}\n\n#apc-panel .apc-chevron {\n  appearance: none;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: 0;\n  border-radius: 6px;\n  background: none;\n  color: var(--apc-muted);\n  font-size: 18px;\n  line-height: 24px;\n  cursor: pointer;\n  transition: transform 0.15s ease, background 0.12s, color 0.12s;\n}\n#apc-panel .apc-chevron:hover {\n  background: var(--apc-plane);\n  color: var(--apc-ink);\n}\n#apc-panel .apc-collapse {\n  transform: rotate(90deg);\n  margin-left: -6px;\n}\n#apc-panel.collapsed .apc-collapse {\n  transform: rotate(0deg);\n}\n#apc-panel.collapsed .apc-controls,\n#apc-panel.collapsed .apc-table,\n#apc-panel.collapsed .apc-foot {\n  display: none;\n}\n#apc-panel.collapsed .apc-kpis {\n  margin-bottom: 2px;\n}\n\n#apc-panel .apc-kpis {\n  display: grid;\n  grid-template-columns: 1.15fr 1fr 1fr 1.35fr 1.35fr;\n  gap: 8px;\n  margin: 0 0 10px;\n}\n#apc-panel .apc-stat,\n#apc-panel .apc-hl {\n  appearance: none;\n  display: flex;\n  min-width: 0;\n  margin: 0;\n  text-align: left;\n  font: inherit;\n  color: var(--apc-ink);\n  background: var(--apc-plane);\n  border: 1px solid rgba(11, 11, 11, 0.06);\n  border-radius: 10px;\n  padding: 9px 11px 8px;\n  cursor: pointer;\n  transition: border-color 0.12s, background 0.12s, box-shadow 0.12s;\n}\n#apc-panel .apc-stat {\n  flex-direction: column;\n  gap: 2px;\n}\n#apc-panel .apc-hl {\n  align-items: center;\n  gap: 10px;\n}\n#apc-panel .apc-hl.empty {\n  cursor: default;\n}\n#apc-panel .apc-stat:hover,\n#apc-panel .apc-hl:not(.empty):hover {\n  border-color: rgba(11, 11, 11, 0.2);\n  background: #fff;\n}\n#apc-panel .apc-stat.active {\n  background: #fff;\n  border-color: var(--apc-ink);\n  box-shadow: inset 0 0 0 1px var(--apc-ink);\n}\n#apc-panel .apc-stat:focus-visible,\n#apc-panel .apc-hl:focus-visible {\n  outline: 2px solid rgba(42, 120, 214, 0.5);\n  outline-offset: 1px;\n}\n#apc-panel .apc-stat-label {\n  font-size: 11px;\n  color: var(--apc-ink-2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#apc-panel .apc-stat-value {\n  font-size: 20px;\n  font-weight: 600;\n  line-height: 1.2;\n  color: var(--apc-ink);\n  white-space: nowrap;\n}\n#apc-panel .apc-stat.down .apc-stat-value,\n#apc-panel .apc-stat-value.down {\n  color: var(--apc-down-text);\n}\n#apc-panel .apc-stat.up .apc-stat-value,\n#apc-panel .apc-stat-value.up {\n  color: var(--apc-up);\n}\n#apc-panel .apc-stat-sub {\n  font-size: 12px;\n  color: var(--apc-ink-2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#apc-panel .apc-spread {\n  display: flex;\n  gap: 2px;\n  height: 6px;\n  margin-top: 6px;\n  border-radius: 3px;\n  overflow: hidden;\n}\n#apc-panel .apc-spread i {\n  display: block;\n  height: 100%;\n  border-radius: 3px;\n}\n#apc-panel .apc-spread .down {\n  background: var(--apc-down);\n}\n#apc-panel .apc-spread .up {\n  background: var(--apc-up);\n}\n#apc-panel .apc-hl-thumb {\n  flex: 0 0 auto;\n  width: 46px;\n  height: 46px;\n  object-fit: contain;\n  background: #fff;\n  border: 1px solid rgba(11, 11, 11, 0.08);\n  border-radius: 8px;\n}\n#apc-panel .apc-hl-body {\n  min-width: 0;\n  flex: 1 1 auto;\n}\n#apc-panel .apc-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  flex-wrap: wrap;\n  margin: 0 0 12px;\n}\n#apc-panel .apc-toolbar-left {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n#apc-panel .apc-toolbar-label,\n#apc-panel .apc-sort {\n  font-size: 12px;\n  color: var(--apc-ink-2);\n}\n#apc-panel .apc-sort {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n#apc-panel .apc-select {\n  appearance: auto;\n  height: 28px;\n  margin: 0;\n  padding: 0 6px;\n  font: inherit;\n  font-size: 12px;\n  color: var(--apc-ink);\n  background: var(--apc-surface);\n  border: 1px solid rgba(11, 11, 11, 0.18);\n  border-radius: 6px;\n}\n#apc-panel.collapsed .apc-toolbar {\n  display: none;\n}\n\n#apc-panel .apc-table {\n  width: 100%;\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: auto;\n}\n#apc-panel .apc-table th {\n  text-align: left;\n  padding: 4px 8px;\n  border-bottom: 1px solid var(--apc-grid);\n  white-space: nowrap;\n  vertical-align: middle;\n}\n#apc-panel .apc-th {\n  appearance: none;\n  background: none;\n  border: 0;\n  margin: 0;\n  padding: 2px 0;\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.02em;\n  text-transform: uppercase;\n  color: var(--apc-ink-2);\n  cursor: pointer;\n  border-radius: 4px;\n  transition: color 0.12s;\n}\n#apc-panel .apc-th:hover,\n#apc-panel .apc-th.active {\n  color: var(--apc-ink);\n}\n#apc-panel .apc-sortmark {\n  display: inline-block;\n  min-width: 10px;\n  margin-left: 3px;\n  color: var(--apc-accent-text);\n  font-size: 11px;\n}\n#apc-panel th.apc-num .apc-th {\n  text-align: right;\n}\n#apc-panel .apc-table td {\n  padding: 5px 8px;\n  border-bottom: 1px solid #f0efec;\n  vertical-align: middle;\n  font-size: 13px;\n  line-height: 20px;\n}\n#apc-panel .apc-table tbody tr:last-child td {\n  border-bottom: 0;\n}\n#apc-panel .apc-row {\n  cursor: pointer;\n}\n#apc-panel .apc-row td {\n  transition: background 0.12s;\n}\n#apc-panel .apc-row:hover td,\n#apc-panel .apc-row.expanded td {\n  background: var(--apc-plane);\n}\n#apc-panel .apc-row.expanded td {\n  border-bottom-color: transparent;\n}\n\n#apc-panel th.apc-thumb,\n#apc-panel td.apc-thumb {\n  width: 44px;\n  padding-right: 2px;\n}\n#apc-panel .apc-thumb-img {\n  display: block;\n  width: 34px;\n  height: 34px;\n  object-fit: contain;\n  background: #fff;\n  border: 1px solid rgba(11, 11, 11, 0.08);\n  border-radius: 6px;\n}\n#apc-panel .apc-thumb-empty {\n  background: #f4f4f1 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c3c2b7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='16' rx='2'/%3E%3Ccircle cx='9' cy='10' r='1.6'/%3E%3Cpath d='M21 16l-5-5-8 8'/%3E%3C/svg%3E\") center / 46% no-repeat;\n}\n#apc-panel th.apc-num,\n#apc-panel td.apc-num {\n  text-align: right;\n  white-space: nowrap;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel td.apc-name {\n  width: 100%;\n  max-width: 0;\n}\n#apc-panel .apc-name-wrap {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n}\n#apc-panel td.apc-name a {\n  flex: 0 1 auto;\n  min-width: 0;\n  color: var(--apc-ink);\n  text-decoration: none;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#apc-panel td.apc-name a:hover {\n  color: var(--apc-link);\n  text-decoration: underline;\n}\n#apc-panel .apc-chip {\n  flex: 0 0 auto;\n  display: inline-block;\n  padding: 0 6px;\n  font-size: 10px;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n  line-height: 16px;\n  border-radius: 999px;\n  background: #f0efec;\n  color: var(--apc-ink-2);\n  white-space: nowrap;\n}\n#apc-panel .apc-chip.new {\n  background: var(--apc-accent-soft);\n  color: var(--apc-accent-text);\n}\n#apc-panel .apc-chip.lowest {\n  background: #e6f4e6;\n  color: var(--apc-down-text);\n}\n#apc-panel td.apc-was {\n  color: var(--apc-muted);\n}\n#apc-panel td.apc-now {\n  font-weight: 600;\n}\n#apc-panel td.apc-delta {\n  font-weight: 600;\n}\n#apc-panel td.apc-delta.up {\n  color: var(--apc-up);\n}\n#apc-panel td.apc-delta.down {\n  color: var(--apc-down-text);\n}\n#apc-panel td.apc-delta.same {\n  color: var(--apc-muted);\n}\n#apc-panel .apc-arrow {\n  font-size: 9px;\n  vertical-align: 1px;\n}\n#apc-panel .apc-pct {\n  display: inline-block;\n  min-width: 56px;\n  margin-left: 8px;\n  font-weight: 400;\n  color: var(--apc-ink-2);\n}\n\n#apc-panel th.apc-bar,\n#apc-panel td.apc-bar {\n  width: 190px;\n  min-width: 190px;\n  padding-left: 12px;\n  padding-right: 12px;\n}\n#apc-panel .apc-axis {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: var(--apc-muted);\n  font-size: 9px;\n}\n#apc-panel .apc-track {\n  position: relative;\n  height: 12px;\n}\n#apc-panel .apc-track::before {\n  content: \"\";\n  position: absolute;\n  left: 50%;\n  top: 0;\n  bottom: 0;\n  width: 1px;\n  background: var(--apc-axis);\n}\n#apc-panel .apc-fill {\n  position: absolute;\n  top: 2px;\n  height: 8px;\n  min-width: 2px;\n  display: block;\n}\n#apc-panel .apc-fill.up {\n  left: calc(50% + 1px);\n  background: var(--apc-up);\n  border-radius: 0 4px 4px 0;\n  transform-origin: left center;\n}\n#apc-panel .apc-fill.down {\n  right: 50%;\n  background: var(--apc-down);\n  border-radius: 4px 0 0 4px;\n  transform-origin: right center;\n}\n@keyframes apc-grow {\n  from {\n    transform: scaleX(0);\n  }\n  to {\n    transform: scaleX(1);\n  }\n}\n#apc-panel .apc-table.animate .apc-fill {\n  animation: apc-grow 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both;\n}\n@media (prefers-reduced-motion: reduce) {\n  #apc-panel .apc-table.animate .apc-fill {\n    animation: none;\n  }\n  #apc-panel .apc-chevron {\n    transition: none;\n  }\n}\n#apc-panel th.apc-more,\n#apc-panel td.apc-more {\n  width: 32px;\n  padding-left: 0;\n  padding-right: 4px;\n  text-align: right;\n}\n#apc-panel .apc-row.expanded .apc-chevron {\n  transform: rotate(90deg);\n  color: var(--apc-ink);\n}\n#apc-panel .apc-empty td {\n  color: var(--apc-muted);\n  text-align: center;\n  padding: 14px;\n}\n\n#apc-panel .apc-details td {\n  background: var(--apc-plane);\n  padding: 4px 14px 14px 52px;\n  border-bottom: 1px solid var(--apc-grid);\n}\n#apc-panel .apc-detail {\n  display: flex;\n  align-items: flex-start;\n  gap: 16px;\n}\n#apc-panel .apc-detail-img {\n  flex: 0 0 auto;\n  width: 76px;\n  height: 76px;\n  object-fit: contain;\n  background: #fff;\n  border: 1px solid rgba(11, 11, 11, 0.08);\n  border-radius: 8px;\n}\n#apc-panel .apc-detail-main {\n  flex: 1 1 auto;\n  min-width: 0;\n}\n#apc-panel .apc-detail-title {\n  display: block;\n  margin: 2px 0 4px;\n  font-weight: 600;\n  color: var(--apc-ink);\n  text-decoration: none;\n  line-height: 1.35;\n}\n#apc-panel .apc-detail-title:hover {\n  color: var(--apc-link);\n  text-decoration: underline;\n}\n#apc-panel .apc-detail-meta {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  color: var(--apc-ink-2);\n  margin-bottom: 10px;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-detail-now {\n  color: var(--apc-ink);\n  font-weight: 600;\n}\n#apc-panel .apc-detail-delta {\n  font-weight: 600;\n}\n#apc-panel .apc-detail-delta.up {\n  color: var(--apc-up);\n}\n#apc-panel .apc-detail-delta.down {\n  color: var(--apc-down-text);\n}\n#apc-panel .apc-detail-label {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.02em;\n  text-transform: uppercase;\n  color: var(--apc-ink-2);\n  margin-bottom: 4px;\n}\n#apc-panel .apc-detail-count {\n  font-weight: 400;\n  text-transform: none;\n  letter-spacing: 0;\n  color: var(--apc-muted);\n}\n#apc-panel .apc-detail-history-row {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  flex-wrap: wrap;\n}\n#apc-panel .apc-spark {\n  flex: 0 0 auto;\n  display: block;\n  background: #fff;\n  border: 1px solid rgba(11, 11, 11, 0.08);\n  border-radius: 6px;\n}\n#apc-panel .apc-points {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 4px 8px;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-pt {\n  display: inline-flex;\n  flex-direction: column;\n  line-height: 1.2;\n}\n#apc-panel .apc-pt-t {\n  font-size: 10px;\n  color: var(--apc-muted);\n}\n#apc-panel .apc-pt-p {\n  color: var(--apc-ink-2);\n}\n#apc-panel .apc-pt.current .apc-pt-p {\n  color: var(--apc-ink);\n  font-weight: 600;\n}\n#apc-panel .apc-pt-arrow {\n  color: var(--apc-axis);\n}\n#apc-panel .apc-btn {\n  flex: 0 0 auto;\n  align-self: center;\n  padding: 6px 12px;\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--apc-ink);\n  background: #fff;\n  border: 1px solid rgba(11, 11, 11, 0.18);\n  border-radius: 999px;\n  text-decoration: none;\n  white-space: nowrap;\n  transition: background 0.12s, border-color 0.12s;\n}\n#apc-panel .apc-btn:hover {\n  background: var(--apc-plane);\n  border-color: rgba(11, 11, 11, 0.3);\n  text-decoration: none;\n}\n\n#apc-panel .apc-foot {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  margin-top: 8px;\n  padding-top: 8px;\n  border-top: 1px solid var(--apc-grid);\n  font-size: 12px;\n  color: var(--apc-ink-2);\n}\n#apc-panel .apc-legend {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n#apc-panel .apc-dot {\n  display: inline-block;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n}\n#apc-panel .apc-dot + * {\n  margin-right: 8px;\n}\n#apc-panel .apc-dot.up {\n  background: var(--apc-up);\n}\n#apc-panel .apc-dot.down {\n  background: var(--apc-down);\n}\n#apc-panel .apc-net {\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-net b {\n  font-weight: 600;\n  color: var(--apc-ink);\n}\n#apc-panel .apc-net b.up {\n  color: var(--apc-up);\n}\n#apc-panel .apc-net b.down {\n  color: var(--apc-down-text);\n}\n#apc-panel .apc-spacer {\n  flex: 1 1 auto;\n}\n#apc-panel .apc-sep {\n  color: var(--apc-muted);\n}\n#apc-panel .apc-linkbtn {\n  appearance: none;\n  background: none;\n  border: 0;\n  margin: 0;\n  padding: 0;\n  font-size: 12px;\n  color: var(--apc-link);\n  cursor: pointer;\n}\n#apc-panel .apc-linkbtn:hover {\n  text-decoration: underline;\n}\n\n@media (max-width: 1100px) {\n  #apc-panel .apc-kpis {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n}\n@media (max-width: 860px) {\n  #apc-panel .apc-kpis {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  #apc-panel th.apc-bar,\n  #apc-panel td.apc-bar,\n  #apc-panel th.apc-thumb,\n  #apc-panel td.apc-thumb {\n    display: none;\n  }\n  #apc-panel .apc-details td {\n    padding-left: 14px;\n  }\n}\n\n#apc-panel th.apc-when,\n#apc-panel td.apc-when {\n  width: 72px;\n  white-space: nowrap;\n  color: var(--apc-muted);\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-name-wrap .apc-newdot {\n  flex: 0 0 auto;\n  width: 6px;\n  height: 6px;\n}\n#apc-panel .apc-name-text {\n  flex: 0 1 auto;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#apc-panel .apc-detail-when {\n  color: var(--apc-muted);\n}\n#apc-panel .apc-detail-actions {\n  flex: 0 0 auto;\n  align-self: center;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 8px;\n}\n#apc-panel .apc-forget {\n  color: var(--apc-muted);\n}\n#apc-panel .apc-forget:hover {\n  color: var(--apc-up);\n}\n#apc-panel .apc-clear {\n  color: var(--apc-muted);\n}\n@media (max-width: 860px) {\n  #apc-panel th.apc-when,\n  #apc-panel td.apc-when {\n    display: none;\n  }\n}\n\n\n#apc-panel.view-cards .apc-table,\n#apc-panel.view-list .apc-grid {\n  display: none;\n}\n#apc-panel .apc-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(208px, 1fr));\n  gap: 10px;\n  margin-bottom: 2px;\n}\n#apc-panel .apc-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  background: var(--apc-surface);\n  border: 1px solid var(--apc-border);\n  border-top: 3px solid var(--apc-axis);\n  border-radius: 10px;\n  overflow: hidden;\n  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;\n}\n#apc-panel .apc-card.up {\n  border-top-color: var(--apc-up);\n}\n#apc-panel .apc-card.down {\n  border-top-color: var(--apc-down);\n}\n#apc-panel .apc-card:hover {\n  box-shadow: 0 4px 14px rgba(11, 11, 11, 0.1);\n  transform: translateY(-1px);\n}\n#apc-panel .apc-card-media {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 118px;\n  padding: 10px;\n  background: #fff;\n  border-bottom: 1px solid #f0efec;\n  text-decoration: none;\n}\n#apc-panel .apc-card-img {\n  display: block;\n  max-width: 100%;\n  max-height: 100%;\n  width: auto;\n  height: auto;\n  object-fit: contain;\n}\n#apc-panel .apc-card-media .apc-thumb-empty {\n  width: 72px;\n  height: 72px;\n  border-radius: 10px;\n}\n#apc-panel .apc-card-new {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  width: 8px;\n  height: 8px;\n  box-shadow: 0 0 0 2px #fff;\n}\n#apc-panel .apc-card-ribbon {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}\n#apc-panel .apc-card-body {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 10px 11px 10px;\n}\n#apc-panel .apc-card-title {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  min-height: 34px;\n  font-size: 12.5px;\n  line-height: 17px;\n  color: var(--apc-ink);\n  text-decoration: none;\n}\n#apc-panel a.apc-card-title:hover {\n  color: var(--apc-link);\n  text-decoration: underline;\n}\n#apc-panel .apc-card-prices {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  flex-wrap: wrap;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-card-now {\n  font-size: 18px;\n  font-weight: 700;\n  letter-spacing: -0.01em;\n  color: var(--apc-ink);\n  white-space: nowrap;\n}\n#apc-panel .apc-card-was {\n  font-size: 12px;\n  color: var(--apc-muted);\n  text-decoration: line-through;\n  white-space: nowrap;\n}\n#apc-panel .apc-pill {\n  align-self: flex-start;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 9px 2px 8px;\n  border-radius: 999px;\n  font-size: 12px;\n  font-weight: 600;\n  white-space: nowrap;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-pill.down {\n  background: #e6f4e6;\n  color: var(--apc-down-text);\n}\n#apc-panel .apc-pill.up {\n  background: #fbe9e9;\n  color: #b22c2c;\n}\n#apc-panel .apc-pill .apc-arrow {\n  font-size: 8px;\n}\n#apc-panel .apc-pill-pct {\n  font-weight: 500;\n  opacity: 0.85;\n  margin-left: 2px;\n}\n#apc-panel .apc-card-meta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 2px;\n  font-size: 11px;\n  color: var(--apc-muted);\n}\n#apc-panel .apc-card-meta .apc-spark {\n  width: 110px;\n  height: 26px;\n  flex: 0 0 auto;\n  border: 0;\n  background: transparent;\n}\n#apc-panel .apc-card-when {\n  flex: 1 1 auto;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#apc-panel .apc-card-more {\n  flex: 0 0 auto;\n  margin-right: -6px;\n}\n#apc-panel .apc-card.expanded .apc-card-more {\n  transform: rotate(90deg);\n  color: var(--apc-ink);\n}\n#apc-panel .apc-card-details {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 8px 11px 10px;\n  border-top: 1px solid #f0efec;\n  background: var(--apc-plane);\n}\n#apc-panel .apc-card-details .apc-points {\n  font-size: 11px;\n}\n#apc-panel .apc-card.flash,\n#apc-panel .apc-row.flash td {\n  box-shadow: 0 0 0 3px rgba(42, 120, 214, 0.4);\n}\n#apc-panel .apc-row.flash td:first-child {\n  border-radius: 6px 0 0 6px;\n}\n#apc-panel .apc-row.flash td:last-child {\n  border-radius: 0 6px 6px 0;\n}\n#apc-panel .apc-empty-state {\n  grid-column: 1 / -1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 26px 14px;\n  color: var(--apc-muted);\n  background: var(--apc-plane);\n  border: 1px dashed var(--apc-grid);\n  border-radius: 10px;\n}\n#apc-panel .apc-empty td {\n  padding: 8px 0;\n}\n#apc-panel .apc-diag {\n  color: var(--apc-muted);\n}\n@media (prefers-reduced-motion: reduce) {\n  #apc-panel .apc-card,\n  #apc-panel .apc-stat,\n  #apc-panel .apc-hl {\n    transition: none;\n  }\n}\n\n#apc-panel .apc-thumb-loading {\n  display: inline-block;\n  background: linear-gradient(90deg, #ecebe7 25%, #f8f7f4 50%, #ecebe7 75%);\n  background-size: 200% 100%;\n  animation: apc-shimmer 1.3s linear infinite;\n}\n#apc-panel .apc-card-media .apc-thumb-loading {\n  width: 98px;\n  height: 98px;\n  border-radius: 14px;\n}\n@keyframes apc-shimmer {\n  from {\n    background-position: 200% 0;\n  }\n  to {\n    background-position: -200% 0;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  #apc-panel .apc-thumb-loading {\n    animation: none;\n    background: #f0efec;\n  }\n}\n\n#apc-panel .apc-chip.target {\n  background: var(--apc-accent-soft);\n  color: var(--apc-accent-text);\n}\n#apc-panel .apc-stat-cart {\n  margin-top: 1px;\n}\n#apc-panel .apc-target {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-top: 10px;\n}\n#apc-panel .apc-target .apc-detail-label {\n  margin: 0;\n}\n#apc-panel .apc-target-input {\n  width: 110px;\n  height: 26px;\n  padding: 0 8px;\n  font: inherit;\n  font-size: 12px;\n  color: var(--apc-ink);\n  background: var(--apc-surface);\n  border: 1px solid rgba(11, 11, 11, 0.18);\n  border-radius: 6px;\n  font-variant-numeric: tabular-nums;\n}\n#apc-panel .apc-target-input:focus {\n  outline: none;\n  border-color: var(--apc-accent);\n  box-shadow: 0 0 0 3px rgba(42, 120, 214, 0.2);\n}\n#apc-panel .apc-btn-small {\n  padding: 3px 10px;\n  font-size: 12px;\n}\n#apc-panel .apc-card-details .apc-target {\n  margin-top: 4px;\n}\n";
  (document.head || document.documentElement).appendChild(s);
})();

(function (root) {
  'use strict';

  const CURRENCY = '(?:US\\$|R\\$|C\\$|A\\$|S\\$|NZ\\$|HK\\$|\\$|€|£|₺|¥|₹|zł|kr|TL|TRY|EUR|USD|GBP|AED|SAR|EGP|SEK|PLN|JPY|INR|MXN|BRL|CAD|AUD|SGD|CHF)';
  const NUMBER = '(?:\\d{1,3}(?:[.,\\u00a0\\u202f ]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)';
  const PRICE_RE = new RegExp(
    '(' + CURRENCY + ')[\\u00a0 ]?(' + NUMBER + ')(?!\\w)|(' + NUMBER + ')[\\u00a0 ]?(' + CURRENCY + ')(?![A-Za-z])',
    'g'
  );

  const UP_RE = /artt?ırıldı|yükseldi|yükseltildi|zamlandı|increas|went up|risen|rose|erhöht|gestiegen|augment|aument|verhoogd|gestegen|wzros|ökat|höjts|上が|値上/i;
  const DOWN_RE = /azaltıldı|düşürüldü|düştü|indirildi|decreas|went down|dropped|fell|lowered|reduc|gesunken|gesenkt|diminu|baiss|disminu|bajad|verlaagd|gedaald|spad|obniż|minskat|sänkts|下が|値下/i;
  const SAVED_RE = /kayıtlı|saved|later|gespeichert|enregistr|guardad|salvat|opgeslagen|zapisan|sparad/i;
  const CART_RE = /sepet|cart|basket|warenkorb|panier|carrito|carrello|winkelwagen|koszyk|kundvagn/i;

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  function parseAmount(text) {
    const s = String(text == null ? '' : text).replace(/[\s  ]/g, '');
    if (!s) return null;
    const m = s.match(/[.,](\d+)$/);
    let whole = s;
    let frac = '';
    if (m && m[1].length <= 2) {
      whole = s.slice(0, m.index);
      frac = m[1];
    }
    const n = Number(whole.replace(/[.,]/g, '') + (frac ? '.' + frac : ''));
    return Number.isFinite(n) ? n : null;
  }

  function findPrices(text) {
    const out = [];
    const s = String(text == null ? '' : text);
    PRICE_RE.lastIndex = 0;
    let m;
    while ((m = PRICE_RE.exec(s))) {
      const prefix = m[1] != null;
      const amount = parseAmount(prefix ? m[2] : m[3]);
      if (amount == null) continue;
      out.push({
        raw: m[0],
        amount,
        currency: prefix ? m[1] : m[4],
        placement: prefix ? 'prefix' : 'suffix',
        index: m.index,
      });
    }
    return out;
  }

  function detectDirection(text) {
    const s = String(text == null ? '' : text);
    if (UP_RE.test(s)) return 'up';
    if (DOWN_RE.test(s)) return 'down';
    return null;
  }

  function parseChange(text) {
    const prices = findPrices(text);
    if (prices.length < 2) return null;
    const keyword = detectDirection(text);
    let oldPrice = prices[0].amount;
    let newPrice = prices[1].amount;
    if (keyword === 'up' && oldPrice > newPrice) [oldPrice, newPrice] = [newPrice, oldPrice];
    if (keyword === 'down' && oldPrice < newPrice) [oldPrice, newPrice] = [newPrice, oldPrice];
    const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'same';
    return {
      oldPrice,
      newPrice,
      direction,
      keyword,
      currency: prices[0].currency,
      placement: prices[0].placement,
    };
  }

  function enrich(item) {
    const delta = round2(item.newPrice - item.oldPrice);
    const pct = item.oldPrice > 0 ? (delta / item.oldPrice) * 100 : null;
    return Object.assign({}, item, { delta, pct });
  }

  function summarize(items) {
    const ups = items.filter((i) => i.direction === 'up');
    const downs = items.filter((i) => i.direction === 'down');
    const sum = (arr) => round2(arr.reduce((acc, i) => acc + i.delta, 0));
    const biggest = (arr) => arr.slice().sort((a, b) => Math.abs(b.pct || 0) - Math.abs(a.pct || 0))[0] || null;
    return {
      total: items.length,
      upCount: ups.length,
      downCount: downs.length,
      upSum: sum(ups),
      downSum: sum(downs),
      net: sum(items),
      biggestUp: biggest(ups),
      biggestDown: biggest(downs),
      maxAbsPct: items.reduce((m, i) => Math.max(m, Math.abs(i.pct || 0)), 0),
    };
  }

  const SORTERS = {
    pct: (a, b) => (a.pct == null ? 0 : a.pct) - (b.pct == null ? 0 : b.pct),
    delta: (a, b) => a.delta - b.delta,
    newPrice: (a, b) => a.newPrice - b.newPrice,
    oldPrice: (a, b) => a.oldPrice - b.oldPrice,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  const DEFAULT_DIR = { pct: 'asc', delta: 'asc', newPrice: 'desc', oldPrice: 'desc', name: 'asc' };

  function defaultSortDir(key) {
    return DEFAULT_DIR[key] || 'asc';
  }

  function sortItems(items, key, dir) {
    const k = SORTERS[key] ? key : 'pct';
    const f = SORTERS[k];
    const d = dir || DEFAULT_DIR[k];
    return items.slice().sort(d === 'desc' ? (a, b) => f(b, a) : f);
  }

  function filterItems(items, filter) {
    if (filter === 'up' || filter === 'down') return items.filter((i) => i.direction === filter);
    return items.slice();
  }

  function groupKind(text) {
    const s = String(text == null ? '' : text);
    if (SAVED_RE.test(s)) return 'saved';
    if (CART_RE.test(s)) return 'cart';
    return '';
  }

  function formatNumber(value, locale, digits) {
    try {
      return new Intl.NumberFormat(locale || undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    } catch (e) {
      return value.toFixed(digits);
    }
  }

  function signOf(value, signed) {
    if (value < 0) return '−';
    if (value > 0 && signed) return '+';
    return '';
  }

  function formatMoney(amount, currency, placement, locale, signed) {
    const num = formatNumber(Math.abs(amount), locale, 2);
    const sign = signOf(amount, signed);
    return placement === 'prefix' ? sign + currency + num : sign + num + ' ' + currency;
  }

  function formatPct(pct, locale, signed) {
    if (pct == null || !Number.isFinite(pct)) return '—';
    return signOf(pct, signed) + formatNumber(Math.abs(pct), locale, 1) + '%';
  }

  function toCSV(items) {
    const esc = (v) => {
      const s = String(v == null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = [['Product', 'Old price', 'New price', 'Change', 'Change %', 'Currency', 'URL']];
    for (const i of items) {
      rows.push([i.name, i.oldPrice.toFixed(2), i.newPrice.toFixed(2), i.delta.toFixed(2), i.pct == null ? '' : i.pct.toFixed(2), i.currency, i.href || '']);
    }
    return rows.map((r) => r.map(esc).join(',')).join('\n');
  }

  const ASIN_RE = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|[?&]asin=)([A-Z0-9]{10})(?![A-Z0-9])/i;

  function asinFrom(href) {
    const m = ASIN_RE.exec(String(href == null ? '' : href));
    return m ? m[1].toUpperCase() : null;
  }

  function recordHistory(history, item, now, limit) {
    const key = item.key || item.asin || item.href;
    if (!key) return null;
    const entry = history[key] || { name: item.name, points: [] };
    entry.name = item.name;
    entry.seen = now;
    if (item.href) entry.href = item.href;
    if (item.image) entry.image = item.image;
    if (item.group) entry.group = item.group;
    if (item.currency) {
      entry.currency = item.currency;
      entry.placement = item.placement || 'suffix';
    }
    const pts = entry.points;
    const last = pts[pts.length - 1];
    const recorded = pts.some((pt, i) => i > 0 && pts[i - 1].p === item.oldPrice && pt.p === item.newPrice);
    if (!recorded) {
      if (last && last.p === item.newPrice) {
        pts.splice(pts.length - 1, 0, { t: null, p: item.oldPrice });
      } else {
        if (!last || last.p !== item.oldPrice) pts.push({ t: null, p: item.oldPrice });
        pts.push({ t: now, p: item.newPrice });
      }
    }
    capPoints(pts, limit);
    history[key] = entry;
    return entry;
  }

  function capPoints(pts, limit) {
    const max = limit || 100;
    if (pts.length > max) pts.splice(0, pts.length - max);
  }

  function recordObservation(history, obs, now, limit) {
    const key = obs.key || obs.asin;
    if (!key || !Number.isFinite(obs.price) || obs.price <= 0) return null;
    const entry = history[key] || { name: obs.name, points: [] };
    if (obs.name && (!entry.name || obs.name.length >= entry.name.length)) entry.name = obs.name;
    entry.seen = now;
    if (obs.href) entry.href = obs.href;
    if (obs.image) entry.image = obs.image;
    if (obs.group) entry.group = obs.group;
    if (obs.currency) {
      entry.currency = obs.currency;
      entry.placement = obs.placement || 'suffix';
    }
    const pts = entry.points;
    const last = pts[pts.length - 1];
    if (!last || last.p !== obs.price) pts.push({ t: now, p: obs.price });
    capPoints(pts, limit);
    history[key] = entry;
    return entry;
  }

  const DAY = 86400000;

  function windowStart(key, now) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const midnight = d.getTime();
    switch (key) {
      case 'today':
        return midnight;
      case '2d':
        return midnight - DAY;
      case '7d':
        return now - 7 * DAY;
      case '30d':
        return now - 30 * DAY;
      default:
        return -Infinity;
    }
  }

  function pruneHistory(history, now, maxAgeDays) {
    const maxAge = (maxAgeDays || 180) * 86400000;
    const out = {};
    for (const [key, entry] of Object.entries(history || {})) {
      if (!entry || !Array.isArray(entry.points)) continue;
      const seen = entry.seen == null ? now : entry.seen;
      if (now - seen > maxAge) continue;
      out[key] = entry;
    }
    return out;
  }

  function itemsFromHistory(history, now, start, fallbackMoney) {
    const out = [];
    const tOf = (pt) => (pt.t == null ? -Infinity : pt.t);
    for (const [key, entry] of Object.entries(history || {})) {
      const pts = entry && Array.isArray(entry.points) ? entry.points : [];
      if (pts.length < 2) continue;
      let first = pts.length;
      while (first > 0 && tOf(pts[first - 1]) >= start) first--;
      if (first === pts.length) continue;
      const before = first > 0 ? pts[first - 1] : null;
      const oldPt = before || pts[first];
      const last = pts[pts.length - 1];
      if (!before && pts.length - first < 2) continue;
      if (oldPt.p === last.p) continue;
      const changedAt = last.t == null ? entry.seen || 0 : last.t;
      out.push(
        enrich({
          key,
          name: entry.name || key,
          href: entry.href || '',
          image: entry.image || null,
          group: entry.group || '',
          oldPrice: oldPt.p,
          newPrice: last.p,
          changedAt,
          seen: entry.seen || changedAt,
          direction: last.p > oldPt.p ? 'up' : 'down',
          currency: entry.currency || (fallbackMoney && fallbackMoney.currency) || '',
          placement: entry.placement || (fallbackMoney && fallbackMoney.placement) || 'suffix',
          points: pts.length,
          steps: pts.length - first,
        })
      );
    }
    return out;
  }

  const HOST_CURRENCY = [
    ['.com.tr', 'TL', 'suffix'],
    ['.co.uk', '£', 'prefix'],
    ['.co.jp', '¥', 'prefix'],
    ['.com.au', '$', 'prefix'],
    ['.com.br', 'R$', 'prefix'],
    ['.com.mx', '$', 'prefix'],
    ['.com.be', '€', 'suffix'],
    ['.de', '€', 'suffix'],
    ['.fr', '€', 'suffix'],
    ['.it', '€', 'suffix'],
    ['.es', '€', 'suffix'],
    ['.nl', '€', 'suffix'],
    ['.se', 'kr', 'suffix'],
    ['.pl', 'zł', 'suffix'],
    ['.in', '₹', 'prefix'],
    ['.sg', 'S$', 'prefix'],
    ['.ae', 'AED', 'prefix'],
    ['.sa', 'SAR', 'prefix'],
    ['.eg', 'EGP', 'prefix'],
    ['.ca', '$', 'prefix'],
    ['.com', '$', 'prefix'],
  ];

  function currencyForHost(host) {
    const h = String(host || '').toLowerCase();
    for (const [suffix, currency, placement] of HOST_CURRENCY) if (h.endsWith(suffix)) return { currency, placement };
    return { currency: '', placement: 'suffix' };
  }

  function productImageFromHTML(html) {
    const s = String(html == null ? '' : html);
    const unescape = (u) => u.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const patterns = [
      /"hiRes"\s*:\s*"(https:[^"]+)"/,
      /"large"\s*:\s*"(https:[^"]+)"/,
      /id="landingImage"[^>]*?data-old-hires="([^"]+)"/,
      /data-old-hires="([^"]+)"[^>]*?id="landingImage"/,
      /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/,
      /id="landingImage"[^>]*?\ssrc="([^"]+)"/,
      /id="imgBlkFront"[^>]*?\ssrc="([^"]+)"/,
    ];
    for (const re of patterns) {
      const m = re.exec(s);
      if (m && m[1]) {
        const u = unescape(m[1]);
        if (/^https:\/\//.test(u)) return u;
      }
    }
    const dyn = /id="landingImage"[^>]*?data-a-dynamic-image="([^"]+)"/.exec(s) || /data-a-dynamic-image="([^"]+)"[^>]*?id="landingImage"/.exec(s);
    if (dyn) {
      try {
        const keys = Object.keys(JSON.parse(unescape(dyn[1])));
        if (keys.length && /^https:\/\//.test(keys[0])) return keys[0];
      } catch (e) {}
    }
    return null;
  }

  function signals(entry, now) {
    const out = [];
    const pts = entry && Array.isArray(entry.points) ? entry.points : [];
    if (pts.length < 2) return out;
    const last = pts[pts.length - 1];
    if (entry.target != null && last.p <= entry.target) out.push({ key: 'targetHit' });
    if (lowestSeen(entry, last.p)) out.push({ key: 'lowestSeen' });
    let streak = 0;
    for (let i = pts.length - 1; i > 0 && pts[i].p < pts[i - 1].p; i--) streak++;
    if (streak >= 3) out.push({ key: 'streak', n: streak });
    if (pts.length >= 3 && pts[pts.length - 2].p !== last.p && pts.slice(0, -2).some((pt) => pt.p === last.p)) out.push({ key: 'backToOld' });
    return out;
  }

  function cartTotals(history, keys, now, start) {
    const tOf = (pt) => (pt.t == null ? -Infinity : pt.t);
    let current = 0;
    let before = 0;
    let count = 0;
    let compared = 0;
    for (const key of keys || []) {
      const entry = history && history[key];
      const pts = entry && Array.isArray(entry.points) ? entry.points : [];
      if (!pts.length) continue;
      const last = pts[pts.length - 1];
      current += last.p;
      count++;
      let first = pts.length;
      while (first > 0 && tOf(pts[first - 1]) >= start) first--;
      const earlier = first > 0 ? pts[first - 1] : null;
      before += earlier ? earlier.p : last.p;
      if (earlier) compared++;
    }
    return { current: round2(current), before: round2(before), delta: round2(current - before), count, compared };
  }

  function lowestSeen(entry, price) {
    if (!entry || !Array.isArray(entry.points) || entry.points.length < 3) return false;
    return entry.points.every((pt) => price <= pt.p) && entry.points.some((pt) => pt.p > price);
  }

  function sparkline(values, width, height, pad) {
    const p = pad == null ? 3 : pad;
    if (!values || values.length < 2) return { d: '', points: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = (width - p * 2) / (values.length - 1);
    const points = values.map((v, i) => ({
      x: Number((p + i * stepX).toFixed(1)),
      y: Number((p + (1 - (v - min) / span) * (height - p * 2)).toFixed(1)),
    }));
    const d = points.map((pt, i) => (i ? 'L' : 'M') + pt.x + ' ' + pt.y).join(' ');
    return { d, points };
  }

  function newKeys(items, prevKeys) {
    if (!Array.isArray(prevKeys)) return [];
    const prev = new Set(prevKeys);
    return items.map((i) => i.key).filter((k) => k && !prev.has(k));
  }

  const api = {
    parseAmount,
    findPrices,
    detectDirection,
    parseChange,
    enrich,
    summarize,
    sortItems,
    defaultSortDir,
    filterItems,
    asinFrom,
    recordHistory,
    recordObservation,
    windowStart,
    pruneHistory,
    itemsFromHistory,
    currencyForHost,
    lowestSeen,
    signals,
    cartTotals,
    productImageFromHTML,
    sparkline,
    newKeys,
    groupKind,
    formatMoney,
    formatPct,
    toCSV,
  };

  root.AmazonPriceChanges = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function () {
  'use strict';

  const APC = window.AmazonPriceChanges;
  if (!APC || window.__amazonPriceChangesInstalled) return;
  window.__amazonPriceChangesInstalled = true;

  const PANEL_ID = 'apc-panel';
  const PREFS_KEY = 'apc:prefs';
  const SEEN_KEY = 'apc:seen';
  const HISTORY_KEY = 'apc:history';
  const ALERTISH = '.a-alert, .a-alert-inline, [class*="alert" i]';
  const SORT_KEYS = ['name', 'oldPrice', 'newPrice', 'delta', 'pct', 'changedAt'];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CART_RE = /(^|\/)(cart|gp\/cart|gp\/aw\/c)(\/|$)/;
  const WINDOWS = ['today', '2d', '7d', '30d', 'all'];
  const LIST_SCOPE = '#sc-active-cart, #sc-saved-cart, #activeCartViewForm, #sc-saved-cart-items, [data-name="Active Items"], [data-name="Saved Items"], .sc-list-body';

  const lang = (document.documentElement.getAttribute('lang') || navigator.language || 'en').toLowerCase();
  const locale = /^[a-z]{2}(-[a-z0-9]+)?$/.test(lang) ? lang : 'en';
  const pageMoney = APC.currencyForHost(location.hostname);

  const STRINGS = {
    en: {
      title: 'Price changes',
      all: 'All',
      drops: 'Drops',
      increases: 'Increases',
      search: 'Filter products',
      product: 'Product',
      was: 'Was',
      now: 'Now',
      change: 'Change',
      when: 'When',
      dropped: 'Dropped',
      increased: 'Increased',
      combined: 'combined',
      biggestDrop: 'Biggest drop',
      biggestIncrease: 'Biggest increase',
      items: (n) => (n === 1 ? '1 item' : n + ' items'),
      newSince: (n, d) => (n === 1 ? '1 new' : n + ' new') + ' since ' + d,
      remembered: 'Remembered from earlier visits',
      tracking: (n) => (n === 1 ? '1 item tracked' : n + ' items tracked'),
      noChanges: 'No price changes in this period',
      winToday: 'Today',
      win2d: '2 days',
      win7d: '7 days',
      win30d: '30 days',
      winAll: 'All time',
      cards: 'Cards',
      list: 'List',
      period: 'Period',
      sort: 'Sort',
      sortDropFirst: 'Biggest drop first',
      sortRiseFirst: 'Biggest rise first',
      sortNewest: 'Newest first',
      sortSaving: 'Biggest saving',
      sortPriceHigh: 'Price: high to low',
      sortPriceLow: 'Price: low to high',
      sortName: 'Name A–Z',
      none: '—',
      showAll: 'Show all time',
      diag: 'Copy diagnostics',
      diagDone: 'Diagnostics copied',
      isNew: 'New',
      lowest: 'Lowest seen',
      target: 'Target price',
      targetAt: (p) => 'Target ' + p,
      targetHit: 'Target reached',
      streak: (n) => n + ' drops in a row',
      backToOld: 'Back to an earlier price',
      cartTotal: 'Cart total',
      save: 'Save',
      clearTarget: 'Remove target',
      today: 'today',
      empty: 'Nothing matches',
      net: 'Net',
      history: 'Price history',
      seen: (n) => n + ' prices seen',
      earlier: 'earlier',
      open: 'Open product',
      forget: 'Forget this item',
      details: 'Details',
      collapse: 'Collapse',
      expand: 'Expand',
      copy: 'Copy CSV',
      copied: 'Copied',
      clear: 'Clear history',
      clearConfirm: 'Click again to clear',
      showOriginal: "Show Amazon's list",
      hideOriginal: "Hide Amazon's list",
      saved: 'Saved',
      cart: 'Cart',
    },
    tr: {
      title: 'Fiyat değişiklikleri',
      all: 'Tümü',
      drops: 'Düşenler',
      increases: 'Artanlar',
      search: 'Ürün ara',
      product: 'Ürün',
      was: 'Eski',
      now: 'Yeni',
      change: 'Değişim',
      when: 'Tarih',
      dropped: 'Düşen',
      increased: 'Artan',
      combined: 'toplam',
      biggestDrop: 'En büyük düşüş',
      biggestIncrease: 'En büyük artış',
      items: (n) => n + ' ürün',
      newSince: (n, d) => d + "'den beri " + n + ' yeni',
      remembered: 'Önceki ziyaretlerden hatırlanıyor',
      tracking: (n) => n + ' ürün izleniyor',
      noChanges: 'Bu dönemde fiyat değişikliği yok',
      winToday: 'Bugün',
      win2d: '2 gün',
      win7d: '7 gün',
      win30d: '30 gün',
      winAll: 'Tüm zamanlar',
      cards: 'Kartlar',
      list: 'Liste',
      period: 'Dönem',
      sort: 'Sırala',
      sortDropFirst: 'En çok düşen önce',
      sortRiseFirst: 'En çok artan önce',
      sortNewest: 'En yeni önce',
      sortSaving: 'En çok tasarruf',
      sortPriceHigh: 'Fiyat: yüksekten düşüğe',
      sortPriceLow: 'Fiyat: düşükten yükseğe',
      sortName: 'Ad A–Z',
      none: '—',
      showAll: 'Tüm zamanları göster',
      diag: 'Teşhis kopyala',
      diagDone: 'Teşhis kopyalandı',
      isNew: 'Yeni',
      lowest: 'En düşük',
      target: 'Hedef fiyat',
      targetAt: (p) => 'Hedef ' + p,
      targetHit: 'Hedefe ulaştı',
      streak: (n) => 'Üst üste ' + n + ' düşüş',
      backToOld: 'Eski fiyata döndü',
      cartTotal: 'Sepet toplamı',
      save: 'Kaydet',
      clearTarget: 'Hedefi kaldır',
      today: 'bugün',
      empty: 'Eşleşen ürün yok',
      net: 'Net',
      history: 'Fiyat geçmişi',
      seen: (n) => n + ' fiyat görüldü',
      earlier: 'önce',
      open: 'Ürüne git',
      forget: 'Bu ürünü unut',
      details: 'Ayrıntılar',
      collapse: 'Daralt',
      expand: 'Genişlet',
      copy: 'CSV kopyala',
      copied: 'Kopyalandı',
      clear: 'Geçmişi temizle',
      clearConfirm: 'Temizlemek için tekrar tıkla',
      showOriginal: 'Amazon listesini göster',
      hideOriginal: 'Amazon listesini gizle',
      saved: 'Kayıtlı',
      cart: 'Sepet',
    },
  };
  const T = STRINGS[lang.slice(0, 2)] || STRINGS.en;

  const ext =
    typeof browser !== 'undefined' && browser.storage && browser.storage.local
      ? browser
      : typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
        ? chrome
        : null;
  const HOST = location.hostname;
  const STORAGE_KEYS = { [PREFS_KEY]: 'prefs', [SEEN_KEY]: 'seen:' + HOST, [HISTORY_KEY]: 'history:' + HOST };

  const local = {
    get(key, fallback) {
      try {
        const v = JSON.parse(localStorage.getItem(key));
        return v == null ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
  };

  const pendingWrites = new Map();
  let writeTimer = null;
  function flushWrites() {
    writeTimer = null;
    if (!pendingWrites.size) return;
    const batch = {};
    for (const [k, v] of pendingWrites) batch[k] = v;
    pendingWrites.clear();
    try {
      const r = ext.storage.local.set(batch);
      if (r && r.catch) r.catch(() => {});
    } catch (e) {}
  }

  const store = {
    set(key, value) {
      if (!ext) return local.set(key, value);
      pendingWrites.set(STORAGE_KEYS[key], value);
      clearTimeout(writeTimer);
      writeTimer = setTimeout(flushWrites, 150);
    },
    remove(key) {
      if (!ext) return local.remove(key);
      pendingWrites.delete(STORAGE_KEYS[key]);
      try {
        const r = ext.storage.local.remove(STORAGE_KEYS[key]);
        if (r && r.catch) r.catch(() => {});
      } catch (e) {}
    },
  };

  async function loadState() {
    if (!ext) return { prefs: local.get(PREFS_KEY, {}), seen: local.get(SEEN_KEY, null), history: local.get(HISTORY_KEY, {}) };
    let got = {};
    try {
      got = (await ext.storage.local.get(Object.values(STORAGE_KEYS))) || {};
    } catch (e) {
      got = {};
    }
    const out = { prefs: got.prefs || local.get(PREFS_KEY, {}), seen: got[STORAGE_KEYS[SEEN_KEY]] || local.get(SEEN_KEY, null), history: got[STORAGE_KEYS[HISTORY_KEY]] };
    if (!out.history) {
      out.history = local.get(HISTORY_KEY, {});
      if (Object.keys(out.history).length) store.set(HISTORY_KEY, out.history);
    }
    return out;
  }

  function notifyWorker(message) {
    if (!ext || !ext.runtime || !ext.runtime.sendMessage) return;
    try {
      const r = ext.runtime.sendMessage(message);
      if (r && r.catch) r.catch(() => {});
    } catch (e) {}
  }

  let prefs = { sort: 'pct', dir: 'asc', filter: 'all', window: 'all', view: 'cards', showOriginal: false, collapsed: false };
  const savePrefs = () => store.set(PREFS_KEY, prefs);
  let prevSeen = null;
  let history = {};

  function adoptState(loaded) {
    prefs = Object.assign(prefs, loaded.prefs || {});
    if (prefs.view !== 'cards' && prefs.view !== 'list') prefs.view = 'cards';
    if (!SORT_KEYS.includes(prefs.sort)) prefs.sort = 'pct';
    if (!WINDOWS.includes(prefs.window)) prefs.window = 'all';
    if (prefs.dir !== 'asc' && prefs.dir !== 'desc') prefs.dir = APC.defaultSortDir(prefs.sort);
    prevSeen = loaded.seen;
    history = APC.pruneHistory(loaded.history || {}, Date.now(), 365);
  }

  const state = {
    items: [],
    live: [],
    summary: null,
    signature: '',
    anchor: { node: null, whole: false, after: false },
    hidden: [],
    expanded: new Set(),
    imageFetches: new Set(),
    imagePending: new Set(),
    query: '',
    showTags: false,
    tracked: 0,
    cartKeys: [],
    windowStart: -Infinity,
    ui: {},
  };

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  function svg(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) node.setAttribute(k, v);
    return node;
  }

  function squash(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function lineText(li) {
    const clone = li.cloneNode(true);
    clone.querySelectorAll('a').forEach((a) => a.replaceWith(' '));
    return squash(clone.textContent);
  }

  function isToday(t) {
    return t != null && new Date(t).toDateString() === new Date().toDateString();
  }

  function formatDate(t) {
    if (t == null) return T.earlier;
    if (isToday(t)) return T.today;
    const d = new Date(t);
    const opts = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    try {
      return new Intl.DateTimeFormat(locale, opts).format(d);
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function money(amount, item, signed) {
    return APC.formatMoney(amount, item.currency, item.placement, locale, signed);
  }

  function productHref(item) {
    if (item.href) return item.href;
    if (/^[A-Z0-9]{10}$/.test(item.key)) return location.origin + '/dp/' + item.key;
    return null;
  }

  function groupHeading(ul) {
    let node = ul;
    for (let depth = 0; depth < 6 && node; depth++) {
      let sib = node.previousElementSibling;
      while (sib) {
        const bold = sib.matches('.a-text-bold, b, strong, h1, h2, h3, h4, h5')
          ? sib
          : sib.querySelector('.a-text-bold, b, strong, h4, h5');
        if (bold && squash(bold.textContent)) return squash(bold.textContent);
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
      if (!node || node === document.body || node.matches(ALERTISH)) break;
    }
    return '';
  }

  const BAD_IMAGE_RE = /loading|spinner|transparent|pixel\.gif|placeholder|grey-pixel|\/images\/G\/|\/x-locale\//i;

  function isGoodImageURL(url) {
    if (!url || typeof url !== 'string') return false;
    if (!/^(https?:|data:image\/(png|jpe?g|webp|svg))/i.test(url)) return false;
    return !BAD_IMAGE_RE.test(url);
  }

  function imageSource(img) {
    if (!img || img.closest('#' + PANEL_ID)) return null;
    const candidates = [];
    const dynamic = img.getAttribute('data-a-dynamic-image');
    if (dynamic) {
      try {
        candidates.push(...Object.keys(JSON.parse(dynamic)));
      } catch (e) {}
    }
    for (const attr of ['data-old-hires', 'data-src', 'data-lazy-src', 'data-a-hires', 'data-original']) {
      const v = img.getAttribute(attr);
      if (v) candidates.push(v);
    }
    const srcset = img.getAttribute('srcset');
    if (srcset) candidates.push(srcset.split(',')[0].trim().split(/\s+/)[0]);
    candidates.push(img.currentSrc, img.src);
    for (const c of candidates) {
      if (!isGoodImageURL(c)) continue;
      const isLive = c === img.currentSrc || c === img.src;
      if (isLive && img.complete && img.naturalWidth > 0 && img.naturalWidth < 40) continue;
      return c;
    }
    return null;
  }

  const IMAGE_LOCALES = ['01', '03', '02', '08', '09'];

  function asinImageURL(asin, code) {
    return 'https://images-na.ssl-images-amazon.com/images/P/' + asin + '.' + (code || '01') + '._SL320_.jpg';
  }

  function rememberImage(key, url) {
    const entry = history[key];
    if (!entry || entry.image === url) return;
    entry.image = url;
    store.set(HISTORY_KEY, history);
  }

  function fetchMissingImages(items, now) {
    if (location.protocol === 'file:' || typeof fetch !== 'function') return;
    const todo = items
      .filter((i) => !i.image && /^[A-Z0-9]{10}$/.test(i.key) && i.hist && !(i.hist.imageTriedAt && now - i.hist.imageTriedAt < 86400000) && !state.imageFetches.has(i.key))
      .slice(0, 4);
    if (!todo.length) return;
    for (const item of todo) {
      item.hist.imageTriedAt = now;
      state.imageFetches.add(item.key);
      state.imagePending.add(item.key);
    }
    store.set(HISTORY_KEY, history);
    (async () => {
      for (const item of todo) {
        try {
          const res = await fetch(location.origin + '/dp/' + item.key, { credentials: 'same-origin', headers: { Accept: 'text/html' } });
          if (res.ok) {
            const url = APC.productImageFromHTML(await res.text());
            if (isGoodImageURL(url)) rememberImage(item.key, url);
          }
        } catch (e) {}
        state.imagePending.delete(item.key);
        schedule();
      }
    })();
  }

  function findImage(asin) {
    if (!asin) return null;
    const selectors = [
      '[data-asin="' + asin + '"] img',
      'img[data-asin="' + asin + '"]',
      '[data-itemid="' + asin + '"] img',
      'a[href*="/' + asin + '"] img',
      'a[href*="/' + asin.toLowerCase() + '"] img',
    ];
    for (const sel of selectors) {
      for (const img of document.querySelectorAll(sel)) {
        const src = imageSource(img);
        if (src) return src;
      }
    }
    return null;
  }

  function collect() {
    const byKey = new Map();
    const items = [];
    for (const li of document.querySelectorAll('li')) {
      if (li.closest('#' + PANEL_ID)) continue;
      const link = li.querySelector('a[href]');
      if (!link) continue;
      if (APC.findPrices(li.textContent).length < 2) continue;
      const change = APC.parseChange(lineText(li));
      if (!change) continue;
      if (!change.keyword && !li.closest(ALERTISH)) continue;
      const name = squash(link.textContent);
      if (!name) continue;
      const asin = APC.asinFrom(link.href);
      const key = asin || link.href;
      const dedupe = key + '|' + change.oldPrice + '|' + change.newPrice;
      const existing = byKey.get(dedupe);
      if (existing) {
        existing.nodes.push(li);
        continue;
      }
      const ul = li.closest('ul, ol') || li.parentElement;
      const item = APC.enrich(
        Object.assign(
          { name, href: link.href, asin, key, li, ul, nodes: [li], group: APC.groupKind(groupHeading(ul)), image: findImage(asin) },
          change
        )
      );
      byKey.set(dedupe, item);
      items.push(item);
    }
    return items;
  }

  function scanListItems() {
    const out = [];
    const seen = new Set();
    for (const node of document.querySelectorAll('[data-asin]')) {
      if (node.closest('#' + PANEL_ID)) continue;
      if (!node.matches('.sc-list-item') && !node.closest(LIST_SCOPE)) continue;
      const asin = (node.getAttribute('data-asin') || '').toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(asin) || seen.has(asin)) continue;
      if (node.querySelector('[data-asin]')) continue;
      let price = APC.parseAmount(node.getAttribute('data-price') || '');
      let currency = pageMoney.currency;
      let placement = pageMoney.placement;
      if (!Number.isFinite(price) || price <= 0) {
        const priceNode = node.querySelector('.sc-product-price, .sc-price, .a-price .a-offscreen, .a-color-price');
        const found = priceNode ? APC.findPrices(priceNode.textContent) : [];
        if (!found.length) continue;
        price = found[0].amount;
        currency = found[0].currency;
        placement = found[0].placement;
      }
      const link = node.querySelector('a.sc-product-link, a.sc-product-title, a[href*="/dp/"], a[href*="/gp/product/"]');
      const titleNode = node.querySelector('.sc-product-title, .a-truncate-full, .sc-product-title-link, .sc-item-content-group .a-text-bold, [data-asin] h2, h2 a, h3 a');
      const img = node.querySelector('img');
      const known = history[asin];
      const name =
        squash(titleNode ? titleNode.textContent : '') ||
        squash(link ? link.textContent : '') ||
        squash(img ? img.getAttribute('alt') : '') ||
        (known && known.name) ||
        '';
      if (!name) continue;
      const saved = /saved/i.test(node.getAttribute('data-itemtype') || '') || node.closest('#sc-saved-cart, #sc-saved-cart-items, [data-name="Saved Items"]');
      out.push({
        key: asin,
        asin,
        name,
        href: link ? link.href : location.origin + '/dp/' + asin,
        image: imageSource(img),
        price,
        currency,
        placement,
        group: saved ? 'saved' : 'cart',
      });
      seen.add(asin);
    }
    if (!out.length) {
      for (const a of document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
        if (a.closest('#' + PANEL_ID) || !a.closest(LIST_SCOPE)) continue;
        const asin = APC.asinFrom(a.href);
        if (!asin || seen.has(asin)) continue;
        const box = a.closest('.sc-list-item, [class*="list-item"], [class*="item-container"], li') || a.parentElement;
        if (!box || box.textContent.length > 2500) continue;
        const priceNode = box.querySelector('.sc-product-price, .sc-price, .a-price .a-offscreen, .a-color-price');
        const found = APC.findPrices(priceNode ? priceNode.textContent : box.textContent);
        if (!found.length) continue;
        const img = box.querySelector('img');
        const titleNode = box.querySelector('.sc-product-title, .a-truncate-full, .sc-product-title-link');
        const known = history[asin];
        const name = squash(titleNode ? titleNode.textContent : '') || squash(a.textContent) || squash(img ? img.getAttribute('alt') : '') || (known && known.name) || '';
        if (!name) continue;
        out.push({
          key: asin,
          asin,
          name,
          href: a.href,
          image: imageSource(img),
          price: found[0].amount,
          currency: found[0].currency,
          placement: found[0].placement,
          group: box.closest('#sc-saved-cart, #sc-saved-cart-items, [data-name="Saved Items"]') ? 'saved' : 'cart',
        });
        seen.add(asin);
      }
    }
    return out;
  }

  function anchorFor(live) {
    const parsed = new Set(live.flatMap((i) => i.nodes));
    const ownText = live.reduce((n, i) => n + i.nodes.reduce((m, li) => m + li.textContent.length, 0), 0);
    let node = live[0].li.parentElement;
    let best = null;
    let whole = false;
    while (node && node !== document.body) {
      if (node.matches(ALERTISH)) {
        const lis = Array.from(node.querySelectorAll('li'));
        const clean = lis.length > 0 && lis.every((li) => parsed.has(li)) && node.textContent.length <= ownText * 2 + 600;
        if (clean) {
          best = node;
          whole = true;
        } else {
          if (!best) best = node;
          break;
        }
      }
      node = node.parentElement;
    }
    return { node: best || live[0].ul, whole, after: false };
  }

  function fallbackAnchor() {
    const before = ['#sc-active-cart', '#activeCartViewForm', '#sc-cart-above-actions', '.sc-list-body', 'div[data-name="Active Items"]', '#sc-saved-cart'];
    for (const sel of before) {
      const node = document.querySelector(sel);
      if (node) return { node, whole: false, after: false };
    }
    const h1 = document.querySelector('#a-page h1, main h1, h1');
    if (h1) return { node: h1, whole: false, after: true };
    const main = document.querySelector('#a-page, main') || document.body;
    return { node: main.firstElementChild || main, whole: false, after: false };
  }

  function hideOriginals(live, anchor) {
    const parsed = new Set(live.flatMap((i) => i.nodes));
    const targets = [];
    if (anchor.node && anchor.whole) {
      targets.push(anchor.node);
    } else {
      for (const ul of new Set(live.map((i) => i.ul))) {
        const own = Array.from(ul.querySelectorAll(':scope > li'));
        if (own.length && own.every((li) => parsed.has(li))) targets.push(ul);
        else own.filter((li) => parsed.has(li)).forEach((li) => targets.push(li));
      }
    }
    for (const node of targets) state.hidden.push({ node, display: node.style.display });
    setOriginalVisible(prefs.showOriginal);
  }

  function setOriginalVisible(show) {
    for (const h of state.hidden) h.node.style.display = show ? h.display : 'none';
    if (state.ui.toggleBtn) state.ui.toggleBtn.textContent = show ? T.hideOriginal : T.showOriginal;
  }

  function restoreOriginals() {
    for (const h of state.hidden) h.node.style.display = h.display;
    state.hidden = [];
  }

  function thumb(item, cls) {
    const empty = () => el('span', { class: cls + ' apc-thumb-empty', 'aria-hidden': 'true' });
    if (item.image) return el('img', { class: cls, src: item.image, alt: '', loading: 'lazy', decoding: 'async' });
    const asin = /^[A-Z0-9]{10}$/.test(item.key) ? item.key : null;
    if (!asin || location.protocol === 'file:') return empty();
    const box = el('span', { class: cls + ' apc-thumb-loading', 'aria-hidden': 'true' });
    let idx = 0;
    const probe = new Image();
    probe.decoding = 'async';
    const settle = () => {
      if (box.isConnected && !state.imagePending.has(asin)) box.replaceWith(empty());
    };
    const next = () => {
      idx++;
      if (idx < IMAGE_LOCALES.length) probe.src = asinImageURL(asin, IMAGE_LOCALES[idx]);
      else settle();
    };
    probe.addEventListener('error', next);
    probe.addEventListener('load', () => {
      if (probe.naturalWidth <= 1) {
        next();
        return;
      }
      rememberImage(asin, probe.src);
      if (box.isConnected) box.replaceWith(el('img', { class: cls, src: probe.src, alt: '', decoding: 'async' }));
    });
    probe.src = asinImageURL(asin, IMAGE_LOCALES[0]);
    return box;
  }

  function chip(text, cls, title) {
    return el('span', { class: 'apc-chip ' + (cls || ''), title: title || null }, text);
  }

  function statTile(key, label, value, sub, extra) {
    const active = prefs.filter === key;
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-stat ' + key + (active ? ' active' : ''),
        'data-filter': key,
        'aria-pressed': active ? 'true' : 'false',
        onclick: () => {
          prefs.filter = key;
          savePrefs();
          refreshRows();
        },
      },
      el('div', { class: 'apc-stat-label' }, label),
      el('div', { class: 'apc-stat-value' }, value),
      sub ? el('div', { class: 'apc-stat-sub' }, sub) : null,
      extra || null
    );
  }

  function spreadBar(s) {
    const total = s.downCount + s.upCount;
    if (!total) return null;
    const down = (s.downCount / total) * 100;
    return el(
      'div',
      { class: 'apc-spread', title: T.drops + ' ' + s.downCount + ' · ' + T.increases + ' ' + s.upCount, 'aria-hidden': 'true' },
      s.downCount ? el('i', { class: 'down', style: 'width:' + down.toFixed(1) + '%' }) : null,
      s.upCount ? el('i', { class: 'up', style: 'width:' + (100 - down).toFixed(1) + '%' }) : null
    );
  }

  function highlight(label, item, cls) {
    if (!item) {
      return el('div', { class: 'apc-hl empty' }, el('div', { class: 'apc-hl-body' }, el('div', { class: 'apc-stat-label' }, label), el('div', { class: 'apc-stat-value' }, T.none)));
    }
    return el(
      'button',
      { type: 'button', class: 'apc-hl ' + cls, title: item.name, onclick: () => jumpTo(item.key) },
      thumb(item, 'apc-hl-thumb'),
      el(
        'div',
        { class: 'apc-hl-body' },
        el('div', { class: 'apc-stat-label' }, label),
        el('div', { class: 'apc-stat-value ' + cls }, APC.formatPct(item.pct, locale, true)),
        el('div', { class: 'apc-stat-sub' }, item.name)
      )
    );
  }

  function periodLabel() {
    return T['win' + prefs.window.charAt(0).toUpperCase() + prefs.window.slice(1)] || prefs.window;
  }

  function cartLine(ref) {
    if (!state.cartKeys.length) return null;
    const ct = APC.cartTotals(history, state.cartKeys, Date.now(), state.windowStart);
    if (!ct.count) return null;
    const delta = ct.compared && ct.delta !== 0 ? ' · ' + money(ct.delta, ref, true) : '';
    return el('div', { class: 'apc-stat-sub apc-stat-cart', title: T.items(ct.count) }, T.cartTotal + ' ' + money(ct.current, ref) + delta);
  }

  function tiles(s, ref) {
    return el(
      'div',
      { class: 'apc-kpis' },
      statTile('all', periodLabel(), T.items(s.total), T.net + ' ' + money(s.net, ref, true), [cartLine(ref), spreadBar(s)]),
      statTile('down', T.dropped, T.items(s.downCount), s.downCount ? money(s.downSum, ref, true) + ' ' + T.combined : T.none),
      statTile('up', T.increased, T.items(s.upCount), s.upCount ? money(s.upSum, ref, true) + ' ' + T.combined : T.none),
      highlight(T.biggestDrop, s.biggestDown, 'down'),
      highlight(T.biggestIncrease, s.biggestUp, 'up')
    );
  }

  const SORT_OPTIONS = [
    ['pct:asc', 'sortDropFirst'],
    ['pct:desc', 'sortRiseFirst'],
    ['changedAt:desc', 'sortNewest'],
    ['delta:asc', 'sortSaving'],
    ['newPrice:desc', 'sortPriceHigh'],
    ['newPrice:asc', 'sortPriceLow'],
    ['name:asc', 'sortName'],
  ];

  function sortSelect() {
    return el(
      'select',
      {
        class: 'apc-select',
        'aria-label': T.sort,
        onchange: (e) => {
          const [key, dir] = e.target.value.split(':');
          prefs.sort = key;
          prefs.dir = dir;
          savePrefs();
          refreshRows();
        },
      },
      SORT_OPTIONS.map(([value, label]) => el('option', { value }, T[label]))
    );
  }

  function sparklineSVG(entry, dir, width, height) {
    const values = entry.points.map((p) => p.p);
    const W = width || 150;
    const H = height || 40;
    const { d, points } = APC.sparkline(values, W, H, 5);
    const root = svg('svg', { class: 'apc-spark', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
    if (!d) return root;
    root.append(svg('path', { d, fill: 'none', stroke: '#898781', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    for (const pt of points.slice(0, -1)) root.append(svg('circle', { cx: pt.x, cy: pt.y, r: 2.5, fill: '#c3c2b7' }));
    const last = points[points.length - 1];
    root.append(svg('circle', { cx: last.x, cy: last.y, r: 4, fill: dir === 'up' ? '#d03b3b' : dir === 'down' ? '#0ca30c' : '#898781', stroke: '#ffffff', 'stroke-width': 2 }));
    return root;
  }

  function pointsList(entry, item) {
    const pts = entry.points.slice(-8);
    const nodes = [];
    pts.forEach((pt, i) => {
      if (i) nodes.push(el('span', { class: 'apc-pt-arrow', 'aria-hidden': 'true' }, '→'));
      nodes.push(
        el(
          'span',
          { class: 'apc-pt' + (i === pts.length - 1 ? ' current' : '') },
          el('span', { class: 'apc-pt-t' }, formatDate(pt.t)),
          el('span', { class: 'apc-pt-p' }, money(pt.p, item))
        )
      );
    });
    return el('div', { class: 'apc-points' }, nodes);
  }

  function forgetItem(key) {
    delete history[key];
    store.set(HISTORY_KEY, history);
    state.expanded.delete(key);
    teardown();
    run();
  }

  function clearHistory() {
    history = {};
    store.remove(HISTORY_KEY);
    store.remove(SEEN_KEY);
    state.expanded.clear();
    teardown();
    run();
  }

  function signalText(sig) {
    if (sig.key === 'targetHit') return T.targetHit;
    if (sig.key === 'lowestSeen') return T.lowest;
    if (sig.key === 'streak') return T.streak(sig.n);
    if (sig.key === 'backToOld') return T.backToOld;
    return '';
  }

  function signalChips(item, extraClass) {
    const chips = [];
    for (const sig of (item.signals || []).slice(0, 2)) chips.push(chip(signalText(sig), (sig.key === 'targetHit' ? 'target' : 'lowest') + (extraClass ? ' ' + extraClass : '')));
    const entry = item.hist;
    if (entry && entry.target != null && !(item.signals || []).some((sig) => sig.key === 'targetHit')) {
      chips.push(chip(T.targetAt(money(entry.target, item)), 'group' + (extraClass ? ' ' + extraClass : '')));
    }
    return chips;
  }

  function targetEditor(item) {
    const entry = item.hist;
    if (!entry) return null;
    const input = el('input', {
      type: 'text',
      class: 'apc-target-input',
      inputmode: 'decimal',
      placeholder: money(item.newPrice, item),
      value: entry.target != null ? APC.formatMoney(entry.target, '', 'suffix', locale).trim() : '',
      'aria-label': T.target,
    });
    const save = () => {
      const v = APC.parseAmount(input.value);
      if (v == null || v <= 0) delete entry.target;
      else entry.target = v;
      store.set(HISTORY_KEY, history);
      item.signals = APC.signals(entry, Date.now());
      refreshRows();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      }
    });
    return el(
      'div',
      { class: 'apc-target' },
      el('span', { class: 'apc-detail-label' }, T.target),
      input,
      el('button', { type: 'button', class: 'apc-btn apc-btn-small', onclick: save }, T.save),
      entry.target != null
        ? el(
            'button',
            {
              type: 'button',
              class: 'apc-linkbtn',
              onclick: () => {
                delete entry.target;
                store.set(HISTORY_KEY, history);
                item.signals = APC.signals(entry, Date.now());
                refreshRows();
              },
            },
            T.clearTarget
          )
        : null
    );
  }

  function detailsRow(item) {
    const entry = item.hist;
    const dir = item.direction;
    const href = productHref(item);
    const meta = el(
      'div',
      { class: 'apc-detail-meta' },
      el('span', { class: 'apc-detail-was' }, T.was + ' ' + money(item.oldPrice, item)),
      el('span', { class: 'apc-pt-arrow', 'aria-hidden': 'true' }, '→'),
      el('span', { class: 'apc-detail-now' }, T.now + ' ' + money(item.newPrice, item)),
      el('span', { class: 'apc-detail-delta ' + dir }, (dir === 'up' ? '▲ ' : dir === 'down' ? '▼ ' : '') + money(item.delta, item, true) + ' (' + APC.formatPct(item.pct, locale, true) + ')'),
      el('span', { class: 'apc-detail-when' }, '· ' + formatDate(item.changedAt))
    );
    const historyBlock = entry
      ? el(
          'div',
          { class: 'apc-detail-history' },
          el('div', { class: 'apc-detail-label' }, T.history, el('span', { class: 'apc-detail-count' }, T.seen(entry.points.length))),
          el('div', { class: 'apc-detail-history-row' }, sparklineSVG(entry, dir), pointsList(entry, item)),
          targetEditor(item)
        )
      : null;
    const actions = el(
      'div',
      { class: 'apc-detail-actions' },
      href ? el('a', { class: 'apc-btn', href }, T.open + ' ↗') : null,
      item.live ? null : el('button', { type: 'button', class: 'apc-linkbtn apc-forget', onclick: () => forgetItem(item.key) }, T.forget)
    );
    const title = href ? el('a', { class: 'apc-detail-title', href }, item.name) : el('span', { class: 'apc-detail-title' }, item.name);
    return el(
      'tr',
      { class: 'apc-details', 'data-key': item.key },
      el('td', { colspan: '8' }, el('div', { class: 'apc-detail' }, thumb(item, 'apc-detail-img'), el('div', { class: 'apc-detail-main' }, title, meta, historyBlock), actions))
    );
  }

  function toggleExpand(key) {
    if (state.expanded.has(key)) state.expanded.delete(key);
    else state.expanded.add(key);
    refreshRows();
  }

  function row(item, s) {
    const dir = item.direction;
    const expanded = state.expanded.has(item.key);
    const share = s.maxAbsPct > 0 ? (Math.abs(item.pct || 0) / s.maxAbsPct) * 50 : 0;
    const pctText = APC.formatPct(item.pct, locale, true);
    const href = productHref(item);
    const chips = [];
    chips.push(...signalChips(item));
    if (state.showTags && item.group && item.group !== state.majorityGroup) chips.push(chip(T[item.group], 'group'));
    const nameNode = href
      ? el('a', { href, title: item.name }, item.name)
      : el('span', { class: 'apc-name-text', title: item.name }, item.name);
    const tr = el(
      'tr',
      {
        class: 'apc-row ' + dir + (expanded ? ' expanded' : '') + (item.isNew ? ' is-new' : '') + (item.live ? ' live' : ' remembered'),
        'data-key': item.key,
        onclick: (e) => {
          if (e.target.closest('a, button')) return;
          toggleExpand(item.key);
        },
      },
      el('td', { class: 'apc-thumb' }, thumb(item, 'apc-thumb-img')),
      el(
        'td',
        { class: 'apc-name' },
        el('div', { class: 'apc-name-wrap' }, item.isNew ? el('i', { class: 'apc-newdot', title: T.isNew }) : null, nameNode, chips)
      ),
      el('td', { class: 'apc-num apc-was' }, money(item.oldPrice, item)),
      el('td', { class: 'apc-num apc-now' }, money(item.newPrice, item)),
      el(
        'td',
        { class: 'apc-num apc-delta ' + dir },
        el('span', { class: 'apc-arrow', 'aria-hidden': 'true' }, dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'),
        ' ' + money(item.delta, item, true),
        el('span', { class: 'apc-pct' }, pctText)
      ),
      el(
        'td',
        { class: 'apc-bar', title: money(item.oldPrice, item) + ' → ' + money(item.newPrice, item) + ' (' + pctText + ')' },
        el('div', { class: 'apc-track' }, dir === 'same' ? null : el('i', { class: 'apc-fill ' + dir, style: 'width:' + share.toFixed(2) + '%' }))
      ),
      el('td', { class: 'apc-when' }, formatDate(item.changedAt)),
      el(
        'td',
        { class: 'apc-more' },
        el(
          'button',
          { type: 'button', class: 'apc-chevron', 'aria-expanded': expanded ? 'true' : 'false', 'aria-label': T.details, onclick: () => toggleExpand(item.key) },
          '›'
        )
      )
    );
    return expanded ? [tr, detailsRow(item)] : [tr];
  }

  function visibleItems() {
    let list = APC.filterItems(state.items, prefs.filter);
    const q = state.query.trim().toLocaleLowerCase(locale);
    if (q) list = list.filter((i) => i.name.toLocaleLowerCase(locale).includes(q));
    if (prefs.sort === 'changedAt') {
      list = list.slice().sort((a, b) => a.changedAt - b.changedAt);
      if (prefs.dir === 'desc') list.reverse();
      return list;
    }
    return APC.sortItems(list, prefs.sort, prefs.dir);
  }

  function emptyState() {
    const text = state.items.length ? T.empty : T.noChanges;
    const widen =
      !state.items.length && prefs.window !== 'all'
        ? el(
            'button',
            {
              type: 'button',
              class: 'apc-linkbtn',
              onclick: () => {
                prefs.window = 'all';
                savePrefs();
                build(state.live, Date.now(), false);
              },
            },
            T.showAll
          )
        : null;
    return el('div', { class: 'apc-empty-state' }, el('span', null, text), widen);
  }

  function cardDetails(item) {
    const entry = item.hist;
    return el(
      'div',
      { class: 'apc-card-details' },
      entry ? pointsList(entry, item) : null,
      targetEditor(item),
      item.live ? null : el('button', { type: 'button', class: 'apc-linkbtn apc-forget', onclick: () => forgetItem(item.key) }, T.forget)
    );
  }

  function card(item) {
    const dir = item.direction;
    const href = productHref(item);
    const entry = item.hist;
    const expanded = state.expanded.has(item.key);
    const pctText = APC.formatPct(item.pct, locale, true);
    const media = el(
      href ? 'a' : 'div',
      { class: 'apc-card-media', href: href || null, title: item.name },
      thumb(item, 'apc-card-img'),
      item.isNew ? el('i', { class: 'apc-newdot apc-card-new', title: T.isNew }) : null,
      signalChips(item, 'apc-card-ribbon').slice(0, 1)
    );
    const title = el(href ? 'a' : 'span', { class: 'apc-card-title', href: href || null, title: item.name }, item.name);
    const prices = el(
      'div',
      { class: 'apc-card-prices' },
      el('span', { class: 'apc-card-now' }, money(item.newPrice, item)),
      el('span', { class: 'apc-card-was' }, money(item.oldPrice, item))
    );
    const pill = el(
      'span',
      { class: 'apc-pill ' + dir },
      el('span', { class: 'apc-arrow', 'aria-hidden': 'true' }, dir === 'up' ? '▲' : '▼'),
      ' ' + money(item.delta, item, true),
      el('span', { class: 'apc-pill-pct' }, pctText)
    );
    const when = el('span', { class: 'apc-card-when' }, formatDate(item.changedAt));
    const more = el(
      'button',
      { type: 'button', class: 'apc-chevron apc-card-more', 'aria-expanded': expanded ? 'true' : 'false', 'aria-label': T.details, onclick: () => toggleExpand(item.key) },
      '›'
    );
    const meta = el(
      'div',
      { class: 'apc-card-meta' },
      entry ? el('span', { class: 'apc-card-spark', title: T.seen(entry.points.length) }, sparklineSVG(entry, dir, 110, 26)) : null,
      when,
      more
    );
    return el(
      'article',
      { class: 'apc-card ' + dir + (item.isNew ? ' is-new' : '') + (expanded ? ' expanded' : ''), 'data-key': item.key },
      media,
      el('div', { class: 'apc-card-body' }, title, prices, pill, meta),
      expanded ? cardDetails(item) : null
    );
  }

  function jumpTo(key) {
    const item = state.items.find((i) => i.key === key);
    if (!item) return;
    let changed = false;
    if (prefs.filter !== 'all' && item.direction !== prefs.filter) {
      prefs.filter = 'all';
      changed = true;
    }
    if (state.query) {
      state.query = '';
      if (state.ui.search) state.ui.search.value = '';
      changed = true;
    }
    if (prefs.collapsed) {
      setCollapsed(false);
      changed = true;
    }
    if (!state.expanded.has(key)) {
      state.expanded.add(key);
      changed = true;
    }
    if (changed) {
      savePrefs();
      refreshRows();
    }
    const node = state.ui.panel && state.ui.panel.querySelector('.apc-card[data-key="' + key + '"], .apc-row[data-key="' + key + '"]');
    if (!node) return;
    node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    node.classList.add('flash');
    setTimeout(() => node.classList.remove('flash'), 1400);
  }

  function viewButton(key, label) {
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-segbtn' + (prefs.view === key ? ' active' : ''),
        'data-view': key,
        title: label,
        onclick: () => {
          if (prefs.view === key) return;
          prefs.view = key;
          savePrefs();
          refreshRows();
        },
      },
      label
    );
  }

  function diagnostics() {
    const probes = ['.sc-list-item', '[data-asin]', '[data-asin][data-price]', '[data-itemtype]', '#sc-active-cart', '#sc-saved-cart', '#activeCartViewForm', '.sc-list-body', '.a-alert', 'a[href*="/dp/"]', 'a[href*="/gp/product/"]', '.sc-product-price', '.a-price .a-offscreen', 'img.sc-product-image'];
    const lines = ['Amazon Cart Price Changes · diagnostics', 'url: ' + location.origin + location.pathname, 'lang: ' + lang, 'tracked: ' + state.tracked + ' · live: ' + state.live.length + ' · history: ' + Object.keys(history).length + ' · shown: ' + state.items.length];
    for (const p of probes) lines.push(p + ': ' + document.querySelectorAll(p).length);
    const sample = document.querySelector('.sc-list-item, [data-asin][data-price], #sc-saved-cart [data-asin], #sc-active-cart [data-asin]');
    if (sample) lines.push('', 'sample list item:', sample.outerHTML.replace(/\s+/g, ' ').slice(0, 5000));
    const link = Array.from(document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')).find((a) => !a.closest('#' + PANEL_ID));
    if (link && (!sample || !sample.contains(link))) {
      const box = link.closest('li, [class*="item"], .a-row') || link.parentElement;
      lines.push('', 'sample product link context:', (box ? box.outerHTML : link.outerHTML).replace(/\s+/g, ' ').slice(0, 3000));
    }
    return lines.join('\n');
  }

  function refreshRows() {
    const ui = state.ui;
    if (!ui.tbody || !ui.grid) return;
    const visible = visibleItems();
    const cards = prefs.view === 'cards';
    ui.panel.classList.toggle('view-cards', cards);
    ui.panel.classList.toggle('view-list', !cards);
    if (ui.viewSeg) for (const b of ui.viewSeg.querySelectorAll('button')) b.classList.toggle('active', b.dataset.view === prefs.view);
    if (cards) {
      ui.grid.replaceChildren(...(visible.length ? visible.map(card) : [emptyState()]));
      ui.tbody.replaceChildren();
    } else {
      ui.grid.replaceChildren();
      const rows = visible.length ? visible.flatMap((i) => row(i, state.summary)) : [el('tr', { class: 'apc-empty' }, el('td', { colspan: '8' }, emptyState()))];
      ui.tbody.replaceChildren(...rows);
    }
    if (ui.panel) {
      for (const b of ui.panel.querySelectorAll('.apc-stat')) {
        const active = b.dataset.filter === prefs.filter;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
    }
    if (ui.sortSelect) {
      const value = prefs.sort + ':' + prefs.dir;
      ui.sortSelect.value = SORT_OPTIONS.some(([v]) => v === value) ? value : '';
    }
    for (const b of ui.sortButtons || []) {
      const active = b.dataset.sort === prefs.sort;
      b.classList.toggle('active', active);
      b.querySelector('.apc-sortmark').textContent = active ? (prefs.dir === 'asc' ? '↑' : '↓') : '';
    }
  }

  function sortButton(key, label, cls) {
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-th ' + (cls || ''),
        'data-sort': key,
        onclick: () => {
          if (prefs.sort === key) prefs.dir = prefs.dir === 'asc' ? 'desc' : 'asc';
          else {
            prefs.sort = key;
            prefs.dir = key === 'changedAt' ? 'desc' : APC.defaultSortDir(key);
          }
          savePrefs();
          refreshRows();
        },
      },
      label,
      el('span', { class: 'apc-sortmark', 'aria-hidden': 'true' })
    );
  }

  function setCollapsed(collapsed) {
    prefs.collapsed = collapsed;
    savePrefs();
    const ui = state.ui;
    if (ui.panel) ui.panel.classList.toggle('collapsed', collapsed);
    if (ui.collapseBtn) {
      ui.collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      ui.collapseBtn.setAttribute('aria-label', collapsed ? T.expand : T.collapse);
      ui.collapseBtn.title = collapsed ? T.expand : T.collapse;
    }
  }

  function winButton(key) {
    const label = T['win' + key.charAt(0).toUpperCase() + key.slice(1)] || key;
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-segbtn' + (prefs.window === key ? ' active' : ''),
        'data-window': key,
        onclick: () => {
          if (prefs.window === key) return;
          prefs.window = key;
          savePrefs();
          build(state.live, Date.now(), false);
        },
      },
      label
    );
  }

  function render(items, s) {
    const ui = state.ui;
    const ref = items[0] || pageMoney;
    const groupCounts = {};
    for (const i of items) if (i.group) groupCounts[i.group] = (groupCounts[i.group] || 0) + 1;
    const majority = Object.keys(groupCounts).sort((a, b) => groupCounts[b] - groupCounts[a])[0] || '';
    state.showTags = Object.keys(groupCounts).length > 1;
    state.majorityGroup = majority;
    const newCount = items.filter((i) => i.isNew).length;

    ui.collapseBtn = el('button', { type: 'button', class: 'apc-chevron apc-collapse', onclick: () => setCollapsed(!prefs.collapsed) }, '›');

    ui.win = el('div', { class: 'apc-seg apc-win', role: 'group' }, WINDOWS.map(winButton));
    ui.viewSeg = el('div', { class: 'apc-seg apc-viewseg', role: 'group' }, viewButton('cards', '▦ ' + T.cards), viewButton('list', '☰ ' + T.list));

    ui.sortSelect = sortSelect();

    ui.search =
      items.length > 5
        ? el('input', {
            type: 'search',
            class: 'apc-search',
            placeholder: T.search,
            'aria-label': T.search,
            oninput: (e) => {
              state.query = e.target.value;
              refreshRows();
            },
          })
        : null;

    const subtitleParts = [];
    if (state.tracked) subtitleParts.push(T.tracking(state.tracked));
    if (!state.live.length && items.length) subtitleParts.push(T.remembered);
    if (newCount) subtitleParts.push(T.newSince(newCount, formatDate(prevSeen && prevSeen.t)));
    const subtitle = subtitleParts.length
      ? el('div', { class: 'apc-subtitle' }, newCount ? el('i', { class: 'apc-newdot', 'aria-hidden': 'true' }) : null, subtitleParts.join(' · '))
      : null;

    ui.sortButtons = [
      sortButton('name', T.product),
      sortButton('oldPrice', T.was, 'num'),
      sortButton('newPrice', T.now, 'num'),
      sortButton('delta', T.change, 'num'),
      sortButton('pct', '%', 'pct'),
      sortButton('changedAt', T.when),
    ];

    ui.grid = el('div', { class: 'apc-grid' });
    ui.tbody = el('tbody');
    ui.table = el(
      'table',
      { class: 'apc-table animate' },
      el(
        'thead',
        null,
        el(
          'tr',
          null,
          el('th', { class: 'apc-thumb' }),
          el('th', { class: 'apc-name' }, ui.sortButtons[0]),
          el('th', { class: 'apc-num' }, ui.sortButtons[1]),
          el('th', { class: 'apc-num' }, ui.sortButtons[2]),
          el('th', { class: 'apc-num' }, ui.sortButtons[3]),
          el('th', { class: 'apc-bar' }, el('span', { class: 'apc-axis' }, ui.sortButtons[4])),
          el('th', { class: 'apc-when' }, ui.sortButtons[5]),
          el('th', { class: 'apc-more' })
        )
      ),
      ui.tbody
    );
    setTimeout(() => ui.table && ui.table.classList.remove('animate'), 800);

    const copyBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn',
        onclick: () => {
          const csv = APC.toCSV(visibleItems());
          const done = () => {
            copyBtn.textContent = T.copied;
            setTimeout(() => (copyBtn.textContent = T.copy), 1500);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(csv).then(done, done);
        },
      },
      T.copy
    );

    ui.toggleBtn = state.live.length
      ? el(
          'button',
          {
            type: 'button',
            class: 'apc-linkbtn',
            onclick: () => {
              prefs.showOriginal = !prefs.showOriginal;
              savePrefs();
              setOriginalVisible(prefs.showOriginal);
            },
          },
          prefs.showOriginal ? T.hideOriginal : T.showOriginal
        )
      : null;

    let clearArmed = null;
    const clearBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn apc-clear',
        onclick: () => {
          if (clearArmed) {
            clearTimeout(clearArmed);
            clearHistory();
            return;
          }
          clearBtn.textContent = T.clearConfirm;
          clearArmed = setTimeout(() => {
            clearArmed = null;
            clearBtn.textContent = T.clear;
          }, 3000);
        },
      },
      T.clear
    );

    const diagBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn apc-diag',
        onclick: () => {
          const done = () => {
            diagBtn.textContent = T.diagDone;
            setTimeout(() => (diagBtn.textContent = T.diag), 1500);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(diagnostics()).then(done, done);
        },
      },
      T.diag
    );

    const netDir = s.net > 0 ? 'up' : s.net < 0 ? 'down' : 'same';
    const footParts = [copyBtn];
    if (ui.toggleBtn) footParts.push(el('span', { class: 'apc-sep' }, '·'), ui.toggleBtn);
    footParts.push(el('span', { class: 'apc-sep' }, '·'), clearBtn, el('span', { class: 'apc-sep' }, '·'), diagBtn);

    ui.panel = el(
      'section',
      { id: PANEL_ID, class: 'apc', lang: locale },
      el(
        'header',
        { class: 'apc-head' },
        el(
          'div',
          { class: 'apc-title-wrap' },
          ui.collapseBtn,
          el('div', null, el('div', { class: 'apc-title' }, T.title, el('span', { class: 'apc-badge' }, s.total)), subtitle)
        ),
        el('div', { class: 'apc-controls' }, ui.search, ui.viewSeg)
      ),
      tiles(s, ref),
      el(
        'div',
        { class: 'apc-toolbar' },
        el('div', { class: 'apc-toolbar-left' }, el('span', { class: 'apc-toolbar-label' }, T.period), ui.win),
        el('label', { class: 'apc-sort' }, T.sort, ui.sortSelect)
      ),
      ui.grid,
      ui.table,
      el(
        'footer',
        { class: 'apc-foot' },
        el('span', { class: 'apc-legend' }, el('i', { class: 'apc-dot down' }), T.drops, el('i', { class: 'apc-dot up' }), T.increases),
        el('span', { class: 'apc-net' }, T.net + ' ', el('b', { class: netDir }, money(s.net, ref, true))),
        el('span', { class: 'apc-spacer' }),
        footParts
      )
    );
    setCollapsed(!!prefs.collapsed);
    refreshRows();
    return ui.panel;
  }

  function teardown() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();
    restoreOriginals();
    state.items = [];
    state.live = [];
    state.summary = null;
    state.signature = '';
    state.anchor = { node: null, whole: false, after: false };
    state.ui = {};
  }

  function fresh(existing, items, signature) {
    if (!existing || !existing.isConnected) return false;
    if (signature !== state.signature) return false;
    if (state.anchor.node && !state.anchor.node.isConnected) return false;
    return items.every((i) => i.nodes.every((n) => n.isConnected));
  }

  function scan() {
    const now = Date.now();
    const live = collect();
    const observed = CART_RE.test(location.pathname) ? scanListItems() : [];
    let dirty = false;
    for (const item of live) {
      APC.recordHistory(history, item, now);
      dirty = true;
    }
    for (const obs of observed) {
      APC.recordObservation(history, obs, now);
      dirty = true;
    }
    return { live, observed, now, dirty };
  }

  function run() {
    const onCart = CART_RE.test(location.pathname);
    const { live, observed, now, dirty } = scan();
    state.tracked = observed.length;
    state.cartKeys = observed.filter((o) => o.group === 'cart').map((o) => o.key);
    if (!live.length && !onCart) {
      if (state.signature) teardown();
      return;
    }
    build(live, now, dirty);
  }

  function build(live, now, dirty) {
    const liveByKey = new Map(live.map((i) => [i.key, i]));
    const start = APC.windowStart(prefs.window, now);
    state.windowStart = start;
    const items = APC.itemsFromHistory(history, now, start, pageMoney).map((base) => {
      const l = liveByKey.get(base.key);
      const entry = history[base.key];
      const stored = isGoodImageURL(base.image) ? base.image : null;
      const image = (l && l.image) || stored || findImage(/^[A-Z0-9]{10}$/.test(base.key) ? base.key : null) || null;
      if (entry && entry.image !== image && (image || entry.image)) {
        if (image) entry.image = image;
        else delete entry.image;
        dirty = true;
      }
      return Object.assign(base, {
        live: !!l,
        li: l ? l.li : null,
        ul: l ? l.ul : null,
        nodes: l ? l.nodes : [],
        image,
        hist: entry,
        signals: APC.signals(entry, now),
        isNew: !!(prevSeen && prevSeen.t && base.changedAt > prevSeen.t),
      });
    });
    if (dirty) store.set(HISTORY_KEY, history);
    const signature = [prefs.window, state.tracked, state.cartKeys.join(',')]
      .concat(items.map((i) => [i.key, i.oldPrice, i.newPrice, i.changedAt, i.image || '', i.live ? 1 : 0].join('|')))
      .join('\n');
    if (fresh(document.getElementById(PANEL_ID), items, signature)) return;
    teardown();
    if (!items.length && !live.length && !Object.keys(history).length) return;
    store.set(SEEN_KEY, { t: now, keys: items.map((i) => i.key) });
    state.items = items;
    state.live = live;
    state.summary = APC.summarize(items);
    state.signature = signature;
    state.anchor = live.length ? anchorFor(live) : fallbackAnchor();
    const target = state.anchor.node;
    if (!target || !target.parentNode) return;
    fetchMissingImages(items, now);
    const panel = render(items, state.summary);
    if (state.anchor.after) target.insertAdjacentElement('afterend', panel);
    else target.parentNode.insertBefore(panel, target);
    if (live.length) hideOriginals(live, state.anchor);
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 400);
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      const t = m.target;
      if (t && t.nodeType === 1 && t.closest('#' + PANEL_ID)) continue;
      schedule();
      return;
    }
  });
  async function init() {
    adoptState(await loadState());
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'data-src', 'data-a-dynamic-image'] });
    run();
    if (CART_RE.test(location.pathname)) notifyWorker({ type: 'visited', host: HOST });
  }
  init();
})();
