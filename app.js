import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyDwk0BsboOrQs27Kk06QOxxcdwfmtj2Mgs",
    authDomain: "obrantis-facturacion-clientes.firebaseapp.com",
    projectId: "obrantis-facturacion-clientes",
    storageBucket: "obrantis-facturacion-clientes.firebasestorage.app",
    messagingSenderId: "963442674603",
    appId: "1:963442674603:web:1a06582acb9857cf7aa0ee"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const clientsCollection = collection(db, "clients");
const projectsCol = collection(db, "projects");
const invoicesCol = collection(db, "invoices");
async function fetchProjectsFromFirestore() {
  try {
    const snapshot = await getDocs(projectsCol);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("Error cargando obras desde Firestore:", error);
    return [];
  }
}
async function saveProjectToFirestore(projectData) {
  try {
    const projectId = projectData.id || generateProjectId();

    await setDoc(doc(db, "projects", projectId), {
      ...projectData,
      id: projectId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return projectId;
  } catch (error) {
    console.error("Error guardando obra en Firestore:", error);
    throw error;
  }
}
async function deleteProjectFromFirestore(projectId) {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error("Error eliminando obra en Firestore:", error);
    throw error;
  }
}
async function fetchInvoicesFromFirestore() {
  try {
    const snapshot = await getDocs(invoicesCol);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    } catch (error) {
    console.error("Error guardando factura en Firestore:", error);
    alert("Error Firestore facturas: " + (error.message || error));
    throw error;
  }
}

async function saveInvoiceToFirestore(invoiceData) {
  try {
    const invoiceId = invoiceData.id || ("INV-" + Date.now() + "-" + Math.floor(Math.random() * 1000));

    await setDoc(doc(db, "invoices", invoiceId), {
      ...invoiceData,
      id: invoiceId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return invoiceId;
  } catch (error) {
    console.error("Error guardando factura en Firestore:", error);
    throw error;
  }
}

async function deleteInvoiceFromFirestore(invoiceId) {
  try {
    await deleteDoc(doc(db, "invoices", invoiceId));
  } catch (error) {
    console.error("Error eliminando factura en Firestore:", error);
    throw error;
  }
}
async function loadInvoicesFromFirestore() {
  try {
    invoices = await fetchInvoicesFromFirestore();
    renderInvoicesTable();
    refreshNextInvoiceNumber();
  } catch (error) {
    console.error("Error cargando listado de facturas:", error);
    invoices = [];
    renderInvoicesTable();
    refreshNextInvoiceNumber();
  }
}
const menuButtons = document.querySelectorAll(".menu-btn");
const views = document.querySelectorAll(".view");
const viewTitle = document.getElementById("viewTitle");
const viewSubtitle = document.getElementById("viewSubtitle");

const viewConfig = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Resumen general de facturación emitida"
  },
  clients: {
    title: "Clientes",
    subtitle: "Gestión de clientes y consulta de historial"
  },
  projects: {
    title: "Obras",
    subtitle: "Control de obras y trabajos asociados a clientes"
  },
  invoices: {
    title: "Facturas",
    subtitle: "Emisión, seguimiento de cobro e impresión"
  },
  reports: {
    title: "Informes",
    subtitle: "Análisis mensual, trimestral y anual"
  },
  settings: {
    title: "Configuración",
    subtitle: "Ajustes generales de la aplicación"
  }
};
const OBRANTIS_COMPANY = {
  name: "OBRANTIS S.L.",
  subtitle: "Reformas y Construcción",
  nif: "B26636761",
  address1: "Avda. Castilla-La Mancha, 22",
  address2: "45200 – Illescas – Toledo",
  email: "contacto@obrantis.com"
};

const OBRANTIS_BANK = {
  iban: "ES6500490456942910764001"
};

const OBRANTIS_LOGO_URL = "./logo-obrantis.png";

let obrantisLogoDataUrl = null;

function getInvoicePaymentMethodText(invoice) {
  return String(
    invoice?.paymentMethod ||
    invoice?.paymentType ||
    invoice?.paymentForm ||
    "-"
  ).trim() || "-";
}
menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.view;

    menuButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    views.forEach((view) => view.classList.remove("active"));

    const selectedView = document.getElementById(`view-${targetView}`);
    if (selectedView) {
      selectedView.classList.add("active");
    }

    if (viewConfig[targetView]) {
      viewTitle.textContent = viewConfig[targetView].title;
      viewSubtitle.textContent = viewConfig[targetView].subtitle;
    }
  });
});
let clients = [];
let editingClientId = null;

const clientForm = document.getElementById("clientForm");
const clientIdInput = document.getElementById("clientId");
const clientNameInput = document.getElementById("clientName");
const clientTaxIdInput = document.getElementById("clientTaxId");
const clientAddressInput = document.getElementById("clientAddress");
const clientCityInput = document.getElementById("clientCity");
const clientProvinceInput = document.getElementById("clientProvince");
const clientPostalCodeInput = document.getElementById("clientPostalCode");
const clientPhoneInput = document.getElementById("clientPhone");
const clientEmailInput = document.getElementById("clientEmail");
const clientContactPersonInput = document.getElementById("clientContactPerson");
const clientNotesInput = document.getElementById("clientNotes");
const clientIsActiveInput = document.getElementById("clientIsActive");
const clientsTableBody = document.getElementById("clientsTableBody");
const clientSearchInput = document.getElementById("clientSearch");
const btnCancelClientEdit = document.getElementById("btnCancelClientEdit");
const btnShowClientForm = document.getElementById("btnShowClientForm");
const btnSaveClient = document.getElementById("btnSaveClient");
const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const authMessage = document.getElementById("authMessage");
const btnLogout = document.getElementById("btnLogout");
function showAuthScreen(message = "") {
  if (authScreen) authScreen.classList.remove("hidden");
  if (appShell) appShell.classList.add("hidden");
  if (authMessage) authMessage.textContent = message;
}

