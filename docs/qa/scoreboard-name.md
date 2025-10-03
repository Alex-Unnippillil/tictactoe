# Manual QA: Scoreboard Name Responsiveness

## Scenario
Verify that player names at the 24-character limit render without breaking the glass card layout on both mobile and desktop breakpoints.

## Test Data
- Player X name: `AlexandriaLightningChamp`
- Player O name: `TheStrategistSupreme24`

## Steps
1. Open the TicTacToe game page in a desktop browser at >=1280px width.
2. Set the player names to the values above (24 characters each) via the scoreboard controls.
3. Confirm that the names wrap or truncate within the glass card without overlapping the mark or score columns.
4. Resize the viewport to ~375px width (or use a mobile simulator) and repeat step 3.
5. Toggle a reduced-motion preference and confirm marquee animations are disabled while clamping still keeps the layout intact.

## Expected Results
- Typography scales responsively and remains legible at both breakpoints.
- Long names wrap to at most two lines or gracefully ellipsize without pushing against the card edges.
- With reduced motion enabled, no marquee animation plays and the layout remains stable.
