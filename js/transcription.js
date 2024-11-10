// Obtener las transcripciones almacenadas en localStorage
function getTranscriptions() {
    return JSON.parse(localStorage.getItem("transcriptionsList")) || [];
}

// Obtener una transcripción específica por ID
function getTranscription(id) {
    const transcriptionsList = getTranscriptions();
    return transcriptionsList.find((transcription) => transcription.id === id);
}

// Guardar una nueva transcripción en localStorage
function saveTranscription(name, notes, content, audioPath) {
    const transcriptionsList = getTranscriptions(); // Obtener la lista de transcripciones

    const newTranscription = {
        id: generateUniqueId(), // ID único basado en el timestamp
        name: name,
        notes: notes,
        content: content,
        audioPath: audioPath,
        lastModified: new Date().toLocaleString(),
    };

    transcriptionsList.push(newTranscription); // Agregar la nueva transcripción

    localStorage.setItem("transcriptionsList", JSON.stringify(transcriptionsList)); // Guardar lista actualizada
}

// Actualizar una transcripción existente por ID
function updateTranscription(id, params) {
    
    const transcriptionsList = getTranscriptions();
    const transcription = transcriptionsList.find((t) => t.id === id);

    if (transcription) {
        transcription.name = params.name || transcription.name;
        transcription.notes = params.notes || transcription.notes;
        transcription.content = params.content || transcription.content;
        transcription.audioPath = params.audioPath || transcription.audioPath;
        transcription.lastModified = new Date().toLocaleString();

        localStorage.setItem("transcriptionsList", JSON.stringify(transcriptionsList)); // Guardar lista actualizada
        listTranscriptions(); // Actualizar la UI
    } else {
        console.error("Transcripción no encontrada para actualizar.");
    }
}

// Eliminar una transcripción por ID
function deleteTranscription(id) {
    let transcriptionsList = getTranscriptions();
    const transcriptionIndex = transcriptionsList.findIndex((transcription) => transcription.id === id);

    if (transcriptionIndex !== -1) {
        transcriptionsList.splice(transcriptionIndex, 1); // Eliminar la transcripción
        localStorage.setItem("transcriptionsList", JSON.stringify(transcriptionsList)); // Guardar lista actualizada

        listTranscriptions(); // Actualizar la UI
        clearTranscription(); // Limpiar detalles de la transcripción cargada
    } else {
        console.error("Transcripción no encontrada para eliminar.");
    }
}

// Función para generar un ID único (timestamp)
function generateUniqueId() {
    return "transcription_" + Date.now(); // Genera un ID único basado en el timestamp
}
