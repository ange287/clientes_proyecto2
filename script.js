import json from "./object.js";

document.addEventListener('DOMContentLoaded', () => {
    const pendingTasksList = document.getElementById('pending-tasks');
    const completedTasksList = document.getElementById('completed-tasks');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const toggleInputButton = document.getElementById('toggle-input');
    const searchButton = document.getElementById('search-button');
    const resetViewButton = document.getElementById('reset-view');

    let tasks = [];
    let filteredTasks = null; // Almacena las tareas filtradas

    // Mostrar/ocultar el input y el botón de agregar
    toggleInputButton.addEventListener('click', () => {
        newTaskInput.classList.toggle('visible');
        addTaskButton.classList.toggle('visible');
        if (newTaskInput.classList.contains('visible')) {
            newTaskInput.focus();
        }
    });

    // Cargar tareas iniciales desde la API
    async function loadInitialTasks() {
        try {
            if (!navigator.onLine) {
                throw new Error('No hay conexión a Internet');
            }

            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            const data = await response.json();
            tasks = data;
            renderTasks();
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
            tasks = json; // Cargar tareas iniciales desde un archivo JSON local
            renderTasks();
        }
    }

    // Renderizar tareas en la interfaz
    function renderTasks() {
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        const tasksToRender = filteredTasks || tasks; // Usar tareas filtradas o todas

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            if (task.completed) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id)); // Cambiar estado

            const taskText = document.createElement('span');
            taskText.textContent = `ID: ${task.id} - ${task.title}`; // Mostrar ID y título

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(deleteButton);

            if (task.completed) {
                completedTasksList.appendChild(li);
            } else {
                pendingTasksList.appendChild(li);
            }
        });
    }

    // Agregar una nueva tarea
    function addTask() {
        const title = newTaskInput.value.trim();
        if (title) {
            const lastId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) : 0;
            const newTask = {
                id: lastId + 1,
                title,
                completed: false
            };
            tasks.push(newTask);
            renderTasks();
            newTaskInput.value = '';
            newTaskInput.classList.remove('visible');
            addTaskButton.classList.remove('visible');
            alert('Tarea agregada con éxito');
        } else {
            alert('Por favor, ingresa un título para la tarea');
        }
    }

    // Eliminar una tarea
    function deleteTask(id) {
        const confirmDelete = confirm(`¿Estás seguro de eliminar la tarea con ID ${id}?`);
        if (confirmDelete) {
            tasks = tasks.filter(task => task.id !== id); // Eliminar de la lista principal

            if (filteredTasks) {
                // Si estamos en modo de búsqueda, eliminar también de la lista filtrada
                filteredTasks = filteredTasks.filter(task => task.id !== id);
            }

            renderTasks(); // Volver a renderizar las tareas
            alert('Tarea eliminada con éxito');
        } else {
            alert('Eliminación cancelada');
        }
    }

    // Cambiar el estado de una tarea (completada/pendiente)
    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed }; // Cambiar estado
            }
            return task;
        });

        // Si hay tareas filtradas, actualizar también su estado
        if (filteredTasks) {
            filteredTasks = filteredTasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
        }

        renderTasks(); // Volver a renderizar las tareas
    }

    // Buscar tareas por nombre o ID
    function searchTask() {
        const searchType = prompt('¿Deseas buscar por nombre o por ID?\n1. Nombre\n2. ID');

        if (searchType === '1') {
            const searchTerm = prompt('Ingresa el nombre de la tarea a buscar:').toLowerCase();
            filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm));
            if (filteredTasks.length > 0) {
                renderTasks();
                resetViewButton.style.display = 'inline-block'; // Mostrar botón de restablecer
            } else {
                alert('No se encontraron tareas con ese nombre.');
            }
        } else if (searchType === '2') {
            const searchId = parseInt(prompt('Ingresa el ID de la tarea a buscar:'));
            filteredTasks = tasks.filter(task => task.id === searchId);
            if (filteredTasks.length > 0) {
                renderTasks();
                resetViewButton.style.display = 'inline-block'; // Mostrar botón de restablecer
            } else {
                alert('No se encontró ninguna tarea con ese ID.');
            }
        } else {
            alert('Opción no válida. Debes escribir 1 o 2.');
        }
    }

    // Restablecer la vista para mostrar todas las tareas
    function resetView() {
        filteredTasks = null; // Limpiar el filtro
        renderTasks();
        resetViewButton.style.display = 'none'; // Ocultar botón de restablecer
    }

    // Event listeners
    addTaskButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event listener para el botón de búsqueda
    searchButton.addEventListener('click', searchTask);

    // Event listener para el botón de restablecer
    resetViewButton.addEventListener('click', resetView);

    // Cargar tareas iniciales al iniciar la aplicación
    loadInitialTasks();
});