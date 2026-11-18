document.addEventListener('DOMContentLoaded', () => {
  const id = localStorage.getItem('id');
  if (id === null) {
    location.href = '/login';
    return
  }
  document.querySelector('#id').textContent = `ID: ${id}`
  document.querySelector('#id_input').value = id
})