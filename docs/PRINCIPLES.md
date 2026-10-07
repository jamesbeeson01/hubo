# Hubo Principles

A few rules of thumb. For the look and feel, see `Hubo Design.pdf`.

## Ephemeral chrome
Controls are hidden until they're needed and go away once you stop using them. At rest, Hubo is just "Hubo" and the omnibox. Buttons, drawers and affordances appear on hover or focus and collapse when the pointer leaves. If something can't be used right now, hide it instead of showing it disabled.

## One input, no modes
There's one omnibox with no search/chat toggle. What you type decides where it goes. Anything that isn't clearly a launch or command goes to chat, so input never hits a dead end.

## Esc goes back one layer
Every surface can be closed. Esc backs out one layer at a time until Hubo closes. Reopening always starts at home.

## The window fits its content
You can't resize the window yourself. Hubo grows and shrinks to fit what's showing, up to a sensible max, and scrolls inside past that.

## Apps are drop-in
Adding an app should mean adding its own file and registering it, with no changes to core code.

## Local first
Your data stays on your machine. Network access is opt-in.

## Calm, soft, quick
Motion is fast and subtle and respects the OS "Reduce Motion" setting. Corners are very rounded.

## Narrow trust boundary
The renderer gets no Node access. Anything privileged goes through a small preload bridge.
