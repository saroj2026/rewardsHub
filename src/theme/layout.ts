// The floating bottom tab bar (see navigation/BottomTabBar.tsx) is
// absolutely positioned over screen content on every tab, including
// screens pushed on top within each tab's stack. Scrollable content and
// bottom-pinned footers need at least this much clearance so nothing
// (e.g. a final button) ends up hidden behind it.
export const TAB_BAR_CLEARANCE = 110;
