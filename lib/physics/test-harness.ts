import { PhysicsEngine } from "./engine";
import { BallState, BallData } from "./types";
import { PHYSICS } from "../constants";

function runTestHarness() {
    console.log("--- POOLONCHAIN PHYSICS TEST HARNESS ---");
    console.log("Table size:", PHYSICS.TABLE_LENGTH, "x", PHYSICS.TABLE_WIDTH);

    const initialBalls: BallData[] = [
        { id: 0, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, spin: { x: 0, y: 0 }, state: BallState.STATIONARY }, // Cue ball
        { id: 1, position: { x: 1, y: 0 }, velocity: { x: 0, y: 0 }, spin: { x: 0, y: 0 }, state: BallState.STATIONARY }  // Object ball 1
    ];

    const engine = new PhysicsEngine(initialBalls);
    console.log("\nExecuting Shot: Cue Ball hitting Object Ball directly");
    
    // Shoot straight towards the exact center of ball 1
    const result = engine.executeShot({
        angle: 0, // 0 radians (straight along +x)
        power: 5.0, // 5 m/s
        english: { x: 0, y: 0 }
    });

    console.log("Generated Keyframes:", result.keyframes.length);
    if (result.keyframes.length > 0) {
        for (let i = 0; i < Math.min(5, result.keyframes.length); i++) {
            const frame = result.keyframes[i];
            console.log(`[Time: ${frame.time.toFixed(4)}s]`);
            frame.balls.forEach(b => {
                if(b.state !== BallState.STATIONARY) {
                    console.log(`  Ball ${b.id} Pos: (${b.position.x.toFixed(3)}, ${b.position.y.toFixed(3)}) Vel: (${b.velocity.x.toFixed(3)}, ${b.velocity.y.toFixed(3)}) State: ${BallState[b.state]}`);
                }
            });
        }
        if (result.keyframes.length > 5) {
            console.log("...");
            const lastFrame = result.keyframes[result.keyframes.length - 1];
            console.log(`[Time: ${lastFrame.time.toFixed(4)}s] Final Resting State`);
             lastFrame.balls.forEach(b => {
                console.log(`  Ball ${b.id} Pos: (${b.position.x.toFixed(3)}, ${b.position.y.toFixed(3)}) Vel: (${b.velocity.x.toFixed(3)}, ${b.velocity.y.toFixed(3)})`);
            });
        }
    }
}

runTestHarness();