function showAppScreen() {
  if (authScreen) authScreen.classList.add("hidden");
  if (appShell) appShell.classList.remove("hidden");
  if (authMessage) authMessage.textContent = "";
}
function generateClientId() {
  return "CLI-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function resetClientForm() {
  editingClientId = null;
  clientIdInput.value = "";
  clientForm.reset();
  clientIsActiveInput.value = "true";
  btnSaveClient.textContent = "Guardar cliente";
}

function getClientFormData() {
  return {
    id: editingClientId || generateClientId(),
    name: clientNameInput.value.trim(),
    taxId: clientTaxIdInput.value.trim(),
    address: clientAddressInput.value.trim(),
    city: clientCityInput.value.trim(),
    province: clientProvinceInput.value.trim(),
    postalCode: clientPostalCodeInput.value.trim(),
    phone: clientPhoneInput.value.trim(),
    email: clientEmailInput.value.trim(),
    contactPerson: clientContactPersonInput.value.trim(),
    notes: clientNotesInput.value.trim(),
    isActive: clientIsActiveInput.value === "true"
  };
}

function renderClientsTable(items = clients) {
  if (!clientsTableBody) return;

  if (!items.length) {
    clientsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">No hay clientes todavía.</td>
      </tr>
    `;
    return;
  }

  clientsTableBody.innerHTML = items.map((client) => `
    <tr>
      <td>${escapeHtml(client.name)}</td>
      <td>${escapeHtml(client.taxId || "-")}</td>
      <td>${escapeHtml(client.phone || "-")}</td>
      <td>${escapeHtml(client.email || "-")}</td>
      <td>${escapeHtml(client.contactPerson || "-")}</td>
      <td>${client.isActive ? "Activo" : "Inactivo"}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="btn-small" onclick="editClient('${client.id}')">Editar</button>
          <button type="button" class="btn-small danger" onclick="deleteClient('${client.id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}
async function loadClientsFromFirestore() {
  try {
    const q = query(clientsCollection, orderBy("name"));
    const snapshot = await getDocs(q);

    clients = snapshot.docs.map((docItem) => {
      return {
        id: docItem.id,
        ...docItem.data()
      };
    });

    renderClientsTable();
    fillProjectClientOptions();
    fillInvoiceClientOptions(invoiceClientIdInput?.value || "");
    fillInvoiceProjectOptions(invoiceClientIdInput?.value || "", invoiceProjectIdInput?.value || "");
  } catch (error) {
    console.error("Error cargando clientes desde Firestore:", error);
    alert("No se pudieron cargar los clientes desde Firestore.");
  }
}
window.printInvoice = printInvoice;
function filterClients() {
  const search = (clientSearchInput.value || "").trim().toLowerCase();

  if (!search) {
    renderClientsTable(clients);
    return;
  }

  const filtered = clients.filter((client) => {
    const text = [
      client.name,
      client.taxId,
      client.phone,
      client.email,
      client.contactPerson
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  renderClientsTable(filtered);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
const STORAGE_KEYS = {
  clients: "obrantis_clients",
  projects: "obrantis_projects",
  invoices: "obrantis_invoices"
};

function saveClientsToStorage() {
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
}

function loadClientsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.clients);
    clients = raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Error cargando clientes desde localStorage:", error);
    clients = [];
  }
}

function loadAllFromStorage() {
  loadClientsFromStorage();
  }
function editClient(id) {
  const client = clients.find((item) => item.id === id);
  if (!client) return;

  editingClientId = client.id;
  clientIdInput.value = client.id;
  clientNameInput.value = client.name || "";
  clientTaxIdInput.value = client.taxId || "";
  clientAddressInput.value = client.address || "";
  clientCityInput.value = client.city || "";
  clientProvinceInput.value = client.province || "";
  clientPostalCodeInput.value = client.postalCode || "";
  clientPhoneInput.value = client.phone || "";
  clientEmailInput.value = client.email || "";
  clientContactPersonInput.value = client.contactPerson || "";
  clientNotesInput.value = client.notes || "";
  clientIsActiveInput.value = client.isActive ? "true" : "false";
  btnSaveClient.textContent = "Actualizar cliente";

  document.getElementById("view-clients")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteClient(id) {
  const client = clients.find((item) => item.id === id);
  if (!client) return;

  const ok = window.confirm(`¿Eliminar el cliente "${client.name}"?`);
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "clients", id));

    if (editingClientId === id) {
      resetClientForm();
    }

    await loadClientsFromFirestore();
    alert("Cliente eliminado correctamente.");
  } catch (error) {
    console.error("Error eliminando cliente en Firestore:", error);
    alert("No se pudo eliminar el cliente.");
  }
}

window.editClient = editClient;
window.deleteClient = deleteClient;

if (btnShowClientForm) {
  btnShowClientForm.addEventListener("click", () => {
    document.getElementById("view-clients")?.scrollIntoView({ behavior: "smooth", block: "start" });
    clientNameInput?.focus();
  });
}

if (btnCancelClientEdit) {
  btnCancelClientEdit.addEventListener("click", () => {
    resetClientForm();
  });
}

if (clientSearchInput) {
  clientSearchInput.addEventListener("input", filterClients);
}

if (clientForm) {
  clientForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const data = getClientFormData();

    if (!data.name) {
      alert("Debes indicar el nombre del cliente.");
      return;
    }

    const payload = {
      name: data.name,
      taxId: data.taxId,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      phone: data.phone,
      email: data.email,
      contactPerson: data.contactPerson,
      notes: data.notes,
      isActive: data.isActive,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingClientId) {
        await updateDoc(doc(db, "clients", editingClientId), payload);
      } else {
        await addDoc(clientsCollection, {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }

      resetClientForm();
      await loadClientsFromFirestore();
      alert("Cliente guardado correctamente.");
    } catch (error) {
      console.error("Error guardando cliente en Firestore:", error);
      alert("No se pudo guardar el cliente en Firestore.");
    }
  });
}

