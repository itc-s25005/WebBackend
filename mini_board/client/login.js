document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', () => {
    const id = document.querySelector('#id_input').value;
    localStorage.setItem('id', id);
    location.href = '/';
  })
})