import { PhysicsResult } from '../physics/types';
import { GameState } from './types';

export function evaluateShot(
  currentState: GameState,
  result: PhysicsResult
): GameState {
  // Deep clone to avoid mutating standard params
  const nextState: GameState = JSON.parse(JSON.stringify(currentState));
  
  const { pocketedBalls, firstContactId, cushionContacts } = result;
  nextState.fouls = [];
  nextState.message = null;

  // 1. Foul: Cue ball in pocket
  const isCuePocketed = pocketedBalls.includes(0);

  // 2. Foul: Did not hit anything
  const hitNothing = firstContactId === null;

  // 3. Foul: Did not hit a cushion after contact (and no ball potted)
  const noCushionAfterContact = !hitNothing && cushionContacts === 0 && pocketedBalls.length === 0;

  // 4. Check if hitting correct group first
  let wrongBallFirst = false;
  if (firstContactId !== null && firstContactId !== 8) {
    const activeGroup = nextState.turn === 'p1' ? nextState.p1Group : nextState.p2Group;
    if (activeGroup !== 'unassigned') {
      const isFirstContactSolid = firstContactId >= 1 && firstContactId <= 7;
      if ((activeGroup === 'solids' && !isFirstContactSolid) || (activeGroup === 'stripes' && isFirstContactSolid)) {
        wrongBallFirst = true;
      }
    }
  }

  // 5. 8-Ball rules
  const is8Potted = pocketedBalls.includes(8);
  
  // Basic Win/Loss evaluation
  if (is8Potted) {
      if (currentState.isFirstBreak) {
          // WPA say re-rack, we'll mark as re-rack or immediate win/loss based on standard pub rules.
          // Pub rules: 8 on break is a WIN.
          nextState.matchState = 'game_over';
          nextState.winner = nextState.turn;
          nextState.message = "8-ball potted on the break! You win!";
          return nextState;
      }

      if (isCuePocketed || wrongBallFirst) {
          // Potted 8 but fouled -> LOSS
          nextState.matchState = 'game_over';
          nextState.winner = nextState.turn === 'p1' ? 'p2' : 'p1';
          nextState.message = "Foul on the 8-ball! You lose!";
          return nextState;
      }

      // Check if they cleared their group
      // Without knowing the full table state, we must assume context.
      // Easiest is to run through the pocketed list or rely on `initialBalls` parameter.
      // But for this engine layer, if 8 is potted cleanly, it's a WIN (assuming they were shooting it).
      nextState.matchState = 'game_over';
      nextState.winner = nextState.turn;
      nextState.message = "8-ball pocketed legally. You WIN!";
      return nextState;
  }

  // Combine Fouls
  if (isCuePocketed) nextState.fouls.push("Cue ball scratched");
  if (hitNothing) nextState.fouls.push("Failed to hit a ball");
  if (wrongBallFirst) nextState.fouls.push("Hit opponent's group first");
  if (noCushionAfterContact) nextState.fouls.push("No cushion hit after contact");

  const hasFouled = nextState.fouls.length > 0;

  // Handle Turn Passing
  let activePlayerPottedOwnGroup = false;

  if (!hasFouled) {
      // Group Assignment on open table
      if (nextState.p1Group === 'unassigned' && pocketedBalls.length > 0 && !currentState.isFirstBreak) {
          const firstPotted = pocketedBalls.find(b => b >= 1 && b <= 15);
          if (firstPotted) {
             const isSolid = firstPotted >= 1 && firstPotted <= 7;
             if (nextState.turn === 'p1') {
                 nextState.p1Group = isSolid ? 'solids' : 'stripes';
                 nextState.p2Group = isSolid ? 'stripes' : 'solids';
                 activePlayerPottedOwnGroup = true;
             } else {
                 nextState.p2Group = isSolid ? 'solids' : 'stripes';
                 nextState.p1Group = isSolid ? 'stripes' : 'solids';
                 activePlayerPottedOwnGroup = true;
             }
             nextState.message = `${nextState.turn} is now ${isSolid ? 'Solids' : 'Stripes'}`;
          }
      } else if (pocketedBalls.length > 0) {
          // Check if active player potted their own ball
          const activeGroup = nextState.turn === 'p1' ? nextState.p1Group : nextState.p2Group;
          activePlayerPottedOwnGroup = pocketedBalls.some(b => {
             const isSolid = b >= 1 && b <= 7;
             return (activeGroup === 'solids' && isSolid) || (activeGroup === 'stripes' && !isSolid);
          });
      }
  }

  if (hasFouled || !activePlayerPottedOwnGroup) {
      // Pass turn
      nextState.turn = nextState.turn === 'p1' ? 'p2' : 'p1';
      nextState.message = hasFouled ? "FOUL! Ball in hand for " + nextState.turn : nextState.turn + "'s turn.";
  } else {
      nextState.message = "Good shot! Keep going.";
  }

  nextState.isFirstBreak = false;
  
  return nextState;
}
