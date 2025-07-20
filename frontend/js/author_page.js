import api from "./api.js";
import { $, toast } from "./utils.js";

const qs = new URLSearchParams(location.search);
const authorId = qs.get("id");
let existingBooks = [];   // books already on server
let pendingBooks = [];    // added or edited locally

/* ---------- DOM refs ---------- */
const pageTitle = $("#page-title");
const form = $("#author-form");
const booksTbody = $("#books-table tbody");
const btnAddBook = $("#btn-add-book");
const btnSave = $("#btn-save");
const btnCancel = $("#btn-cancel");

const modal = $("#book-modal");
const modalForm = $("#book-form");
const modalCancel = $("#modal-cancel");
const genreSelect = modalForm.genre;

/* ---------- modal helpers ---------- */
function openModal(prefill = null, rowIdx = null) {
  modal.classList.add("open");
  modalForm.reset();
  modalForm.dataset.rowIdx = rowIdx ?? "";
  if (prefill) {
    modalForm.title.value = prefill.title;
    modalForm.pages.value = prefill.pages;
    modalForm.genre.value = prefill.genre;
    $("#modal-title").textContent = "Отредактировать книгу";
    $("#modal-submit").textContent = "Обновить";
  } else {
    $("#modal-title").textContent = "Добавить книгу";
    $("#modal-submit").textContent = "Добавить";
  }
}

function closeModal() {
  modal.classList.remove("open");
}

/* ---------- render ---------- */
function renderBooks() {
  const all = [...existingBooks, ...pendingBooks]
    .filter((b) => !b._delete);
  booksTbody.innerHTML = all
    .map(
      (b, i) => `<tr data-idx="${i}">
        <td>${b.title}</td>
        <td>${b.pages}</td>
        <td>${b.genre}</td>
        <td>
          <button class="edit">✏</button>
          <button class="remove danger">✖</button>
        </td>
      </tr>`
    )
    .join("");
}

/* ---------- initial load ---------- */
(async function init() {
  try {
    genreSelect.innerHTML = (await api.get("/genres"))
      .map((g) => `<option>${g}</option>`)
      .join("");

    if (authorId) {
      const a = await api.get(`/authors/${authorId}`);
      pageTitle.textContent = `${a.first_name} ${a.last_name}`;

      form.last_name.value   = a.last_name;
      form.first_name.value  = a.first_name;
      form.patronymic.value  = a.patronymic ?? "";
      form.birth_date.value  = a.birth_date;

      existingBooks = Array.isArray(a.books) ? a.books : [];
      renderBooks();
    } else {
      pageTitle.textContent = "Новый автор";
    }
  } catch (e) {
    toast(e.message);
  }
})();

/* ---------- modal events ---------- */
btnAddBook.onclick = () => openModal();
modalCancel.onclick = closeModal;

modalForm.onsubmit = (e) => {
  e.preventDefault();
  if (!modalForm.reportValidity()) return;

  const book = {
    title: modalForm.title.value.trim(),
    pages: Number(modalForm.pages.value),
    genre: modalForm.genre.value,
  };

  const rowIdx = modalForm.dataset.rowIdx;
  if (rowIdx !== "") {
    if (rowIdx < existingBooks.length) existingBooks[rowIdx] = book;
    else pendingBooks[rowIdx - existingBooks.length] = book;
  } else {
    pendingBooks.push(book);
  }
  renderBooks();
  closeModal();
};

/* ---------- table click ---------- */
booksTbody.addEventListener("click", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const idx = Number(tr.dataset.idx);
  const all = [...existingBooks, ...pendingBooks];

  if (e.target.matches(".edit")) {
    openModal(all[idx], idx);
  }

  if (e.target.matches(".remove")) {
    if (idx < existingBooks.length) {
      const removed = existingBooks.splice(idx, 1)[0];
      // mark DB book for deletion
      removed._delete = true;
      pendingBooks.push(removed);
    } else {
      pendingBooks.splice(idx - existingBooks.length, 1);
    }

    renderBooks();
  }
});

/* ---------- save / cancel ---------- */
btnSave.onclick = async () => {
  if (!form.reportValidity()) return;

  if (!confirm("Сохранить все изменения?")) return;

  const authorPayload = {
    last_name: form.last_name.value.trim(),
    first_name: form.first_name.value.trim(),
    patronymic: form.patronymic.value.trim() || null,
    birth_date: form.birth_date.value,
    books: [...existingBooks, ...pendingBooks].filter((b) => !b._delete),
  };

  try {
    if (authorId) await api.put(`/authors/${authorId}`, authorPayload);
    else await api.post("/authors", authorPayload);
    location.href = "index.html";
  } catch (e) {
    toast(e.message);
  }
};

btnCancel.onclick = () => history.back();
