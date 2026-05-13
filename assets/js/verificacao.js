const verificationForm = document.getElementById('verificationForm');
const toast = document.getElementById('toast');
const btn = document.getElementById('btnSubmit');
const progressBar = document.getElementById('progressBar').querySelector('span');
const successPanel = document.getElementById('successPanel');
const dropZones = [
  { id: 'youtubeDrop', preview: 'youtubePreview', name: 'youtubeProof' },
  { id: 'instagramDrop', preview: 'instagramPreview', name: 'instagramProof' },
  { id: 'tiktokDrop', preview: 'tiktokPreview', name: 'tiktokProof' }
];
const fileStore = {};

const CONFIG = {
  CLOUD_NAME: 'dgj5l53mw',
  UPLOAD_PRESET: 'kvn6gum3',
  API_KEY: '926288465169768'
};

async function uploadProofImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CONFIG.UPLOAD_PRESET);
  fd.append('api_key', CONFIG.API_KEY);
  fd.append('folder', 'verificacao_prints');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload Cloudinary falhou: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary retornou resposta inválida.');
  }

  return data.secure_url;
}

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 250);
  }
  dropZones.forEach((zone) => setupDropZone(zone));
});

function setupDropZone(zone) {
  const dropElement = document.getElementById(zone.id);
  const previewElement = document.getElementById(zone.preview);
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.name = zone.name;
  input.className = 'hidden';

  dropElement.appendChild(input);

  dropElement.addEventListener('click', () => input.click());
  input.addEventListener('change', (event) => handleFiles(event.target.files, zone, previewElement));

  dropElement.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropElement.classList.add('active');
  });

  dropElement.addEventListener('dragleave', () => dropElement.classList.remove('active'));

  dropElement.addEventListener('drop', (event) => {
    event.preventDefault();
    dropElement.classList.remove('active');
    handleFiles(event.dataTransfer.files, zone, previewElement);
  });
}

function handleFiles(files, zone, previewElement) {
  if (!files.length) return;
  const file = files[0];
  if (!file.type.startsWith('image/')) {
    showToast('Apenas imagens são permitidas.');
    return;
  }

  fileStore[zone.name] = file;
  const reader = new FileReader();
  reader.onload = () => {
    previewElement.innerHTML = `<img src="${reader.result}" alt="Preview do upload">`;
  };
  reader.readAsDataURL(file);
}

verificationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!verificationForm.checkValidity()) {
    showToast('Preencha todos os campos corretamente.');
    return;
  }

  if (!fileStore.youtubeProof || !fileStore.instagramProof || !fileStore.tiktokProof) {
    showToast('Envie prints para todas as redes.');
    return;
  }

  const confirmFollow = document.getElementById('confirmFollow');
  if (!confirmFollow.checked) {
    showToast('Você precisa confirmar que segue todas as redes.');
    return;
  }

  sendVerificationEmail(verificationForm);
});

function sendVerificationEmail(form) {
  const serviceID = 'serviço_de_solicitação';
  const templateID = 'template_de_solicitação';

  progressBar.style.width = '0%';
  successPanel.classList.add('hidden');
  setButtonLoading(true, 'PROCESSANDO...');
  showToast('Enviando verificação...', false);

  const progressInterval = simulateProgress();

  Promise.all([
    uploadProofImage(fileStore.youtubeProof),
    uploadProofImage(fileStore.instagramProof),
    uploadProofImage(fileStore.tiktokProof)
  ])
    .then(([youtubeUrl, instagramUrl, tiktokUrl]) => {
      return emailjs.send(serviceID, templateID, {
        user_name: form.user_name.value,
        user_email: form.user_email.value,
        user_instagram: form.user_instagram.value,
        user_tiktok: form.user_tiktok.value,
        user_youtube: form.user_youtube.value,
        user_message: form.user_message.value,
        youtube_print: youtubeUrl,
        instagram_print: instagramUrl,
        tiktok_print: tiktokUrl
      });
    })
    .then(() => {
      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      setButtonLoading(false, 'SOLICITAR ACESSO');
      form.reset();
      Object.keys(fileStore).forEach((key) => delete fileStore[key]);
      document.getElementById('youtubePreview').innerHTML = '';
      document.getElementById('instagramPreview').innerHTML = '';
      document.getElementById('tiktokPreview').innerHTML = '';
      successPanel.classList.remove('hidden');
      showToast('Verificação enviada! Em breve analisaremos seus dados.');
    })
    .catch((error) => {
      clearInterval(progressInterval);
      setButtonLoading(false, 'SOLICITAR ACESSO');
      console.error('Erro de envio:', error);
      showToast('Erro ao enviar. Verifique sua conexão ou tente novamente.');
    });
}

function simulateProgress() {
  let progress = 0;
  return setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 12 + 8);
    progressBar.style.width = `${progress}%`;
  }, 280);
}

function setButtonLoading(isLoading, text) {
  btn.innerText = text;
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? '0.7' : '1';
}

function showToast(message, autoHide = true) {
  toast.textContent = message;
  toast.classList.add('show');
  toast.classList.remove('hidden');
  if (!autoHide) return;
  clearTimeout(toast.dismissTimeout);
  toast.dismissTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 280);
  }, 3200);
}
