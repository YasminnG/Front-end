const cadastroForm = document.getElementById('cadastro-form');

cadastroForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('cadastro-email').value;
  const senha = document.getElementById('cadastro-senha').value;

  try {
    const response = await fetch('http://localhost:3000/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Cadastro ok → redireciona para Tela 4
      window.location.href = '../Tela 4/index.html';
    } else {
      alert(data.msg);
    }
  } catch (err) {
    alert('Erro ao conectar com o servidor');
  }
});
