/**
 * Teacher Dashboard & Quiz Builder JavaScript
 * QuizSpark Live Quiz Application
 */

document.addEventListener('DOMContentLoaded', () => {
  const quizForm = document.getElementById('quizForm');
  const questionsContainer = document.getElementById('questionsContainer');
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const alertContainer = document.getElementById('alertContainer');

  let questionCounter = 0;

  // Add Question Block dynamically
  if (addQuestionBtn && questionsContainer) {
    addQuestionBtn.addEventListener('click', () => {
      addQuestionBlock();
    });

    // Initialize with 1 empty question if none present
    if (questionsContainer.children.length === 0) {
      addQuestionBlock();
    }
  }

  function addQuestionBlock(data = null) {
    questionCounter++;
    const qNum = questionCounter;
    const supportedTypes = ['multiple_choice', 'true_false', 'image', 'music'];
    const qType = data && supportedTypes.includes(data.question_type) ? data.question_type : 'multiple_choice';
    const initialImg = (data && data.image_url) ? data.image_url : '';
    const initialAudio = (data && data.audio_url) ? data.audio_url : '';

    const qCard = document.createElement('div');
    qCard.className = 'question-item-card animate-pop';
    qCard.dataset.qnum = qNum;

    const optAVal = data ? escapeHtml(data.option_a) : (qType === 'true_false' ? 'True' : '');
    const optBVal = data ? escapeHtml(data.option_b) : (qType === 'true_false' ? 'False' : '');
    const optCVal = data && data.option_c ? escapeHtml(data.option_c) : '';
    const optDVal = data && data.option_d ? escapeHtml(data.option_d) : '';

    qCard.innerHTML = `
      <div class="question-item-header">
        <h4 style="color: var(--primary);">Question <span class="q-number-display">${qNum}</span></h4>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary move-up-btn" title="Move Up">↑</button>
          <button type="button" class="btn btn-secondary move-down-btn" title="Move Down">↓</button>
          <button type="button" class="btn btn-danger remove-question-btn" title="Delete Question">&times;</button>
        </div>
      </div>

      <!-- Question Type Switcher -->
      <div class="q-type-toggle" role="group" aria-label="Question type">
        <button type="button" class="q-type-btn ${qType === 'multiple_choice' ? 'active' : ''}" data-type="multiple_choice">🔷 Multiple Choice</button>
        <button type="button" class="q-type-btn ${qType === 'true_false' ? 'active' : ''}" data-type="true_false">⚖️ True / False</button>
        <button type="button" class="q-type-btn ${qType === 'image' ? 'active' : ''}" data-type="image">🖼️ Image</button>
        <button type="button" class="q-type-btn ${qType === 'music' ? 'active' : ''}" data-type="music">🎵 Music</button>
      </div>
      <input type="hidden" class="question-type-input" value="${qType}">

      <!-- Question Text -->
      <div class="form-group">
        <label class="form-label">Question Text *</label>
        <input type="text" class="form-control question-text-input" placeholder="e.g., What is the capital of France?" value="${data ? escapeHtml(data.question_text) : ''}" required>
      </div>

      <!-- Existing image upload remains available for multiple-choice questions. -->
      <div class="form-group question-upload-group" style="${qType === 'multiple_choice' ? '' : 'display: none;'}">
        <label class="form-label">Question Image (Optional)</label>
        <div class="question-media-box">
          <input type="hidden" class="question-image-input" value="${initialImg}">
          <input type="file" class="question-file-input" accept="image/png, image/jpeg, image/webp, image/gif" style="display: none;">
          
          <div class="media-preview-area">
            ${renderMediaPreviewHtml(initialImg)}
          </div>
        </div>
      </div>

      <div class="form-group question-url-group" style="${qType === 'image' ? '' : 'display: none;'}">
        <label class="form-label">Image URL *</label>
        <input type="url" class="form-control question-image-url-input" placeholder="https://example.com/question-image.jpg" value="${qType === 'image' ? escapeHtml(initialImg) : ''}" ${qType === 'image' ? 'required' : ''}>
        <div class="url-preview-area image-url-preview" aria-live="polite"></div>
      </div>

      <div class="form-group question-audio-group" style="${qType === 'music' ? '' : 'display: none;'}">
        <label class="form-label">Audio / Music URL *</label>
        <input type="url" class="form-control question-audio-url-input" placeholder="https://example.com/question-audio.mp3" value="${qType === 'music' ? escapeHtml(initialAudio) : ''}" ${qType === 'music' ? 'required' : ''}>
        <div class="url-preview-area audio-url-preview" aria-live="polite"></div>
      </div>

      <!-- Options Grid -->
      <div class="options-grid">
        <div class="form-group opt-col-a">
          <label class="form-label" style="color: var(--color-opt-a);">Option A ${qType === 'true_false' ? '(True)' : '*'} </label>
          <input type="text" class="form-control option-a-input" placeholder="Option A" value="${optAVal}" ${qType === 'true_false' ? 'readonly style="background: rgba(255,255,255,0.05);"' : ''} required>
        </div>
        <div class="form-group opt-col-b">
          <label class="form-label" style="color: var(--color-opt-b);">Option B ${qType === 'true_false' ? '(False)' : '*'} </label>
          <input type="text" class="form-control option-b-input" placeholder="Option B" value="${optBVal}" ${qType === 'true_false' ? 'readonly style="background: rgba(255,255,255,0.05);"' : ''} required>
        </div>
        <div class="form-group opt-col-c" style="${qType === 'true_false' ? 'display: none;' : ''}">
          <label class="form-label" style="color: var(--color-opt-c);">Option C *</label>
          <input type="text" class="form-control option-c-input" placeholder="Option C" value="${optCVal}" ${qType === 'true_false' ? '' : 'required'}>
        </div>
        <div class="form-group opt-col-d" style="${qType === 'true_false' ? 'display: none;' : ''}">
          <label class="form-label" style="color: var(--color-opt-d);">Option D *</label>
          <input type="text" class="form-control option-d-input" placeholder="Option D" value="${optDVal}" ${qType === 'true_false' ? '' : 'required'}>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px;">
        <div class="form-group">
          <label class="form-label">Correct Answer *</label>
          <select class="form-control correct-option-select" required>
            ${renderCorrectOptionsHtml(qType, data ? data.correct_option : 'A')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Time Limit (Seconds)</label>
          <select class="form-control time-limit-select">
            <option value="5" ${data && data.time_limit == 5 ? 'selected' : ''}>5 seconds</option>
            <option value="10" ${!data || data.time_limit == 10 ? 'selected' : ''}>10 seconds (Default)</option>
            <option value="15" ${data && data.time_limit == 15 ? 'selected' : ''}>15 seconds</option>
            <option value="20" ${data && data.time_limit == 20 ? 'selected' : ''}>20 seconds</option>
            <option value="30" ${data && data.time_limit == 30 ? 'selected' : ''}>30 seconds</option>
          </select>
        </div>
      </div>
    `;

    questionsContainer.appendChild(qCard);
    bindCardEvents(qCard);
    renumberQuestions();
  }

  function renderMediaPreviewHtml(imgUrl) {
    if (imgUrl) {
      return `
        <div class="media-preview-container">
          <img src="${escapeHtml(imgUrl)}" class="media-thumbnail" alt="Question Image Preview" onerror="this.src='../assets/img/placeholder.png';">
          <div class="media-info">
            <span class="media-filename">${escapeHtml(imgUrl.split('/').pop())}</span>
            <div style="color: var(--accent-cyan); font-size: 0.8rem; margin-top: 2px;">Image Attached</div>
          </div>
          <button type="button" class="btn btn-danger btn-sm remove-media-btn">🗑️ Remove</button>
        </div>
      `;
    } else {
      return `
        <div class="upload-prompt" style="padding: 10px;">
          <label class="upload-btn-label">
            <span style="font-size: 1.4rem;">📷</span>
            <span>Click to upload image or drag & drop (JPG, PNG, WebP)</span>
          </label>
        </div>
      `;
    }
  }

  function renderCorrectOptionsHtml(qType, selectedOption = 'A') {
    if (qType === 'true_false') {
      return `
        <option value="A" ${selectedOption === 'A' ? 'selected' : ''}>Option A (True)</option>
        <option value="B" ${selectedOption === 'B' ? 'selected' : ''}>Option B (False)</option>
      `;
    } else {
      return `
        <option value="A" ${selectedOption === 'A' ? 'selected' : ''}>A - Option A</option>
        <option value="B" ${selectedOption === 'B' ? 'selected' : ''}>B - Option B</option>
        <option value="C" ${selectedOption === 'C' ? 'selected' : ''}>C - Option C</option>
        <option value="D" ${selectedOption === 'D' ? 'selected' : ''}>D - Option D</option>
      `;
    }
  }

  function bindCardEvents(card) {
    // Delete question
    card.querySelector('.remove-question-btn').addEventListener('click', () => {
      if (questionsContainer.children.length <= 1) {
        alert('A quiz must have at least one question!');
        return;
      }
      card.remove();
      renumberQuestions();
    });

    // Move up / down
    card.querySelector('.move-up-btn').addEventListener('click', () => {
      if (card.previousElementSibling) {
        questionsContainer.insertBefore(card, card.previousElementSibling);
        renumberQuestions();
      }
    });

    card.querySelector('.move-down-btn').addEventListener('click', () => {
      if (card.nextElementSibling) {
        questionsContainer.insertBefore(card.nextElementSibling, card);
        renumberQuestions();
      }
    });

    // Question Type toggle
    const typeButtons = card.querySelectorAll('.q-type-btn');
    const typeInput = card.querySelector('.question-type-input');
    const optColC = card.querySelector('.opt-col-c');
    const optColD = card.querySelector('.opt-col-d');
    const uploadGroup = card.querySelector('.question-upload-group');
    const imageUrlGroup = card.querySelector('.question-url-group');
    const audioGroup = card.querySelector('.question-audio-group');
    const imageUrlInput = card.querySelector('.question-image-url-input');
    const audioUrlInput = card.querySelector('.question-audio-url-input');
    const imageUrlPreview = card.querySelector('.image-url-preview');
    const audioUrlPreview = card.querySelector('.audio-url-preview');
    const optAInput = card.querySelector('.option-a-input');
    const optBInput = card.querySelector('.option-b-input');
    const optCInput = card.querySelector('.option-c-input');
    const optDInput = card.querySelector('.option-d-input');
    const correctSelect = card.querySelector('.correct-option-select');

    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedType = btn.dataset.type;
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        typeInput.value = selectedType;

        uploadGroup.style.display = selectedType === 'multiple_choice' ? '' : 'none';
        imageUrlGroup.style.display = selectedType === 'image' ? '' : 'none';
        audioGroup.style.display = selectedType === 'music' ? '' : 'none';
        imageUrlInput.required = selectedType === 'image';
        audioUrlInput.required = selectedType === 'music';

        if (selectedType === 'true_false') {
          // Hide Options C & D
          optColC.style.display = 'none';
          optColD.style.display = 'none';
          optCInput.required = false;
          optDInput.required = false;

          // Set Option A & B to True & False
          optAInput.value = 'True';
          optAInput.readOnly = true;
          optAInput.style.background = 'rgba(255,255,255,0.05)';

          optBInput.value = 'False';
          optBInput.readOnly = true;
          optBInput.style.background = 'rgba(255,255,255,0.05)';

          // Update Correct Option Dropdown
          const currentCorrect = correctSelect.value === 'B' ? 'B' : 'A';
          correctSelect.innerHTML = renderCorrectOptionsHtml('true_false', currentCorrect);
        } else {
          // Show Options C & D
          optColC.style.display = '';
          optColD.style.display = '';
          optCInput.required = true;
          optDInput.required = true;

          // Unlock Option A & B
          optAInput.readOnly = false;
          optAInput.style.background = '';
          if (optAInput.value === 'True') optAInput.value = '';

          optBInput.readOnly = false;
          optBInput.style.background = '';
          if (optBInput.value === 'False') optBInput.value = '';

          // Update Correct Option Dropdown
          const currentCorrect = ['A', 'B', 'C', 'D'].includes(correctSelect.value) ? correctSelect.value : 'A';
          correctSelect.innerHTML = renderCorrectOptionsHtml('multiple_choice', currentCorrect);
        }

        renderUrlPreview('image', imageUrlInput.value.trim(), imageUrlPreview);
        renderUrlPreview('audio', audioUrlInput.value.trim(), audioUrlPreview);
      });
    });

    imageUrlInput.addEventListener('input', () => renderUrlPreview('image', imageUrlInput.value.trim(), imageUrlPreview));
    audioUrlInput.addEventListener('input', () => renderUrlPreview('audio', audioUrlInput.value.trim(), audioUrlPreview));
    renderUrlPreview('image', imageUrlInput.value.trim(), imageUrlPreview);
    renderUrlPreview('audio', audioUrlInput.value.trim(), audioUrlPreview);

    function renderUrlPreview(kind, url, target) {
      if (!url) {
        target.innerHTML = '';
        return;
      }

      target.innerHTML = '';
      if (kind === 'image') {
        const img = document.createElement('img');
        img.className = 'url-image-preview';
        img.alt = 'Image URL preview';

        const errSpan = document.createElement('span');
        errSpan.className = 'media-url-error';
        errSpan.textContent = '⚠️ Unable to load this image URL. Please check the link.';
        errSpan.style.display = 'none';

        img.onload = () => { errSpan.style.display = 'none'; img.style.display = 'block'; };
        img.onerror = () => { errSpan.style.display = 'block'; img.style.display = 'none'; };
        img.src = url;

        target.appendChild(img);
        target.appendChild(errSpan);
      } else {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'metadata';

        const errSpan = document.createElement('span');
        errSpan.className = 'media-url-error';
        errSpan.textContent = '⚠️ Unable to load this audio URL. Please check the link.';
        errSpan.style.display = 'none';

        audio.oncanplay = () => { errSpan.style.display = 'none'; };
        audio.onerror = () => { errSpan.style.display = 'block'; };
        audio.src = url;

        target.appendChild(audio);
        target.appendChild(errSpan);
      }
    }

    // Media Uploader Events
    const mediaBox = card.querySelector('.question-media-box');
    const fileInput = card.querySelector('.question-file-input');
    const imageInput = card.querySelector('.question-image-input');
    const previewArea = card.querySelector('.media-preview-area');

    // Click to upload
    previewArea.addEventListener('click', (e) => {
      if (e.target.closest('.remove-media-btn')) {
        imageInput.value = '';
        fileInput.value = '';
        previewArea.innerHTML = renderMediaPreviewHtml('');
        return;
      }
      fileInput.click();
    });

    // File change handler
    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files[0]) {
        await uploadFile(fileInput.files[0]);
      }
    });

    // Drag & Drop
    mediaBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      mediaBox.classList.add('dragover');
    });

    mediaBox.addEventListener('dragleave', () => {
      mediaBox.classList.remove('dragover');
    });

    mediaBox.addEventListener('drop', async (e) => {
      e.preventDefault();
      mediaBox.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await uploadFile(e.dataTransfer.files[0]);
      }
    });

    async function uploadFile(file) {
      previewArea.innerHTML = `
        <div style="padding: 12px; color: var(--primary);">
          ⏳ Uploading image (${escapeHtml(file.name)})...
        </div>
      `;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('../api/upload/image.php', {
          method: 'POST',
          body: formData
        });
        const resData = await res.json();

        if (resData.success && resData.data.url) {
          imageInput.value = resData.data.url;
          previewArea.innerHTML = renderMediaPreviewHtml(resData.data.url);
        } else {
          alert(resData.message || 'Image upload failed.');
          previewArea.innerHTML = renderMediaPreviewHtml(imageInput.value);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Failed to upload image. Please try again.');
        previewArea.innerHTML = renderMediaPreviewHtml(imageInput.value);
      }
    }
  }

  function renumberQuestions() {
    Array.from(questionsContainer.children).forEach((card, index) => {
      const numSpan = card.querySelector('.q-number-display');
      if (numSpan) numSpan.textContent = index + 1;
    });
  }

  // Handle Form Submit for Create / Update Quiz
  if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const category = document.getElementById('category').value.trim();
      const quizId = document.getElementById('quiz_id') ? document.getElementById('quiz_id').value : null;

      const questionCards = Array.from(questionsContainer.children);
      if (questionCards.length === 0) {
        showAlert('Please add at least one question.', 'danger');
        return;
      }

      const questions = questionCards.map((card, index) => {
        const qType = card.querySelector('.question-type-input').value;
        const qText = card.querySelector('.question-text-input').value.trim();
        const imageUrl = qType === 'image'
          ? card.querySelector('.question-image-url-input').value.trim()
          : card.querySelector('.question-image-input').value.trim();
        const audioUrl = qType === 'music'
          ? card.querySelector('.question-audio-url-input').value.trim()
          : '';
        const optA = card.querySelector('.option-a-input').value.trim();
        const optB = card.querySelector('.option-b-input').value.trim();
        const optC = qType === 'true_false' ? null : card.querySelector('.option-c-input').value.trim();
        const optD = qType === 'true_false' ? null : card.querySelector('.option-d-input').value.trim();
        const correct = card.querySelector('.correct-option-select').value;
        const timeLimit = parseInt(card.querySelector('.time-limit-select').value) || 10;

        return {
          question_number: index + 1,
          question_type: qType,
          question_text: qText,
          image_url: imageUrl || null,
          audio_url: audioUrl || null,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_option: correct,
          time_limit: timeLimit
        };
      });

      const submitBtn = quizForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving Quiz...';

      const endpoint = quizId ? '../api/quiz/update.php' : '../api/quiz/create.php';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quizId,
            title,
            description,
            category,
            questions
          })
        });

        const data = await response.json();

        if (data.success) {
          showAlert(data.message, 'success');
          setTimeout(() => {
            window.location.href = '../teacher/quizzes.php';
          }, 1000);
        } else {
          showAlert(data.message || 'Failed to save quiz.', 'danger');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Quiz';
        }
      } catch (err) {
        console.error('Quiz save error:', err);
        showAlert('Network error saving quiz.', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Quiz';
      }
    });
  }

  // Delete Quiz Handler
  window.deleteQuiz = async function(quizId) {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('../api/quiz/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId })
      });

      const data = await response.json();
      if (data.success) {
        location.reload();
      } else {
        alert(data.message || 'Failed to delete quiz.');
      }
    } catch (err) {
      alert('Error deleting quiz.');
    }
  };

  // Helper Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function showAlert(message, type) {
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-${type} animate-pop">
          <span>${message}</span>
        </div>
      `;
    }
  }

  // Expose function for pre-filling edit forms
  window.loadQuestionsForEdit = function(questionsArray) {
    if (!questionsContainer) return;
    questionsContainer.innerHTML = '';
    questionCounter = 0;
    questionsArray.forEach(q => addQuestionBlock(q));
  };
});
