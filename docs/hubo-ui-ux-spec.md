# Hubo — UI/UX Specification

## 1. Guiding Principles
- Minimal at rest; reveal only what’s needed when it’s needed  
- Fluid, modern motion; fast, subtle micro-interactions  
- One omnibox: “Search or Chat…” (no hard mode toggle; intent detection)  
- Contextual controls: appear on hover/focus or when relevant 
- Shape language: highly rounded corners across surfaces and tiles  

## 2. Visual Theme & Shape 
- Highlights: dark smoky blue accents (links, accents, focus rings)  
- Background A: pure white; home
- Background B: light gray for drawers, panels; smoky blue for help sheet, full app window  
- Corners: 8–12 px radius for apps; 40-50 px radii for panels and drawers
- Font: Comfortaa Light

## 3. Entry, Exit, Focus
- Global open: **Ctrl + Alt + H** opens Hubo (focuses omnibox)  
- Dismiss: **Esc** on home with empty input: closes Hubo; **Esc** when input is present: clears input; **Esc** when Esc inside a panel/drawer: closes current surface (return to home screen). Click outside of any panel/home closes Hubo
- Reopen behavior: returns to home screen
- Pointer-leave behavior: if drawers/panels are open and cursor leaves their region, collapse back to Home  

## 4. Window, Layout, Resizing
- Placement: centered overlay, 640–800 px width adaptive, rounded corners  
- Auto-expand: container grows to fit content; max height ≈ 70% of viewport; inner content scrolls beyond  
- Motion  
  - Show: 96 ms fade + scale 1.03 → 1.00  
  - Resize: spring 160–220 ms  
  - List items: 90 ms fade/slide-up, 24 ms stagger  
  - Hover: 1.00 → 1.02 scale, 120 ms  

## 5. Top Bar Hover Controls
- Trigger: hover over top bar of the main window 
- Reveal: fade in; trasparent background; Close (×) and Full App Screen buttons  
- Alignment: right- or left-aligned per design variant
- Hide: fade out when hover ends  

## 6. Bottom Affordance → App Drawer Stack
1. **Bottom hover affordance**  
   - Trigger: hover just below main window  
   - Display: down arrow with dark translucent gradient backdrop extending from behind the above window down, fading to transparent  
   - Purpose: indicates content below  

2. **Small App Drawer (first click)**  
   - Trigger: click the bottom affordance area  
   - Presentation: compact drawer with 4 apps (1 × 4), light gray background, rounded tiles  
   - Behavior: hover lift/scale; arrow keys to navigate; Enter/click to launch; Esc closes drawer  

3. **“More…” area under small drawer (hover)**  
   - Trigger: hover under the small drawer  
   - Display: gradient strip with text “More…” 
   - On click: opens full app window, collapses app drawer in the background 

4. **Full App Window (click “More…”)**  
   - Trigger: click the “More…” strip; fades/shrinks into view
   - Presentation: larger window containing all apps (grid 4 columns), smoky blue background, highly rounded corners  
   - Behavior: scrollable grid; inline search/filter on focus/typing; 
   - Exit: cursor outside or **Esc** fades/shinks to home 

5. **Collapse on pointer leave**  
   - Hover-persistent drawer and affordance areas while cursor is inside; slide-up collapse drawer and affordance when cursor exits regions

## 7. Omnibox (Search or Chat…)
- Display: text field with white background and light gray hint text "Search or Chat…"; bottom of Hubo home; line underneath field dark smoky blue highlight; no other borders
- Enter: executes top result/launch; if no actionable result, routes to AI chat  
- **Shift + Enter**: newline; text box expands upward
- **Up/Down** cycles selections; **Right Arrow** opens details  
- **Esc** clears input  
- Multi-line paste: input grows up to 5 lines before internal scroll  
- Prefix tokens:  
  - `>` local app search   `/` chat only   `@` system file search   `*` system app search   `?` open hubo in vscode  
- **Down** or click on omnibox (when input empty): shows pinned and recent items below omnibox  
- **Ctrl + Enter**: sends input to chat (instead of top result)

## 8. Results & Launching
- On text input: Instant results beneath omnibox; groups shown only if present (Apps (local), Files, Apps (system), Shortcuts); Display up to six items followed by "Send to chat..."; If no results found, only "Send to chat..." is shown
- Row content: icon + name + muted path/descriptor; hover actions: Pin, Reveal  
- Actions:  
  - **Enter** = primary   
  - **Right Arrow** opens detail pane  
  - **Left Arrow** closes detail pane 

## 9. Chat (API-based)
- Trigger: **Ctrl + Enter**; **Enter** when input isn’t a clear launch/command intent or prefix character `/` used;   
- Layout: input stays at bottom; thread expands above; container grows until max height, then inner scroll  
- Streaming: tokens stream
- Chat action row (above input): Attach (paperclip), Copy, Model Selector
- Message tools (below each message in chat): copy, edit, regenerate
- Inline right button: Clear/Stop/New Chat (contextual); Clear while input, Stop while streaming, new chat when response and no input; shown on hover, hidden by default  
- Thread controls (appear when thread exists; hover top-right): Rename, Share/Export, Model/Menu  
- Keyboard: **Ctrl + N** new chat; **↑** recall last msg; **Tab** cycles message actions  
- Errors: inline compact error with Retry & Copy prompt   

## 10. Help & Hints (Ctrl + K)
- Trigger: **Ctrl + K**
- Close: **Ctrl + K** or **Esc**
- Presentation: display over top panel, centered, smoky blue translucent background, rounded corners, height of text inside
- Content: keyboard shortcuts (two columns, shortcut and description), search/chat/command tips

## 11. Empty, Loading, and Error States
- Empty: only “Hubo” + omnibox  
- Loading: skeleton shimmer rows for results; chat streams immediately when available  
- Errors: compact toasts top-right within Hubo; auto-dismiss; include Undo/Retry when relevant  

## 12. Accessibility
- Full keyboard operation; visible focus rings  
- ARIA roles: listbox/option for results; live regions for chat streaming  
- Honors OS “Reduce Motion”; ensures WCAG color contrast compliance  

## 13. Performance & Responsiveness
- Debounced queries (100–150 ms); optimistic local ranking; async enrichment  
- Virtualize lists when > 30 items; cache recents; offline: local launch still works  

## 14. Motion & Micro-Interactions (Summary)
- Open/close & resize timings per §4  
- Bottom affordance arrow: fade (90–120 ms)  
- Small drawer: slide-down (160–200 ms)  
- Full app window: scale 1.02 → 1.00 + fade (180–220 ms)  
- Hover on tiles: subtle lift/scale (≤ 1.03)  

