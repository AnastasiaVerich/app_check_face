export interface Circle {
    cx: number; // Координата X центра круга
    cy: number; // Координата Y центра круга
    r: number;  // Радиус круга
}

export interface Rectangle {
    x: number;     // Координата X верхнего левого угла прямоугольника
    y: number;     // Координата Y верхнего левого угла прямоугольника
    width: number; // Ширина прямоугольника
    height: number; // Высота прямоугольника
}

// Функция для проверки, перекрывает ли прямоугольник круг, с учетом порогового значения (threshold)
export function isRectangleCoveredByCircle(circle: Circle, rect: Rectangle, threshold = 0.8): boolean {

    // Вычисляем площадь прямоугольника
    const rectArea = rect.width * rect.height;

    // Вычисляем площадь пересечения прямоугольника и круга
    const intersectionArea = calculateIntersectionArea(circle, rect);

    // Рассчитываем долю пересекающейся площади (отношение площади пересечения к площади прямоугольника)
    const overlapRatio = intersectionArea / rectArea;

    // Координаты центра прямоугольника
    const rectCenterX = rect.x + rect.width / 2; // Центр прямоугольника по оси X
    const rectCenterY = rect.y + rect.height / 2; // Центр прямоугольника по оси Y

    // Проверяем, находится ли центр прямоугольника внутри круга
    const dx = rectCenterX - circle.cx; // Расстояние по оси X от центра прямоугольника до центра круга
    const dy = rectCenterY - circle.cy; // Расстояние по оси Y от центра прямоугольника до центра круга
    const distanceSquared = dx * dx + dy * dy; // Квадрат расстояния между центрами прямоугольника и круга

    // Проверка, лежит ли центр прямоугольника внутри круга (по формуле расстояния между точками)
    const isCenterInsideCircle = distanceSquared <= circle.r * circle.r;

    // Проверка, лежит ли центр прямоугольника в пределах маленького радиуса (для дополнительной проверки)
    const smallR = circle.r / 4; // Маленький радиус (четверть от радиуса круга)
    const isCenterWithinSmallRadius = distanceSquared <= (smallR) * (circle.r / 2); // Проверяем, лежит ли центр внутри маленького круга

    // Возвращаем true, если доля пересечения больше порогового значения, центр прямоугольника внутри круга
    // и центр прямоугольника находится в пределах маленького радиуса
    return overlapRatio >= threshold && isCenterInsideCircle && isCenterWithinSmallRadius;
}

// Функция для вычисления площади пересечения круга и прямоугольника
function calculateIntersectionArea(circle: Circle, rect: Rectangle): number {
    const { cx, cy, r } = circle; // Извлекаем параметры круга
    const { x, y, width, height } = rect; // Извлекаем параметры прямоугольника

    // Шаг для численного расчета площади пересечения (меньший шаг - более точный расчет)
    const step = Math.min(width, height) / 100;
    let intersectionArea = 0;// Переменная для хранения площади пересечения

    // Перебираем все точки внутри прямоугольника с шагом step по осям X и Y
    for (let px = x; px <= x + width; px += step) {
        for (let py = y; py <= y + height; py += step) {
            // Проверяем, находится ли точка внутри круга
            const dx = px - cx; // Расстояние по оси X от точки до центра круга
            const dy = py - cy; // Расстояние по оси Y от точки до центра круга
            if (dx * dx + dy * dy <= r * r) {
                // Если точка лежит внутри круга, увеличиваем площадь пересечения
                intersectionArea += step * step; // Добавляем площадь соответствующего квадрата
            }
        }
    }
    // Возвращаем вычисленную площадь пересечения
    return intersectionArea;
}