renderClientsTable();
let projects = [];
let editingProjectId = null;

const projectForm = document.getElementById("projectForm");
const projectIdInput = document.getElementById("projectId");
const projectClientIdInput = document.getElementById("projectClientId");
const projectStatusInput = document.getElementById("projectStatus");
const projectNameInput = document.getElementById("projectName");
const projectReferenceInput = document.getElementById("projectReference");
const projectStartDateInput = document.getElementById("projectStartDate");
const projectEndDateInput = document.getElementById("projectEndDate");
const projectIsActiveInput = document.getElementById("projectIsActive");
const projectAddressInput = document.getElementById("projectAddress");
const projectCityInput = document.getElementById("projectCity");
const projectProvinceInput = document.getElementById("projectProvince");
const projectPostalCodeInput = document.getElementById("projectPostalCode");
const projectNotesInput = document.getElementById("projectNotes");
const projectsTableBody = document.getElementById("projectsTableBody");
const projectSearchInput = document.getElementById("projectSearch");
const btnShowProjectForm = document.getElementById("btnShowProjectForm");
const btnCancelProjectEdit = document.getElementById("btnCancelProjectEdit");
const btnSaveProject = document.getElementById("btnSaveProject");

function generateProjectId() {
  return "PROJ-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function fillProjectClientOptions(selectedClientId = "") {
  if (!projectClientIdInput) return;

  const activeClients = [...clients].sort((a, b) => a.name.localeCompare(b.name, "es"));

  let html = `<option value="">Selecciona un cliente</option>`;

  html += activeClients.map((client) => `
    <option value="${escapeHtml(client.id)}" ${client.id === selectedClientId ? "selected" : ""}>
      ${escapeHtml(client.name)}
    </option>
  `).join("");

  projectClientIdInput.innerHTML = html;
}

function resetProjectForm() {
  editingProjectId = null;
  projectIdInput.value = "";
  projectForm.reset();
  projectStatusInput.value = "Pendiente";
  projectIsActiveInput.value = "true";
  btnSaveProject.textContent = "Guardar obra";
  fillProjectClientOptions();
}

function getSelectedClientData(clientId) {
  return clients.find((client) => client.id === clientId) || null;
}

function getProjectFormData() {
  const selectedClient = getSelectedClientData(projectClientIdInput.value);

  return {
    id: editingProjectId || generateProjectId(),
    clientId: selectedClient ? selectedClient.id : "",
    clientName: selectedClient ? selectedClient.name : "",
    status: projectStatusInput.value,
    name: projectNameInput.value.trim(),
    reference: projectReferenceInput.value.trim(),
    startDate: projectStartDateInput.value,
    endDate: projectEndDateInput.value,
    isActive: projectIsActiveInput.value === "true",
    address: projectAddressInput.value.trim(),
    city: projectCityInput.value.trim(),
    province: projectProvinceInput.value.trim(),
    postalCode: projectPostalCodeInput.value.trim(),
    notes: projectNotesInput.value.trim()
  };
}

function getProjectStatusClass(status) {
  if (status === "Pendiente") return "status-badge status-pending";
  if (status === "En curso") return "status-badge status-progress";
  if (status === "Terminada") return "status-badge status-finished";
  if (status === "Cancelada") return "status-badge status-cancelled";
  return "status-badge";
}

function formatShortDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-ES");
}
async function loadImageAsDataUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function ensureObrantisLogoLoaded() {
  if (obrantisLogoDataUrl) return obrantisLogoDataUrl;

  try {
    obrantisLogoDataUrl = await loadImageAsDataUrl(OBRANTIS_LOGO_URL);
    return obrantisLogoDataUrl;
  } catch (error) {
    console.warn("No se pudo cargar el logo de OBRANTIS para el PDF:", error);
    return null;
  }
}
function renderProjectsTable(items = projects) {
  if (!projectsTableBody) return;

  if (!items.length) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-cell">No hay obras todavía.</td>
      </tr>
    `;
    return;
  }

  projectsTableBody.innerHTML = items.map((project) => `
    <tr>
      <td>${escapeHtml(project.name)}</td>
      <td>${escapeHtml(project.clientName || "-")}</td>
      <td>${escapeHtml(project.reference || "-")}</td>
      <td>${escapeHtml(project.city || "-")}</td>
      <td><span class="${getProjectStatusClass(project.status)}">${escapeHtml(project.status || "-")}</span></td>
      <td>${escapeHtml(formatShortDate(project.startDate))}</td>
      <td>${project.isActive ? "Sí" : "No"}</td>
            <td>
  <div class="row-actions">
    <button type="button" class="btn-small" onclick="editProject('${project.id}')">Editar</button>
    <button type="button" class="btn-small danger" onclick="deleteProject('${project.id}')">Eliminar</button>
  </div>
</td>
    </tr>
  `).join("");
}
async function loadProjectsFromFirestore() {
  try {
    projects = await fetchProjectsFromFirestore();
    renderProjectsTable();
    fillProjectClientOptions(projectClientIdInput ? projectClientIdInput.value : "");
  } catch (error) {
    console.error("Error cargando listado de obras:", error);
    projects = [];
    renderProjectsTable();
  }
}
function filterProjects() {
  const search = (projectSearchInput.value || "").trim().toLowerCase();

  if (!search) {
    renderProjectsTable(projects);
    return;
  }

  const filtered = projects.filter((project) => {
    const text = [
      project.name,
      project.clientName,
      project.reference,
      project.address,
      project.city,
      project.province
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  renderProjectsTable(filtered);
}

function editProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;

  editingProjectId = project.id;
  projectIdInput.value = project.id;
  fillProjectClientOptions(project.clientId || "");
  projectStatusInput.value = project.status || "Pendiente";
  projectNameInput.value = project.name || "";
  projectReferenceInput.value = project.reference || "";
  projectStartDateInput.value = project.startDate || "";
  projectEndDateInput.value = project.endDate || "";
  projectIsActiveInput.value = project.isActive ? "true" : "false";
  projectAddressInput.value = project.address || "";
  projectCityInput.value = project.city || "";
  projectProvinceInput.value = project.province || "";
  projectPostalCodeInput.value = project.postalCode || "";
  projectNotesInput.value = project.notes || "";
  btnSaveProject.textContent = "Actualizar obra";

  document.getElementById("view-projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;

  const ok = window.confirm(`¿Eliminar la obra "${project.name}"?`);
  if (!ok) return;

  try {
    await deleteProjectFromFirestore(id);

    if (editingProjectId === id) {
      resetProjectForm();
    }

    await loadProjectsFromFirestore();
    filterProjects();
  } catch (error) {
    console.error("Error eliminando obra:", error);
    alert("No se pudo eliminar la obra en Firestore.");
  }
}

window.editProject = editProject;
window.deleteProject = deleteProject;

if (btnShowProjectForm) {
  btnShowProjectForm.addEventListener("click", () => {
    fillProjectClientOptions();
    document.getElementById("view-projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    projectNameInput?.focus();
  });
}

if (btnCancelProjectEdit) {
  btnCancelProjectEdit.addEventListener("click", () => {
    resetProjectForm();
  });
}

if (projectSearchInput) {
  projectSearchInput.addEventListener("input", filterProjects);
}

if (projectForm) {
 projectForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const selectedClientId = projectClientIdInput.value;
  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;

  const data = {
    id: editingProjectId || generateProjectId(),
    clientId: selectedClient ? selectedClient.id : "",
    clientName: selectedClient ? selectedClient.name : "",
    status: projectStatusInput.value,
    name: projectNameInput.value.trim(),
    reference: projectReferenceInput.value.trim(),
    startDate: projectStartDateInput.value,
    endDate: projectEndDateInput.value,
    isActive: projectIsActiveInput.value === "true",
    address: projectAddressInput.value.trim(),
    city: projectCityInput.value.trim(),
    province: projectProvinceInput.value.trim(),
    postalCode: projectPostalCodeInput.value.trim(),
    notes: projectNotesInput.value.trim()
  };

  if (!data.clientId) {
    alert("Debes seleccionar un cliente para la obra.");
    return;
  }

  if (!data.name) {
    alert("Debes indicar el nombre o referencia de la obra.");
    return;
  }

  try {
    await saveProjectToFirestore(data);
    await loadProjectsFromFirestore();

    resetProjectForm();
    filterProjects();

    alert("Obra guardada correctamente.");
  } catch (error) {
    console.error("Error guardando obra:", error);
    alert("No se pudo guardar la obra en Firestore.");
  }
});
}

const originalResetClientForm = resetClientForm;
resetClientForm = function () {
  originalResetClientForm();
  fillProjectClientOptions();
};

const originalRenderClientsTable = renderClientsTable;
renderClientsTable = function (items = clients) {
  originalRenderClientsTable(items);
  fillProjectClientOptions(projectClientIdInput?.value || "");
};

fillProjectClientOptions();
renderProjectsTable();
let invoices = [];
let editingInvoiceId = null;
let invoiceLineCounter = 0;

const invoiceForm = document.getElementById("invoiceForm");
const invoiceIdInput = document.getElementById("invoiceId");
const invoiceNumberInput = document.getElementById("invoiceNumber");
const invoiceDateInput = document.getElementById("invoiceDate");
const invoiceClientIdInput = document.getElementById("invoiceClientId");
const invoiceProjectIdInput = document.getElementById("invoiceProjectId");
const invoiceConceptInput = document.getElementById("invoiceConcept");
const invoiceLinesContainer = document.getElementById("invoiceLinesContainer");
const btnAddInvoiceLine = document.getElementById("btnAddInvoiceLine");
const invoicePaymentStatusInput = document.getElementById("invoicePaymentStatus");
const invoicePaymentDateInput = document.getElementById("invoicePaymentDate");
const invoiceAmountPaidInput = document.getElementById("invoiceAmountPaid");
const invoicePaymentMethodInput = document.getElementById("invoicePaymentMethod");
const invoiceNotesInput = document.getElementById("invoiceNotes");
const invoiceInternalNotesInput = document.getElementById("invoiceInternalNotes");
const invoiceBaseTotalEl = document.getElementById("invoiceBaseTotal");
const invoiceVatTotalEl = document.getElementById("invoiceVatTotal");
const invoiceGrandTotalEl = document.getElementById("invoiceGrandTotal");
const invoicesTableBody = document.getElementById("invoicesTableBody");
const invoiceSearchInput = document.getElementById("invoiceSearch");
const btnShowInvoiceForm = document.getElementById("btnShowInvoiceForm");
const btnCancelInvoiceEdit = document.getElementById("btnCancelInvoiceEdit");
const btnSaveInvoice = document.getElementById("btnSaveInvoice");

function generateInvoiceId() {
  return "INV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getNextInvoiceNumber() {
  const year = String(getCurrentYear());

  const sameYearInvoices = invoices.filter((item) => {
    const numberText = String(item.invoiceNumber || "").trim();
    return numberText.startsWith(year + "-");
  });

  if (!sameYearInvoices.length) {
    return `${year}-001`;
  }

  let maxSerial = 0;

  sameYearInvoices.forEach((item) => {
    const numberText = String(item.invoiceNumber || "").trim();
    const parts = numberText.split("-");

    if (parts.length !== 2) return;
    if (parts[0] !== year) return;

    const serial = Number(parts[1]);
    if (!Number.isNaN(serial) && serial > maxSerial) {
      maxSerial = serial;
    }
  });

  const nextSerial = maxSerial + 1;
  return `${year}-${String(nextSerial).padStart(3, "0")}`;
}
function refreshNextInvoiceNumber() {
  if (!invoiceNumberInput) return;
  if (editingInvoiceId) return;

  invoiceNumberInput.value = getNextInvoiceNumber();
}
function isValidInvoiceNumberFormat(value) {
  return /^\d{4}-\d{3}$/.test(String(value || "").trim());
}
function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR"
  });
}

function addInvoiceLine(data = {}) {
  invoiceLineCounter += 1;

  const line = document.createElement("div");
  line.className = "invoice-line";
  line.dataset.lineId = String(invoiceLineCounter);

  line.innerHTML = `
    <div class="field">
      <label>Descripción</label>
      <input type="text" class="line-description" value="${escapeHtml(data.description || "")}" />
    </div>

    <div class="field">
      <label>Cantidad</label>
      <input type="number" class="line-quantity" min="0" step="0.01" value="${escapeHtml(data.quantity ?? 1)}" />
    </div>

    <div class="field">
      <label>Precio unitario</label>
      <input type="number" class="line-unit-price" min="0" step="0.01" value="${escapeHtml(data.unitPrice ?? 0)}" />
    </div>

    <div class="field">
      <label>IVA</label>
      <select class="line-vat-rate">
        <option value="0" ${Number(data.vatRate) === 0 ? "selected" : ""}>0%</option>
        <option value="4" ${Number(data.vatRate) === 4 ? "selected" : ""}>4%</option>
        <option value="10" ${Number(data.vatRate) === 10 ? "selected" : ""}>10%</option>
        <option value="21" ${Number(data.vatRate) === 21 || data.vatRate == null ? "selected" : ""}>21%</option>
      </select>
    </div>

    <button type="button" class="line-remove-btn">Quitar</button>
  `;

  invoiceLinesContainer.appendChild(line);

  line.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", updateInvoiceTotals);
    el.addEventListener("change", updateInvoiceTotals);
  });

  const removeBtn = line.querySelector(".line-remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      line.remove();
      updateInvoiceTotals();
    });
  }

  updateInvoiceTotals();
}

function getInvoiceLinesData() {
  const lines = [...document.querySelectorAll(".invoice-line")];

  return lines.map((line) => {
    const description = line.querySelector(".line-description")?.value.trim() || "";
    const quantity = Number(line.querySelector(".line-quantity")?.value || 0);
    const unitPrice = Number(line.querySelector(".line-unit-price")?.value || 0);
    const vatRate = Number(line.querySelector(".line-vat-rate")?.value || 0);
    const baseAmount = quantity * unitPrice;
    const vatAmount = baseAmount * (vatRate / 100);
    const lineTotal = baseAmount + vatAmount;

    return {
      description,
      quantity,
      unitPrice,
      vatRate,
      baseAmount,
      vatAmount,
      lineTotal
    };
  });
}

function updateInvoiceTotals() {
  const lines = getInvoiceLinesData();

  const baseTotal = lines.reduce((sum, line) => sum + Number(line.baseAmount || 0), 0);
  const vatTotal = lines.reduce((sum, line) => sum + Number(line.vatAmount || 0), 0);
  const grandTotal = baseTotal + vatTotal;

  if (invoiceBaseTotalEl) invoiceBaseTotalEl.textContent = formatCurrency(baseTotal);
  if (invoiceVatTotalEl) invoiceVatTotalEl.textContent = formatCurrency(vatTotal);
  if (invoiceGrandTotalEl) invoiceGrandTotalEl.textContent = formatCurrency(grandTotal);

  return { baseTotal, vatTotal, grandTotal, lines };
}

function fillInvoiceClientOptions(selectedClientId = "") {
  if (!invoiceClientIdInput) return;

  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name, "es"));
  let html = `<option value="">Selecciona un cliente</option>`;

  html += sortedClients.map((client) => `
    <option value="${escapeHtml(client.id)}" ${client.id === selectedClientId ? "selected" : ""}>
      ${escapeHtml(client.name)}
    </option>
  `).join("");

  invoiceClientIdInput.innerHTML = html;
}

function fillInvoiceProjectOptions(clientId = "", selectedProjectId = "") {
  if (!invoiceProjectIdInput) return;

  let html = `<option value="">Sin obra asociada</option>`;

  const filteredProjects = projects
    .filter((project) => !clientId || project.clientId === clientId)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  html += filteredProjects.map((project) => `
    <option value="${escapeHtml(project.id)}" ${project.id === selectedProjectId ? "selected" : ""}>
      ${escapeHtml(project.name)}
    </option>
  `).join("");

  invoiceProjectIdInput.innerHTML = html;
}

function resetInvoiceForm() {
  editingInvoiceId = null;
  invoiceIdInput.value = "";
  invoiceForm.reset();
  invoiceLinesContainer.innerHTML = "";
  invoicePaymentStatusInput.value = "Pendiente";
  invoiceAmountPaidInput.value = "0";
  invoiceDateInput.value = new Date().toISOString().split("T")[0];
  fillInvoiceClientOptions();
  fillInvoiceProjectOptions();
  refreshNextInvoiceNumber();
  btnSaveInvoice.textContent = "Guardar factura";
  addInvoiceLine();
  updateInvoiceTotals();
}

function getPaymentBadgeClass(status) {
  if (status === "Pendiente") return "payment-badge payment-pending";
  if (status === "Parcialmente cobrada") return "payment-badge payment-partial";
  if (status === "Cobrada") return "payment-badge payment-paid";
  if (status === "Anulada") return "payment-badge payment-cancelled";
  return "payment-badge";
}

function getInvoiceFormData() {
  const totals = updateInvoiceTotals();
  const selectedClient = clients.find((client) => client.id === invoiceClientIdInput.value) || null;
  const selectedProject = projects.find((project) => project.id === invoiceProjectIdInput.value) || null;

  return {
    id: editingInvoiceId || generateInvoiceId(),
    invoiceNumber: invoiceNumberInput.value.trim(),
    invoiceYear: invoiceNumberInput.value.trim().split("-")[0] || getCurrentYear(),
    invoiceDate: invoiceDateInput.value,
    clientId: selectedClient ? selectedClient.id : "",
    clientName: selectedClient ? selectedClient.name : "",
    projectId: selectedProject ? selectedProject.id : "",
    projectName: selectedProject ? selectedProject.name : "",
    concept: invoiceConceptInput.value.trim(),
    lines: totals.lines,
    baseTotal: totals.baseTotal,
    vatTotal: totals.vatTotal,
    totalAmount: totals.grandTotal,
    paymentStatus: invoicePaymentStatusInput.value,
    paymentDate: invoicePaymentDateInput.value,
    amountPaid: Number(invoiceAmountPaidInput.value || 0),
    paymentMethod: invoicePaymentMethodInput.value,
    notes: invoiceNotesInput.value.trim(),
    internalNotes: invoiceInternalNotesInput.value.trim()
  };
}

function renderInvoicesTable(items = invoices) {
  if (!invoicesTableBody) return;

  if (!items.length) {
    invoicesTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-cell">No hay facturas todavía.</td>
      </tr>
    `;
    return;
  }

  invoicesTableBody.innerHTML = items.map((invoice) => `
    <tr>
      <td>${escapeHtml(invoice.invoiceNumber || "-")}</td>
      <td>${escapeHtml(formatShortDate(invoice.invoiceDate))}</td>
      <td>${escapeHtml(invoice.clientName || "-")}</td>
      <td>${escapeHtml(invoice.projectName || "-")}</td>
      <td>${escapeHtml(invoice.concept || "-")}</td>
      <td>${escapeHtml(formatCurrency(invoice.baseTotal))}</td>
      <td>${escapeHtml(formatCurrency(invoice.vatTotal))}</td>
      <td>${escapeHtml(formatCurrency(invoice.totalAmount))}</td>
      <td><span class="${getPaymentBadgeClass(invoice.paymentStatus)}">${escapeHtml(invoice.paymentStatus || "-")}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" class="btn-small" onclick="printInvoice('${invoice.id}')">Imprimir</button>
          <button type="button" class="btn-small" onclick="editInvoice('${invoice.id}')">Editar</button>
          <button type="button" class="btn-small danger" onclick="deleteInvoice('${invoice.id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}
function printInvoice(id) {
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) {
    alert("No se encontró la factura.");
    return;
  }

  const linesHtml = (invoice.lines || []).map((line) => `
    <tr>
      <td>${escapeHtml(line.description || "-")}</td>
      <td style="text-align:right;">${Number(line.quantity || 0).toLocaleString("es-ES")}</td>
      <td style="text-align:right;">${formatCurrency(line.unitPrice || 0)}</td>
      <td style="text-align:right;">${Number(line.vatRate || 0)}%</td>
      <td style="text-align:right;">${formatCurrency(line.baseAmount || 0)}</td>
      <td style="text-align:right;">${formatCurrency(line.vatAmount || 0)}</td>
      <td style="text-align:right;">${formatCurrency(line.lineTotal || 0)}</td>
    </tr>
  `).join("");

  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("El navegador ha bloqueado la ventana de impresión.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${escapeHtml(invoice.invoiceNumber || "")}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 30px;
          color: #111827;
          background: #ffffff;
        }
        .sheet {
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          border-bottom: 2px solid #1f4e79;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .company h1 {
          margin: 0 0 8px;
          font-size: 28px;
          color: #1f4e79;
        }
        .company p,
        .meta p,
        .box p {
          margin: 4px 0;
          line-height: 1.4;
        }
        .observations {
  margin-top: 12px;
}

.observations p {
  margin: 4px 0;
}
        .meta {
          text-align: right;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .box {
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 14px;
        }
        .box h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #1f4e79;
        }
        .concept {
          margin-bottom: 20px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 14px;
        }
        .concept h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #1f4e79;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 10px 8px;
          font-size: 13px;
          vertical-align: top;
        }
        th {
          background: #f3f4f6;
          text-align: left;
        }
        .totals {
  width: 320px;
  margin-left: auto;
  margin-top: 18px;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  overflow: hidden;
  background: #fafafa;
}

.totals td {
  padding: 10px 14px;
  font-size: 14px;
  border-bottom: 1px solid #e7e7e7;
}

.totals tr:last-child td {
  border-bottom: none;
}

.totals tr.final td {
  background: #f1f1f1;
  font-size: 16px;
}

.totals tr.final strong {
  font-size: 18px;
}  `;
        .notes {
          margin-top: 24px;
          border-top: 1px solid #d1d5db;
          padding-top: 16px;
        }
        .notes h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #1f4e79;
        }
        @media print {
          body {
            padding: 0;
          }
          .sheet {
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
  <div class="company">
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <img
        src="logo-obrantis.png"
        alt="Logo OBRANTIS"
        style="width:90px; height:auto; object-fit:contain;"
      />
      <div>
        <h1 style="margin:0 0 6px 0;">OBRANTIS S.L.</h1>
        <p style="margin:2px 0;"><strong>Reformas y Construcción</strong></p>
        <p style="margin:2px 0;"><strong>NIF:</strong> B26636761</p>
        <p style="margin:2px 0;">Avda. Castilla-La Mancha, 22</p>
        <p style="margin:2px 0;">45200 – Illescas – Toledo</p>
        <p style="margin:2px 0;">Email: contacto@obrantis.com</p>
      </div>
    </div>
  </div>

  <div class="meta">
    <p><strong>FACTURA</strong></p>
    <p><strong>Nº:</strong> ${escapeHtml(invoice.invoiceNumber || "-")}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(formatShortDate(invoice.invoiceDate))}</p>
    <p><strong>Forma de pago:</strong> ${escapeHtml(invoice.paymentMethod || invoice.paymentType || invoice.paymentForm || "-")}</p>
    <p><strong>Estado de cobro:</strong> ${escapeHtml(invoice.paymentStatus || "-")}</p>
  </div>
</div>
        </div>

        <div class="grid">
          <div class="box">
            <h3>Cliente</h3>
            <p><strong>${escapeHtml(invoice.clientName || "-")}</strong></p>
          </div>

          <div class="box">
            <h3>Obra / Trabajo</h3>
            <p>${escapeHtml(invoice.projectName || "Sin obra asociada")}</p>
          </div>
        </div>

        <div class="concept">
          <h3>Concepto general</h3>
          <p>${escapeHtml(invoice.concept || "-")}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align:right;">Cantidad</th>
              <th style="text-align:right;">P. unitario</th>
              <th style="text-align:right;">IVA</th>
              <th style="text-align:right;">Base</th>
              <th style="text-align:right;">Cuota IVA</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml || `<tr><td colspan="7">Sin líneas</td></tr>`}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td><strong>Base imponible</strong></td>
            <td style="text-align:right;">${formatCurrency(invoice.baseTotal || 0)}</td>
          </tr>
          <tr>
            <td><strong>IVA total</strong></td>
            <td style="text-align:right;">${formatCurrency(invoice.vatTotal || 0)}</td>
          </tr>
          <tr class="final">
            <td><strong>Total factura</strong></td>
            <td style="text-align:right;">${formatCurrency(invoice.totalAmount || 0)}</td>
          </tr>
        </table>

        <div class="box observations">
  <h3>Observaciones</h3>
  <p>${escapeHtml(invoice.notes || "-")}</p>
