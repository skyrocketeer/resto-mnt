import { useState, useEffect, useCallback } from 'react'

export interface ScreenSizeInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

export function getScreenSizeInfo(width: number = window.innerWidth): ScreenSizeInfo {
  return {
    isMobile: width < 768, // md breakpoint
    isTablet: width >= 768 && width < 1024, // md to lg breakpoint
    isDesktop: width >= 1024,
    width
  }
}

export function useScreenSize(
  onSizeChange?: (sizeInfo: ScreenSizeInfo) => void
): ScreenSizeInfo {
  const [screenSize, setScreenSize] = useState<ScreenSizeInfo>(() => getScreenSizeInfo())

  useEffect(() => {
    const checkScreenSize = () => {
      const newSize = getScreenSizeInfo()
      setScreenSize(newSize)
      onSizeChange?.(newSize)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [onSizeChange])

  return screenSize
}

export function useScreenSizeWithSidebar(
  onMobileOrTablet?: () => void
) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Memoize the callback to prevent infinite re-renders
  const handleSizeChange = useCallback((sizeInfo: ScreenSizeInfo) => {
    // Auto-collapse sidebar on mobile and tablet for better UX
    if (sizeInfo.width < 1024) {
      setSidebarCollapsed(true)
      onMobileOrTablet?.()
    }
  }, [onMobileOrTablet])
  
  const screenSize = useScreenSize(handleSizeChange)

  return {
    ...screenSize,
    sidebarCollapsed,
    setSidebarCollapsed
  }
}