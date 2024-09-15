// Obsługa logowania
const loginForm = document.getElementById('login-form');
const commentsContainer = document.getElementById('comments-container');
const loginContainer = document.getElementById('login-container');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    if (response.ok) {
        loginContainer.style.display = 'none';
        commentsContainer.style.display = 'block';
        loadComments();
    } else {
        errorMessage.style.display = 'block';
    }
});

// Obsługa dodawania komentarza
const commentForm = document.getElementById('comment-form');

commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const player = document.getElementById('player').value;
    const comment = document.getElementById('comment').value;

    const response = await fetch('/add-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player, comment }),
    });

    if (response.ok) {
        loadComments(); // Odśwież listę komentarzy
        document.getElementById('player').value = '';
        document.getElementById('comment').value = '';
    } else {
        alert('Wystąpił błąd podczas dodawania komentarza.');
    }
});

// Funkcja do ładowania komentarzy
async function loadComments() {
    const response = await fetch('/comments');
    if (response.ok) {
        const comments = await response.json();
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';

        for (const [player, comment] of Object.entries(comments)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${player}: ${comment} `;
            
            // Dodaj przycisk do usuwania
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Usuń';
            deleteButton.addEventListener('click', async () => {
                const deleteResponse = await fetch('/delete-comment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ player }),
                });

                if (deleteResponse.ok) {
                    loadComments(); // Odśwież listę komentarzy
                } else {
                    alert('Wystąpił błąd podczas usuwania komentarza.');
                }
            });

            listItem.appendChild(deleteButton);
            commentsList.appendChild(listItem);
        }
    } else {
        alert('Wystąpił błąd podczas ładowania komentarzy.');
    }
}
