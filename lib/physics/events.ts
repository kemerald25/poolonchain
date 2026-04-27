import { BallData } from "./types";
import { PHYSICS } from "../constants";

export function timeToBallCollision(b1: BallData, b2: BallData): number | null {
    const dx = b1.position.x - b2.position.x;
    const dy = b1.position.y - b2.position.y;
    const dvx = b1.velocity.x - b2.velocity.x;
    const dvy = b1.velocity.y - b2.velocity.y;

    const a = dvx * dvx + dvy * dvy;
    if (a < 1e-8) return null; // Parallel/identical velocities

    const b = 2 * (dx * dvx + dy * dvy);
    const c = dx * dx + dy * dy - 4 * PHYSICS.BALL_RADIUS * PHYSICS.BALL_RADIUS;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t > 0.0001) return t;
    return null;
}

export function timeToCushionCollision(b: BallData): { time: number | null, axis: 'x' | 'y' | undefined } {
    let tx = null;
    let ty = null;

    // Assuming origin (0,0) is center of table
    const halfLen = PHYSICS.TABLE_LENGTH / 2;
    const halfWid = PHYSICS.TABLE_WIDTH / 2;

    if (b.velocity.x > 1e-5) {
        tx = (halfLen - PHYSICS.BALL_RADIUS - b.position.x) / b.velocity.x;
    } else if (b.velocity.x < -1e-5) {
        tx = (-halfLen + PHYSICS.BALL_RADIUS - b.position.x) / b.velocity.x;
    }

    if (b.velocity.y > 1e-5) {
        ty = (halfWid - PHYSICS.BALL_RADIUS - b.position.y) / b.velocity.y;
    } else if (b.velocity.y < -1e-5) {
        ty = (-halfWid + PHYSICS.BALL_RADIUS - b.position.y) / b.velocity.y;
    }

    if (tx !== null && tx > 0.0001 && (ty === null || tx < ty)) {
        return { time: tx, axis: 'x' };
    } else if (ty !== null && ty > 0.0001) {
        return { time: ty, axis: 'y' };
    }

    return { time: null, axis: undefined };
}

export function resolveBallCollision(b1: BallData, b2: BallData) {
    const dx = b1.position.x - b2.position.x;
    const dy = b1.position.y - b2.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Normal vector
    const nx = dx / dist;
    const ny = dy / dist;
    
    // Tangent vector
    const tx = -ny;
    const ty = nx;
    
    // Dot product tangent
    const dpTan1 = b1.velocity.x * tx + b1.velocity.y * ty;
    const dpTan2 = b2.velocity.x * tx + b2.velocity.y * ty;
    
    // Dot product normal
    const dpNorm1 = b1.velocity.x * nx + b1.velocity.y * ny;
    const dpNorm2 = b2.velocity.x * nx + b2.velocity.y * ny;
    
    // Conservation of momentum in 1D (normal direction)
    const m1 = PHYSICS.BALL_MASS;
    const m2 = PHYSICS.BALL_MASS;
    
    // Applying coefficient of restitution
    const cor = PHYSICS.COR_BALL_BALL;
    const v1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2) * cor;
    const v2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2) * cor;

    b1.velocity.x = tx * dpTan1 + nx * v1;
    b1.velocity.y = ty * dpTan1 + ny * v1;
    
    b2.velocity.x = tx * dpTan2 + nx * v2;
    b2.velocity.y = ty * dpTan2 + ny * v2;
}

export function resolveCushionCollision(b: BallData, axis: 'x' | 'y') {
    if (axis === 'x') {
        b.velocity.x *= -PHYSICS.COR_CUSHION;
    } else if (axis === 'y') {
        b.velocity.y *= -PHYSICS.COR_CUSHION;
    }
}
