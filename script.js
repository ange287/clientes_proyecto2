import json from "./object.js";

document.addEventListener('DOMContentLoaded', () => {
    const pendingTasksList = document.getElementById('pending-tasks');
    const completedTasksList = document.getElementById('completed-tasks');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const toggleInputButton = document.getElementById('toggle-input');

    let tasks = [];

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
            // Aquí puedes decidir si cargar las tareas desde el JSON local o mostrar un mensaje de error
            tasks = json; // Cargar tareas iniciales desde un archivo JSON local
            renderTasks();
        }
    }

    // Renderizar tareas en la interfaz
    function renderTasks() {
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            if (task.completed) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

            const taskText = document.createElement('span');
            taskText.textContent = task.title;

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
            const newTask = {
                id: Date.now(),
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
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
        alert('Tarea eliminada con éxito');
    }

    // Cambiar el estado de una tarea (completada/pendiente)
    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        renderTasks();
    }

    // Event listeners
    addTaskButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Cargar tareas iniciales al iniciar la aplicación
    loadInitialTasks();
});