</div>
        <div class="box" style="margin-top:16px;">
  <h3>Datos bancarios</h3>
  <p><strong>IBAN:</strong> ES6500490456942910764001</p>
  <p><strong>Titular:</strong> OBRANTIS S.L.</p>
</div>
</body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}
function filterInvoices() {
  const search = (invoiceSearchInput.value || "").trim().toLowerCase();

  if (!search) {
    renderInvoicesTable(invoices);
    return;
  }

  const filtered = invoices.filter((invoice) => {
    const text = [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.projectName,
      invoice.concept
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  renderInvoicesTable(filtered);
}

function editInvoice(id) {
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) return;

  editingInvoiceId = invoice.id;
  invoiceIdInput.value = invoice.id;
  invoiceNumberInput.value = invoice.invoiceNumber || "";
  invoiceDateInput.value = invoice.invoiceDate || "";
  fillInvoiceClientOptions(invoice.clientId || "");
  fillInvoiceProjectOptions(invoice.clientId || "", invoice.projectId || "");
  invoiceConceptInput.value = invoice.concept || "";
  invoicePaymentStatusInput.value = invoice.paymentStatus || "Pendiente";
  invoicePaymentDateInput.value = invoice.paymentDate || "";
  invoiceAmountPaidInput.value = String(invoice.amountPaid || 0);
  invoicePaymentMethodInput.value = invoice.paymentMethod || "";
  invoiceNotesInput.value = invoice.notes || "";
  invoiceInternalNotesInput.value = invoice.internalNotes || "";
  invoiceLinesContainer.innerHTML = "";

  (invoice.lines || []).forEach((line) => addInvoiceLine(line));
  if (!invoice.lines || !invoice.lines.length) addInvoiceLine();

  btnSaveInvoice.textContent = "Actualizar factura";
  updateInvoiceTotals();

  document.getElementById("view-invoices")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteInvoice(id) {
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) return;

  const ok = window.confirm(`¿Eliminar la factura "${invoice.invoiceNumber}"?`);
  if (!ok) return;

  try {
    await deleteInvoiceFromFirestore(id);

    if (editingInvoiceId === id) {
      resetInvoiceForm();
    }

    await loadInvoicesFromFirestore();
    filterInvoices();
  } catch (error) {
    console.error("Error eliminando factura:", error);
    alert("No se pudo eliminar la factura en Firestore.");
  }
}
window.editInvoice = editInvoice;
window.deleteInvoice = deleteInvoice;

if (btnAddInvoiceLine) {
  btnAddInvoiceLine.addEventListener("click", () => addInvoiceLine());
}

if (invoiceClientIdInput) {
  invoiceClientIdInput.addEventListener("change", () => {
    fillInvoiceProjectOptions(invoiceClientIdInput.value, "");
  });
}

if (btnShowInvoiceForm) {
  btnShowInvoiceForm.addEventListener("click", () => {
   resetInvoiceForm();
    document.getElementById("view-invoices")?.scrollIntoView({ behavior: "smooth", block: "start" });
    invoiceNumberInput?.focus();
  });
}

if (btnCancelInvoiceEdit) {
  btnCancelInvoiceEdit.addEventListener("click", () => {
    resetInvoiceForm();
  });
}

if (invoiceSearchInput) {
  invoiceSearchInput.addEventListener("input", filterInvoices);
}

if (invoiceForm) {
 invoiceForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const data = getInvoiceFormData();

  if (!data.invoiceNumber) {
    alert("Debes indicar el número de factura.");
    return;
  }
  if (!isValidInvoiceNumberFormat(data.invoiceNumber)) {
    alert("El número de factura debe tener este formato: 2026-001");
    return;
  }
  if (!data.invoiceDate) {
    alert("Debes indicar la fecha de factura.");
    return;
  }

  if (!data.clientId) {
    alert("Debes seleccionar un cliente.");
    return;
  }

  if (!data.lines.length || data.lines.every((line) => !line.description && !line.quantity && !line.unitPrice)) {
    alert("Debes añadir al menos una línea de factura.");
    return;
  }

  const duplicated = invoices.find((item) => {
    return String(item.invoiceNumber || "").trim() === String(data.invoiceNumber || "").trim() && item.id !== data.id;
  });
  if (duplicated) {
    alert("Ese número de factura ya existe.");
    return;
  }

  try {
    await saveInvoiceToFirestore(data);
    await loadInvoicesFromFirestore();

    resetInvoiceForm();
    filterInvoices();

    alert("Factura guardada correctamente.");
  } catch (error) {
    console.error("Error guardando factura:", error);
    alert("No se pudo guardar la factura en Firestore.");
  }
});
}

