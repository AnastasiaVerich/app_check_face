export interface Circle {
    cx: number;
    cy: number;
    r: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function isRectangleCoveredByCircle(circle: Circle, rect: Rectangle, threshold = 0.8): boolean {
    const rectArea = rect.width * rect.height;
    const intersectionArea = calculateIntersectionArea(circle, rect);

    // Доля пересечения
    const overlapRatio = intersectionArea / rectArea;

    // Координаты центра прямоугольника
    const rectCenterX = rect.x + rect.width / 2;
    const rectCenterY = rect.y + rect.height / 2;

    // Проверяем, лежит ли центр прямоугольника внутри круга
    const dx = rectCenterX - circle.cx;
    const dy = rectCenterY - circle.cy;
    const distanceSquared = dx * dx + dy * dy;

    const isCenterInsideCircle = distanceSquared <= circle.r * circle.r;
    const smallR=circle.r / 4
    const isCenterWithinSmallRadius = distanceSquared <= (smallR) * (circle.r / 2);

    return overlapRatio >= threshold && isCenterInsideCircle && isCenterWithinSmallRadius;
}

function calculateIntersectionArea(circle: Circle, rect: Rectangle): number {
    const { cx, cy, r } = circle;
    const { x, y, width, height } = rect;

    // Шаг для численного расчета (чем меньше, тем точнее)
    const step = Math.min(width, height) / 100;
    let intersectionArea = 0;

    // Перебираем точки в пределах прямоугольника
    for (let px = x; px <= x + width; px += step) {
        for (let py = y; py <= y + height; py += step) {
            // Проверяем, находится ли точка внутри круга
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy <= r * r) {
                // Точка внутри круга
                intersectionArea += step * step;
            }
        }
    }

    return intersectionArea;
}
