// Obtener los elementos del formulario y del botón
const modal = document.getElementById("transcriptionModal");
const cancelButton = document.getElementById("cancelModal");
const saveButton = document.getElementById("saveModal");
const formNameInput = document.getElementById("form-name");
const formNotesInput = document.getElementById("form-notes");
const formContentInput = document.getElementById("form-content");
const formUrlInput = document.getElementById("form-url");
const formFileInput = document.getElementById("form-file");
const audioElement = document.getElementById("transcription-audio");

// Lista de transcripciones
const transcriptionsListGroup = document.getElementById("transcriptions-list");

// Datos de la transcripción
const transcriptionTitle = document.getElementById("transcription-title");
const transcriptionId = document.getElementById("transcription-id");
const transcriptionContent = document.getElementById("transcription-content");
const transcriptionNotes = document.getElementById("transcription-notes");
const transcriptionAudio = document.getElementById("transcription-audio");

// Controles personalizados
const rewindButton = document.getElementById("rewind");
const forwardButton = document.getElementById("forward");
const speedSelect = document.getElementById("speed");

document.addEventListener("DOMContentLoaded", function () {
    listTranscriptions();
});

rewindButton.addEventListener("click", function () {
    audioElement.currentTime = Math.max(0, audioElement.currentTime - 5);
});

forwardButton.addEventListener("click", function () {
    audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 5);
});

speedSelect.addEventListener("change", function () {
    audioElement.playbackRate = speedSelect.value;
});

transcriptionContent.addEventListener("input", function () {
    if (transcriptionId.value !== null) {
        const timestamp = audioElement.currentTime.toFixed(2); // Tiempo actual del audio
        const updatedContent = transcriptionContent.value.trim();
        const fullContent = transcriptionContent.value.trim(); // Contenido completo
        const cursorPosition = transcriptionContent.selectionStart; // Posición del cursor
        const wordsBeforeCursor = 10; // Cantidad de palabras antes del cursor

        // Obtener las palabras anteriores y posteriores al cursor
        const words = fullContent.split(/\s+/); // Dividir en palabras
        const index = fullContent.slice(0, cursorPosition).split(/\s+/).length - 1; // Índice de la palabra actual

        // Determinar el rango de palabras relevantes
        const start = Math.max(0, index - wordsBeforeCursor);
        const end = Math.min(words.length, index + 1); // Incluir la palabra actual
        const context = words.slice(start, end).join(" "); // Obtener el contexto
        updateTranscription(transcriptionId.value, {
            content: transcriptionContent.value,
            history: {
                timestamp: timestamp, // Tiempo en que ocurrió el cambio
                content: context, // Nuevo contenido
            },
        });
    }
});

transcriptionNotes.addEventListener("input", function () {
    if (transcriptionId.value !== null) {
        updateTranscription(transcriptionId.value, { notes: transcriptionNotes.value });
    }
});

window.onbeforeunload = function () {
    if (transcriptionId.value !== null) {
        updateTranscription(transcriptionId.value, { content: transcriptionContent.value });
        updateTranscription(transcriptionId.value, { notes: transcriptionNotes.value });
    }
};

window.onload = function () {
    const savedTranscription = localStorage.getItem("lastTranscriptionId");

    if (savedTranscription) {
        loadTranscription(savedTranscription);
    }
};
// Función para verificar que el campo esté lleno
saveButton.addEventListener("click", function (event) {
    // Prevenir el comportamiento por defecto del botón (si es necesario)
    event.preventDefault();

    var transcriptionName = formNameInput.value.trim();
    var transcriptionContent = formContentInput.value.trim();
    var transcriptionNotes = formNotesInput.value.trim();
    var audioPath = "";

    // Validación: Asegurarse de que el nombre y el archivo/audio estén presentes
    if (transcriptionName === "") {
        formNameInput.classList.add("is-invalid");
        return;
    } else {
        formNameInput.classList.remove("is-invalid");
    }

    if (formUrlInput.value !== "") {
        audioPath = formUrlInput.value;
    } else {
        // Verificar si un archivo ha sido seleccionado
        if (formFileInput.files.length === 0) {
            formFileInput.classList.add("is-invalid");
            return;
        }

        // Obtener la ruta del archivo seleccionado (solo disponible en el navegador)
        const file = formFileInput.files[0];
        const fileURL = URL.createObjectURL(file); // Crear una URL temporal del archivo
        audioPath = fileURL;
    }

    // Guardar transcripción
    saveTranscription(transcriptionName, transcriptionNotes, transcriptionContent, audioPath);
    clearForm();
    listTranscriptions();
    // Cerrar el modal de Bootstrap
    cancelButton.click();
});

