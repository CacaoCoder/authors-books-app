import api from "./api.js";
import { $, isoToUi, toast } from "./utils.js";

const tbody = $("#authors-table tbody");
const newBtn = $("#btn-new");

newBtn.onclick = () => (location.href = "author.html");

async function loadAuthors() {
  try {
    const authors = await api.get("/authors");
    tbody.innerHTML = authors
  .map(
    (a) => {
      const count = Array.isArray(a.books) ? a.books.length : 0;
      return `<tr data-id="${a.id}">
        <td>${a.last_name}</td>
        <td>${a.first_name}</td>
        <td>${isoToUi(a.birth_date)}</td>
        <td>${count}</td>
        <td>
          <button class="details">Детали</button>
          <button class="delete danger">Удалить</button>
        </td>
      </tr>`;
    }
  )
  .join("");
  } catch (err) {
    toast(err.message);
  }
}

tbody.addEventListener("click", async (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;
  if (e.target.matches(".details")) {
    location.href = `author.html?id=${id}`;
  }

  if (e.target.matches(".delete")) {
    if (!confirm("Удалить автора?")) return;
    try {
      await api.del(`/authors/${id}`);
      tr.remove();
    } catch (err) {
      toast(err.message);
    }
  }
});

loadAuthors();
