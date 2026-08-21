# Mobile Testing Guide

## Real Device Testing Checklist

### iOS Testing (Safari)
- **Device**: iPhone 12+ or iPad
- **iOS Version**: 15+
- **Browser**: Safari (not Chrome)
- **Tests**:
  - [ ] Hero WebGL scene loads and animates
  - [ ] Smooth scroll with Lenis works
  - [ ] All images load with correct srcset
  - [ ] Fonts render correctly (Playfair + Inter)
  - [ ] Navigation is usable with thumb reach
  - [ ] Forms/buttons are ≥ 48x48px
  - [ ] Text is readable (≥ 16px body)
  - [ ] No horizontal scroll
  - [ ] Case study pages scroll smoothly

### Android Testing (Chrome)
- **Device**: Mid-range Android (2020+)
- **Android Version**: 11+
- **Browser**: Chrome
- **Tests**:
  - [ ] Hero scene performance (60fps target)
  - [ ] Lenis smooth scroll
  - [ ] WebP images load correctly
  - [ ] Touch interactions work
  - [ ] No jank during scroll
  - [ ] Battery usage acceptable (not draining)

### Network Conditions

#### 3G (Slow 3G: 400ms RTT, 400Kbps down)
- [ ] Page loads in < 10s
- [ ] Hero image loads progressively
- [ ] Fonts load within 3s
- [ ] Site is usable while loading

#### 4G (Good 3G: 150ms RTT, 1.6Mbps down)
- [ ] Page loads in < 5s
- [ ] All assets load quickly
- [ ] Animations are smooth

## Lighthouse Mobile Targets

| Metric | Good | Needs Work |
|--------|------|------------|
| Performance | 90-100 | < 90 |
| Accessibility | 90-100 | < 90 |
| Best Practices | 90-100 | < 90 |
| SEO | 90-100 | < 90 |

## Common Mobile Issues to Check

### Performance
- [ ] **LCP**: Largest Contentful Paint < 2.5s
- [ ] **FID**: First Input Delay < 100ms
- [ ] **CLS**: Cumulative Layout Shift < 0.1
- [ ] **TBT**: Total Blocking Time < 200ms

### UX
- [ ] **Tap targets**: All interactive elements ≥ 48x48px
- [ ] **Viewport**: Proper viewport meta tag
- [ ] **Font sizes**: Body text ≥ 16px
- [ ] **Contrast**: Text/background contrast ≥ 4.5:1
- [ ] **Zoom**: Page zoom works (no user-scalable=no)

### Browser Compatibility
- [ ] **Safari**: All features work
- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work (if applicable)
- [ ] **Samsung Internet**: All features work

## Testing Commands

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. Check scores and opportunities

### Network Throttling
1. DevTools → Network tab
2. Select "Slow 3G" or "Fast 3G"
3. Reload page
4. Observe loading behavior

### Performance Profiling
1. DevTools → Performance tab
2. Record while scrolling
3. Look for long tasks (> 50ms)
4. Check frame rate (target 60fps)

## Expected Results

### Desktop (Chrome, fast connection)
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- Load time: < 2s
- All animations smooth

### Mobile (4G, mid-range device)
- Lighthouse Performance: 80-90
- Lighthouse Accessibility: 90+
- Load time: < 5s
- Animations mostly smooth

### Mobile (3G, mid-range device)
- Lighthouse Performance: 60-80
- Load time: < 10s
- Core content visible within 3s
- Usable while loading

## Debugging Tips

### If LCP is slow:
- Check if hero image is optimized (WebP, correct size)
- Verify `fetchpriority="high"` is set
- Check if image is in viewport on load

### If CLS is high:
- Check all images have `width`/`height` attributes
- Verify no dynamic content above images
- Check for late-loading fonts causing shifts

### If FID is high:
- Check for render-blocking JS
- Verify scripts have `defer` or `async`
- Check for long-running JS tasks

### If mobile performance is poor:
- Check if WebGL scene is too heavy
- Verify animations are optimized
- Check image sizes for mobile viewport
