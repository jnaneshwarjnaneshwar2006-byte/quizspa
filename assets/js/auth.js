/**
 * Teacher Authentication JavaScript Handler
 * fahh Live Quiz Application
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const alertContainer = document.getElementById('alertContainer');
  const loginBtn = document.getElementById('loginBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const csrfToken = document.getElementById('csrfToken') ? document.getElementById('csrfToken').value : '';

      if (!email || !password) {
        showAlert('Please enter both email and password.', 'danger');
        return;
      }

      // UI Loading state
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span>Logging in...</span>';
      alertContainer.innerHTML = '';

      try {
        const response = await fetch('../api/auth/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ email, password, csrf_token: csrfToken })
        });

        const data = await response.json();

        if (data.success) {
          showAlert('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = '../teacher/dashboard.php';
          }, 800);
        } else {
          showAlert(data.message || 'Invalid login credentials.', 'danger');
          loginBtn.disabled = false;
          loginBtn.innerHTML = 'Login to Dashboard';
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Network error. Please try again.', 'danger');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login to Dashboard';
      }
    });
  }

  function showAlert(message, type) {
    alertContainer.innerHTML = `
      <div class="alert alert-${type} animate-pop">
        <span>${message}</span>
      </div>
    `;
  }
});
