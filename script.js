
/* =========================================
   1. CONFIGURAÇÃO DO SUPABASE
========================================= */

// Coloque aqui as credenciais do seu projeto Supabase.

const SUPABASE_URL = "https://gbtvrtjvsbssskcdrxpn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iAIRoWYmApPzKcBXwIBRDA_sHY62kqo";

// Inicializando o cliente Supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================
   2. ELEMENTOS DO HTML
========================================= */

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const submitButton = document.getElementById("submit-button");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const message = document.getElementById("message");


/* =========================================
   3. MENSAGENS AO USUÁRIO
========================================= */

function showMessage(text, type = "") {

    message.textContent = text;

    message.className = "message";

    if (type) {
        message.classList.add(type);
    }

}


/* =========================================
   4. RENDERIZAR TAREFA
========================================= */

function renderTask(task) {

    // Cria um elemento <li>
    const li = document.createElement("li");

    li.classList.add("task-item");

    // textContent impede que o conteúdo seja interpretado como HTML
    li.textContent = task.title;

    // Adiciona a tarefa no início da lista
    taskList.prepend(li);

    updateTaskCount();

}


/* =========================================
   5. ATUALIZAR CONTADOR
========================================= */

function updateTaskCount() {

    const total = taskList.querySelectorAll(".task-item").length;

    taskCount.textContent =
        `${total} ${total === 1 ? "tarefa" : "tarefas"}`;

}


/* =========================================
   6. BUSCAR TAREFAS NO SUPABASE
========================================= */

async function loadTasks() {

    taskList.innerHTML = `
        <li class="empty-state">Carregando tarefas...</li>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("tasks")
            .select("id, title, created_at")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        taskList.innerHTML = "";

        if (!data || data.length === 0) {

            taskList.innerHTML = `
                <li class="empty-state">
                    Nenhuma tarefa cadastrada ainda.
                </li>
            `;

            updateTaskCount();

            return;
        }

        // Renderiza todas as tarefas encontradas
        data.forEach(task => {
            renderTask(task);
        });

    } catch (error) {

        console.error("Erro ao carregar tarefas:", error);

        taskList.innerHTML = `
            <li class="empty-state">
                Não foi possível carregar as tarefas.
                Verifique sua conexão e tente recarregar a página.
            </li>
        `;

        updateTaskCount();

    }

}


/* =========================================
   7. ADICIONAR NOVA TAREFA
========================================= */

async function addTask(event) {

    // Impede o recarregamento da página
    event.preventDefault();

    // Remove espaços no início e no final
    const title = taskInput.value.trim();

    // Validação
    if (!title) {

        showMessage("Digite uma tarefa antes de adicionar.", "error");

        taskInput.focus();

        return;
    }

    // Evita envios duplicados
    submitButton.disabled = true;

    submitButton.textContent = "Salvando...";

    showMessage("");

    try {

        // Inserção no banco de dados
        const { data, error } = await supabaseClient
            .from("tasks")
            .insert([
                {
                    title: title
                }
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Renderiza somente depois da confirmação do Supabase
        renderTask(data);

        // Limpa o campo
        taskInput.value = "";

        taskInput.focus();

        showMessage("Tarefa adicionada com sucesso!", "success");

    } catch (error) {

        console.error("Erro ao adicionar tarefa:", error);

        showMessage(
            "Não foi possível salvar a tarefa. Verifique sua conexão e tente novamente.",
            "error"
        );

    } finally {

        // Reativa o botão mesmo se ocorrer um erro
        submitButton.disabled = false;

        submitButton.textContent = "Adicionar";

    }

}


/* =========================================
   8. EVENTOS
========================================= */

// Evento de envio do formulário
taskForm.addEventListener("submit", addTask);


/* =========================================
   9. INICIALIZAÇÃO
========================================= */

// Carrega as tarefas assim que a página abre
loadTasks();
