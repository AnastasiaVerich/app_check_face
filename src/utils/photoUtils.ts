// Функция для конвертации строки в формате base64 в объект Blob с заданным типом MIME
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
    // Шаг 1: Удаляем префикс "data:image/jpeg;base64," из строки base64 (если он присутствует)
    const byteString = atob(base64.split(",")[1]);
    // atob() - это встроенная функция JavaScript, которая декодирует строку из формата base64 в обычную строку (ASCII).

    // Шаг 2: Создаем ArrayBuffer для хранения бинарных данных
    const arrayBuffer = new ArrayBuffer(byteString.length); // ArrayBuffer — это объект, представляющий низкоуровневые данные в бинарном формате.
    const uint8Array = new Uint8Array(arrayBuffer); // Uint8Array — это тип данных, представляющий массив 8-битных целых чисел (от 0 до 255).

    // Шаг 3: Заполняем массив uint8Array значениями из строки byteString
    // Каждому символу строки byteString соответствует один байт, который добавляется в массив uint8Array.
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i); // charCodeAt(i) — метод, который возвращает код символа в строке на позиции i.
    }

    // Шаг 4: Создаем объект Blob из массива uint8Array с заданным MIME-типом
    // Blob — это объект, представляющий данные, которые могут быть файлами или другими бинарными данными.
    return new Blob([uint8Array], { type: mimeType });
};