const originalResetProjectForm = resetProjectForm;
resetProjectForm = function () {
  originalResetProjectForm();
  fillInvoiceProjectOptions(invoiceClientIdInput?.value || "", invoiceProjectIdInput?.value || "");
};

const originalRenderProjectsTable = renderProjectsTable;
renderProjectsTable = function (items = projects) {
  originalRenderProjectsTable(items);
  fillInvoiceProjectOptions(invoiceClientIdInput?.value || "", invoiceProjectIdInput?.value || "");
};

const previousRenderClientsTable = renderClientsTable;
renderClientsTable = function (items = clients) {
  previousRenderClientsTable(items);
  fillInvoiceClientOptions(invoiceClientIdInput?.value || "");
  fillInvoiceProjectOptions(invoiceClientIdInput?.value || "", invoiceProjectIdInput?.value || "");
};

loadAllFromStorage();

renderClientsTable();
fillProjectClientOptions();
renderProjectsTable();
fillInvoiceClientOptions();
fillInvoiceProjectOptions();
resetInvoiceForm();
renderInvoicesTable();
if (loginForm) {
  loginForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (authMessage) authMessage.textContent = "Accediendo...";

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (loginForm) loginForm.reset();

    } catch (error) {

      console.error("Error Firebase:", error);

      let message = "No se pudo iniciar sesión.";

      if (error.code === "auth/invalid-credential") {
        message = "Correo o contraseña incorrectos.";
      } else if (error.code === "auth/user-not-found") {
        message = "Ese usuario no existe.";
      } else if (error.code === "auth/wrong-password") {
        message = "La contraseña no es correcta.";
      } else if (error.code === "auth/invalid-email") {
        message = "El correo no es válido.";
      } else if (error.code === "auth/unauthorized-domain") {
        message = "Este dominio no está autorizado en Firebase.";
      }

      if (authMessage) authMessage.textContent = message;
    }
  });
}
onAuthStateChanged(auth, async (user) => {
  console.log("Estado de autenticación:", user);

  if (user) {
    showAppScreen();
    await loadClientsFromFirestore();
    await loadProjectsFromFirestore();
    await loadInvoicesFromFirestore();
  } else {
    showAuthScreen();
    clients = [];
    projects = [];
    invoices = [];
    renderClientsTable();
    renderProjectsTable();
    renderInvoicesTable();
  }
});
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      alert("No se pudo cerrar la sesión.");
    }
  });
}
