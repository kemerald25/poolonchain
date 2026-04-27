import { BallData, ShotInput, PhysicsResult, BallState, CollisionEvent, Keyframe } from "./types";
import { timeToBallCollision, timeToCushionCollision, resolveBallCollision, resolveCushionCollision } from "./events";
import { PHYSICS } from "../constants";

export class PhysicsEngine {
  private balls: BallData[];

  constructor(initialBalls: BallData[]) {
    this.balls = initialBalls.map(b => ({ ...b }));
  }

  /**
   * Executes a shot simulation and returns the deterministic keyframes and result
   */
  public executeShot(input: ShotInput): PhysicsResult {
    // 1. Initial State Setup based on cue ball impact
    this.applyCueStrike(input);

    let keyframes: Keyframe[] = [];
    let currentTime = 0;
    
    // Save initial frame
    keyframes.push(this.snapshot(currentTime));

    // 2. Event Loop Simulation
    let simulationActive = true;
    const maxIterations = 1000;
    let iterations = 0;

    while (simulationActive && iterations++ < maxIterations) {
      // Find the next collision or state transition event
      const nextEvent = this.findNextEvent();
      
      if (!nextEvent) {
        // No future events, balls will slow to a halt
        // Fast forward to stationary state for all moving balls
        this.advanceToRest(currentTime, keyframes);
        simulationActive = false;
        break;
      }

      // Advance time and update positions to the event time
      const timeDelta = nextEvent.time - currentTime;
      this.advanceTime(timeDelta);
      currentTime = nextEvent.time;

      // Resolve the event (update velocities/spin/state)
      this.resolveEvent(nextEvent);

      // Snapshot the state after resolving the event
      keyframes.push(this.snapshot(currentTime));
    }

    return {
      keyframes,
      pocketedBalls: this.balls.filter(b => b.state === BallState.POCKETED).map(b => b.id),
      firstContactId: null, // TODO
      cushionContacts: 0 // TODO
    };
  }

  private applyCueStrike(input: ShotInput) {
    // Math to convert angle, power, and english (spin) into initial velocity and spin on the cue ball
    const cueBall = this.balls.find(b => b.id === 0);
    if (!cueBall) return;
    
    // Simplified placeholder application
    cueBall.velocity = {
      x: Math.cos(input.angle) * input.power,
      y: Math.sin(input.angle) * input.power
    };
    cueBall.spin = { ...input.english };
    cueBall.state = BallState.SLIDING;
  }

  private findNextEvent(): CollisionEvent | null {
    let minTime = Infinity;
    let nextEvent: CollisionEvent | null = null;
    let eventData: any = null;

    // 1. Ball-Ball Collisions
    for (let i = 0; i < this.balls.length; i++) {
        const b1 = this.balls[i];
        if (b1.state === BallState.POCKETED || b1.state === BallState.STATIONARY) continue;
        
        for (let j = i + 1; j < this.balls.length; j++) {
            const b2 = this.balls[j];
            if (b2.state === BallState.POCKETED) continue;
            if (b1.velocity.x === 0 && b1.velocity.y === 0 && b2.velocity.x === 0 && b2.velocity.y === 0) continue;

            const t = timeToBallCollision(b1, b2);
            if (t !== null && t < minTime) {
                minTime = t;
                nextEvent = { time: this.getCurrentTime() + t, type: 'ball-ball', ballIds: [b1.id, b2.id] };
            }
        }
    }

    // 2. Ball-Cushion Collisions
    for (let i = 0; i < this.balls.length; i++) {
        const b = this.balls[i];
        if (b.state === BallState.POCKETED || (Math.abs(b.velocity.x) < 1e-4 && Math.abs(b.velocity.y) < 1e-4)) continue;
        
        const { time: t, axis } = timeToCushionCollision(b);
        if (t !== null && t < minTime) {
            minTime = t;
            nextEvent = { time: this.getCurrentTime() + t, type: 'ball-cushion', ballIds: [b.id] };
            eventData = { axis }; // Store the axis (x or y rail) temporarily
        }
    }

    // 3. State transitions (ball slowing to a stop)
    // Approximate: check if a ball will stop soon due to friction
    for (let i = 0; i < this.balls.length; i++) {
        const b = this.balls[i];
        if (b.state === BallState.POCKETED || b.state === BallState.STATIONARY) continue;
        
        const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
        if (speed > 0) {
            // Deceleration = MU_R * g (rolling friction)
            const decel = PHYSICS.MU_R * PHYSICS.GRAVITY;
            const timeToStop = speed / decel;
            if (timeToStop < minTime) {
                minTime = timeToStop;
                nextEvent = { time: this.getCurrentTime() + timeToStop, type: 'state-transition', ballIds: [b.id] };
            }
        }
    }

    if (nextEvent) {
        (nextEvent as any).data = eventData;
    }
    return nextEvent;
  }

  // Helper just returns current relative time based on how much has passed 
  private _currentTime = 0;
  private getCurrentTime() { return this._currentTime; }

  private advanceTime(delta: number) {
    this._currentTime += delta;
    this.balls.forEach(b => {
      if (b.state === BallState.POCKETED || b.state === BallState.STATIONARY) return;
      
      b.position.x += b.velocity.x * delta;
      b.position.y += b.velocity.y * delta;
      
      const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
      if (speed > 0) {
          const decel = PHYSICS.MU_R * PHYSICS.GRAVITY;
          const speedDrop = decel * delta;
          if (speedDrop >= speed) {
              b.velocity.x = 0;
              b.velocity.y = 0;
              b.state = BallState.STATIONARY;
          } else {
              const r = 1 - speedDrop / speed;
              b.velocity.x *= r;
              b.velocity.y *= r;
          }
      }
    });
  }

  private resolveEvent(event: CollisionEvent) {
    if (event.type === 'ball-ball') {
        const [id1, id2] = event.ballIds;
        const b1 = this.balls.find(b => b.id === id1)!;
        const b2 = this.balls.find(b => b.id === id2)!;
        resolveBallCollision(b1, b2);
        
        // Wake up stationary ball
        if (b1.state === BallState.STATIONARY) b1.state = BallState.ROLLING;
        if (b2.state === BallState.STATIONARY) b2.state = BallState.ROLLING;
    } 
    else if (event.type === 'ball-cushion') {
        const b = this.balls.find(b => b.id === event.ballIds[0])!;
        const axis = (event as any).data.axis;
        resolveCushionCollision(b, axis);
    }
    else if (event.type === 'state-transition') {
        const b = this.balls.find(b => b.id === event.ballIds[0])!;
        b.state = BallState.STATIONARY;
        b.velocity = { x: 0, y: 0 };
    }
  }

  private advanceToRest(currentTime: number, keyframes: Keyframe[]) {
    // Placeholder to immediately stop balls
    this.balls.forEach(b => {
      b.velocity = { x: 0, y: 0 };
      b.state = BallState.STATIONARY;
    });
    keyframes.push(this.snapshot(currentTime + 1.0));
  }

  private snapshot(time: number): Keyframe {
    return {
      time,
      balls: this.balls.map(b => ({ ...b }))
    };
  }
}