function clearForm() {
    formNameInput.value = "";
    formNotesInput.value = "";
    formContentInput.value = "";
    formUrlInput.value = "";
    formFileInput.value = "";
}

function generateUniqueId() {
    return "transcription_" + Date.now(); // Genera un ID único basado en el timestamp
}

function listTranscriptions() {
    const transcriptionsList = getTranscriptions();
    transcriptionsListGroup.innerHTML = ""; // Limpiar la lista antes de añadir elementos
    transcriptionsList.forEach((transcription) => {
        const listItem = document.createElement("a");
        listItem.classList.add("list-group-item", "list-group-item-action", "d-flex", "gap-3", "py-3");
        if (transcriptionId.value === transcription.id) {
            listItem.classList.add("active");
        }
        listItem.setAttribute("aria-current", "true");

        listItem.innerHTML = `
            <img src="https://github.com/twbs.png" alt="${transcription.name}" width="32" height="32" class="rounded-circle flex-shrink-0" />
            <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <h6 class="mb-0">${transcription.name}</h6>
                    <p class="mb-0 opacity-75">${transcription.lastModified || "N/A"}</p>
                </div>
            </div>
            <div class="d-flex flex-column gap-2">
                <button class="btn btn-primary btn-sm load-btn">Cargar</button>
                <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                <button class="btn btn-success btn-sm history-btn" data-bs-toggle="modal" data-bs-target="#historyModal">Historial</button>
            </div>
        `;

        // Añadir evento para el botón de "Cargar"
        listItem.querySelector(".load-btn").addEventListener("click", () => {
            loadTranscription(transcription.id);
        });

        // Añadir evento para el botón de "Eliminar"
        listItem.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm("¿Estás seguro de que deseas eliminar esta transcripción?")) {
                deleteTranscription(transcription.id);
            }
        });

        listItem.querySelector(".history-btn").addEventListener("click", () => {
            // Llamar a la función showHistoryModal y pasarle el ID de la transcripción
            showHistoryModal(transcription.id);
        });

        transcriptionsListGroup.appendChild(listItem);
    });
}

function loadTranscription(id) {
    // Obtener la transcripción con el ID especificado
    const transcription = getTranscription(id);

    if (transcription) {
        // Crear en local storage el ultimo id de la transcripcion cargada
        localStorage.setItem("lastTranscriptionId", id);

        transcriptionTitle.textContent = transcription.name;
        transcriptionId.value = transcription.id;
        transcriptionContent.value = transcription.content;
        transcriptionNotes.value = transcription.notes;
        transcriptionAudio.src = transcription.audioPath;
    } else {
        clearTranscription();
    }
    listTranscriptions();
}

function clearTranscription() {
    transcriptionTitle.textContent = "";
    transcriptionId.value = null;
    transcriptionContent.value = "";
    transcriptionNotes.value = "";
    transcriptionAudio.src = "";
}
const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
const historyList = document.getElementById("historyList");

// Mostrar el modal de historial
function showHistoryModal(id) {
    const transcription = getTranscription(id);
    
    if (!transcription || !transcription.history || transcription.history.length === 0) {
        // Si no hay historial, mostrar un mensaje adecuado
        document.getElementById("history-list").innerHTML = "<p>No hay historial para esta transcripción.</p>";
        return;
    }

    // Limpiar la lista de historial
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    // Recorrer el historial de la transcripción y agregar los elementos al modal
    transcription.history.reverse().forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "gap-3", "py-2");
        const formattedTime = formatTime(entry.timestamp);
        listItem.innerHTML = `
            <div>
                <p class="mb-0">Cambio: ${entry.content}</p>
                <small>Tiempo: ${formattedTime} segundos</small>
            </div>
        `;

        historyList.appendChild(listItem);
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600); // Calcular las horas
    const minutes = Math.floor((seconds % 3600) / 60); // Calcular los minutos
    const remainingSeconds = Math.floor(seconds % 60); // Calcular los segundos restantes

    // Formatear el tiempo como hh:mm:ss
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}