import api from "./api.js";
import { $, isoToUi, toast } from "./utils.js";

const tbody = $("#books-table tbody");
const filterAuthor = $("#filter-author");
const filterGenre = $("#filter-genre");

let books = [];

async function loadFilters() {
  const [authors, genres] = await Promise.all([
    api.get("/authors"),
    api.get("/genres"),
  ]);

  filterAuthor.insertAdjacentHTML(
    "beforeend",
    authors.map((a) => `<option value="${a.id}">${a.first_name} ${a.last_name}</option>`).join("")
  );
  filterGenre.insertAdjacentHTML(
    "beforeend",
    genres.map((g) => `<option>${g}</option>`).join("")
  );
}

function renderTable() {
  const aId = filterAuthor.value;
  const g = filterGenre.value;
  tbody.innerHTML = books
    .filter(
      (b) =>
        (!aId || b.author_id == aId) && (!g || b.genre === g)
    )
    .map(
      (b) => `<tr>
        <td>${b.title}</td>
        <td>${b.pages}</td>
        <td>${b.genre}</td>
        <td>${b.author_name}</td>
      </tr>`
    )
    .join("");
}

async function loadBooks() {
  try {
    const [bookList, authorList] = await Promise.all([
      api.get("/books"),
      api.get("/authors"),
    ]);
    const idToName = Object.fromEntries(
      authorList.map((a) => [a.id, `${a.first_name} ${a.last_name}`])
    );
    books = bookList.map((b) => ({
      ...b,
      author_name: idToName[b.author_id] ?? "—",
    }));
    renderTable();
  } catch (err) {
    toast(err.message);
  }
}

filterAuthor.onchange = renderTable;
filterGenre.onchange = renderTable;

await loadFilters();
await loadBooks();
